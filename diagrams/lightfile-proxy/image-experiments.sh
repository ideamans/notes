#!/usr/bin/env bash
# 詳説 LightFile Proxy (5) の検証画像を作り直す。
# 元画像（いずれも Wikimedia Commons）
#   sunflower.jpg  "Sunflower - macro shot1.jpg" 撮影 Christopher Carfi / CC BY 2.0
#   product.jpg    "HK SKD Po Lam MCL two Central mall shop 包浩斯 Bauhaus 手袋
#                   handbag store window display May 2024 R12S 02.jpg" 撮影 Chayquo Shumo / CC0
#   macaw.jpg      "Scarlet Macaw (259007229).jpeg" 撮影 Choi Yunhyok / CC BY 3.0
# 必要なもの: imagemagick, webp（brew install imagemagick webp）
set -euo pipefail
cd "$(dirname "$0")"
OUT="../../public/posts/2026/lightfile-proxy-image-quality"
P3="/System/Library/ColorSync/Profiles/Display P3.icc"
SRC="macaw.jpg"
W=$(mktemp -d)
trap 'rm -rf "$W"' EXIT

# ICC プロファイルの有無で色が変わることを示す2組
for name in sunflower:flower product:product; do
  src="${name%%:*}.jpg"; out="${name##*:}"
  magick "$src" -auto-orient -resize 480x -profile "$P3" -quality 92 "$W/$out-p3.jpg"
  cwebp -q 80 -metadata icc  "$W/$out-p3.jpg" -o "$OUT/icc-$out-kept.webp"
  cwebp -q 80 -metadata none "$W/$out-p3.jpg" -o "$OUT/icc-$out-dropped.webp"
done

# EXIF の回転（orientation 6。スマホを縦に構えて撮ったときの典型）
magick "$SRC" -auto-orient -resize 300x450^ -gravity center -extent 300x450 -quality 90 "$W/upright.jpg"
magick "$W/upright.jpg" -rotate -90 -strip -quality 90 "$W/rotated.jpg"
python3 - "$W" "$OUT" <<'PY'
import struct, subprocess, sys
work, out = sys.argv[1], sys.argv[2]

def exif_app1(orientation):
    tiff = b'MM' + struct.pack('>H', 42) + struct.pack('>I', 8)
    tiff += struct.pack('>H', 1)
    tiff += struct.pack('>HHI', 0x0112, 3, 1) + struct.pack('>HH', orientation, 0)
    tiff += struct.pack('>I', 0)
    payload = b'Exif\x00\x00' + tiff
    return b'\xff\xe1' + struct.pack('>H', len(payload) + 2) + payload

d = open(f'{work}/rotated.jpg', 'rb').read()
open(f'{out}/exif-original.jpg', 'wb').write(d[:2] + exif_app1(6) + d[2:])
# 回転情報をそのままWebPへ持ち込んだもの（ブラウザは無視するので横倒しになる）
subprocess.run(['cwebp', '-q', '80', '-metadata', 'all',
                f'{out}/exif-original.jpg', '-o', f'{out}/exif-webp-with-orientation.webp'], check=True)
# 画素を正立させてから変換したもの（LightFile Proxy の方式）
subprocess.run(['magick', f'{out}/exif-original.jpg', '-auto-orient', f'{work}/upright.png'], check=True)
subprocess.run(['cwebp', '-q', '80', '-metadata', 'icc',
                f'{work}/upright.png', '-o', f'{out}/exif-webp-resolved.webp'], check=True)
PY

# 記事に並べる変換前後の作例（JPEG・PNG・GIFアニメーション）
magick "$SRC" -auto-orient -resize 700x -gravity center -crop 420x300+0+0 +repage \
  -quality 88 "$OUT/sample-jpeg.jpg"
cwebp -q 80 -metadata icc "$OUT/sample-jpeg.jpg" -o "$OUT/sample-jpeg.webp" >/dev/null 2>&1

magick "$SRC" -auto-orient -resize 420x420^ -gravity center -extent 420x420 \
  \( +clone -alpha extract -fill black -colorize 100 -fill white -draw "circle 210,210 210,20" \) \
  -alpha off -compose copy_opacity -composite "$OUT/sample-png.png"
cwebp -lossless -metadata icc "$OUT/sample-png.png" -o "$OUT/sample-png.webp" >/dev/null 2>&1
dwebp "$OUT/sample-png.webp" -o "$W/circle-restored.png" >/dev/null 2>&1
echo -n "PNG往復の画素差（0なら完全一致）: "
magick compare -metric AE "$OUT/sample-png.png" "$W/circle-restored.png" null: 2>&1 || true
echo

for i in 0 1 2 3 4 5 6 7; do
  magick "$SRC" -auto-orient -resize 700x -crop "320x240+$((60 + i * 55))+240" +repage "$W/f$i.png"
done
magick -delay 14 -loop 0 "$W"/f[0-7].png -colors 128 "$OUT/sample-gif.gif"
gif2webp "$OUT/sample-gif.gif" -o "$OUT/sample-gif.webp" >/dev/null 2>&1

for pair in sample-jpeg.jpg:sample-jpeg.webp sample-png.png:sample-png.webp sample-gif.gif:sample-gif.webp; do
  a="$OUT/${pair%%:*}"; b="$OUT/${pair##*:}"
  x=$(stat -f%z "$a"); y=$(stat -f%z "$b")
  printf '%s: %d → %d バイト（%d%%減）\n' "${pair%%:*}" "$x" "$y" $(( (x - y) * 100 / x ))
done
cwebp -q 75 "$OUT/sample-jpeg.jpg" -o "$W/q75.webp" >/dev/null 2>&1
echo "作例のJPEGを quality 75 で変換すると $(stat -f%z "$W/q75.webp") バイト"
