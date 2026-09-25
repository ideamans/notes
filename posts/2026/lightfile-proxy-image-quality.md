---
title: 詳説 LightFile Proxy (5) WebP化によるデータ削減で見た目は劣化するか
description: LightFile Proxyの変換はオリジナルのフォーマットで変わる。JPEGはquality 80の非可逆、PNGとGIFは可逆で、PNGは往復させても1画素も違わない。実際に問題が起きやすいのは画質ではなくメタデータのほうで、ICCプロファイルを落とすと色がくすみ、EXIFの回転情報はWebPでは無視される。実際の画像で確かめた。
id: miyanaga
date: 2026-09-29 08:00:00
categories:
  - image-fitness
  - technology
draft: true
---

LightFile ProxyはCloudFrontの後ろに入り、画像をWebPに変換して配信する。システムと運用に手を入れずに導入できるが、勝手に変換されるのだから画質がどうなるかは気になるところだと思う。

結論を先に書くと、PNGは1画素も変わらず、JPEGはquality 80で変換する。そして実際に問題が起きやすいのは画質そのものではなく、**画像に付いているメタデータ**のほうだった。実際の画像で確かめながら説明したい。

<SeriesNav id="lightfile-proxy" />

[[toc]]

---

## 変換のしかたはオリジナルのフォーマットで変わる

WebPには**可逆**（lossless）と**非可逆**（lossy）の両方のモードがあり、アニメーションと透過も扱える。LightFile Proxyは、オリジナルがどのフォーマットかによってこれを使い分ける。

| オリジナル | WebPへの変換 | 往復させたとき | アニメーション | 透過 |
|---|---|---|---|---|
| JPEG | quality 80の非可逆 | 画素は元に戻らない | — | — |
| PNG | 可逆 | 1画素も違わない | APNGには非対応 | そのまま保つ |
| GIF | 可逆 | 1画素も違わない | そのまま保つ | そのまま保つ |

透過はWebP側の制約にならない。WebPは非可逆の圧縮とアルファチャンネルを併用できるので、どのモードで変換しても透明な部分は失われない。

### オリジナルがJPEGの場合

**quality 80の非可逆で変換する。** 元のJPEGがすでに非可逆なので、変換するとさらに情報は落ちる。WebPからJPEGへ往復させても、画素は元に戻らない。

コンゴウインコの羽根を実際に変換してみる。

| オリジナルのJPEG 82,633バイト | WebP quality 80 20,518バイト（75%減）|
|---|---|
| <img src="/posts/2026/lightfile-proxy-image-quality/sample-jpeg.jpg" alt="コンゴウインコの顔の接写。オリジナルのJPEG" width="420" height="300" /> | <img src="/posts/2026/lightfile-proxy-image-quality/sample-jpeg.webp" alt="同じ写真をquality 80でWebPに変換したもの。オリジナルと見分けがつかない" width="420" height="300" /> |

羽毛の1本ずつや、くちばしの周りの細かい斑まで、見分けはつかないと思う。

品質の値は固定していて、サイトごとに変えられるようにはしていない。`cwebp`の既定値である75で、元のJPEGと人間の目には見分けのつかない変換ができるためだ。LightFile Proxyは保険としてさらに1段上げ、80を使っている。この写真なら75で16,034バイトなので、1段上げても増えるのは4,500バイトほどになる。

### オリジナルがPNGの場合

**可逆で変換する。** 可逆というのは、WebPに変換したものをPNGに戻すと元のPNGと完全に一致するという意味になる。透過を含むPNGで並べてみる。

| オリジナルのPNG 376,704バイト | 可逆WebP 169,680バイト（54%減）|
|---|---|
| <img src="/posts/2026/lightfile-proxy-image-quality/sample-png.png" alt="コンゴウインコの顔を円形に切り抜いた透過PNG" width="420" height="420" /> | <img src="/posts/2026/lightfile-proxy-image-quality/sample-png.webp" alt="同じ画像を可逆でWebPに変換したもの。円の外側の透過も保たれている" width="420" height="420" /> |

見た目が同じなのは当然として、円の外側の透明な部分もそのまま残っている。往復させて画素を比べても違いは出ない。

```
$ cwebp -lossless -metadata icc circle.png -o circle.webp
$ dwebp circle.webp -o circle-restored.png
$ magick compare -metric AE circle.png circle-restored.png null:
0
```

違う画素は0個だった。

ロゴ、イラスト、図表、透過を含む画像はPNGで置かれていることが多く、もともと劣化を嫌って選ばれている。ここを非可逆にはしない。

ただしアニメーションPNG（APNG）には対応していない。変換に使っている`cwebp`が最初のコマだけを読むので、動かない画像になる。APNGを使っているなら、変換の対象から外す設定にしておきたい。

### オリジナルがGIFの場合

**可逆で変換し、アニメーションと透過も保つ。** 変換にはlibwebpの`gif2webp`を既定のオプションで使っていて、`gif2webp -h`に「lossless compression by default」とあるとおり、こちらも可逆になる。アニメーションが静止画に潰れることもない。

8コマのアニメーションGIFで試した。

| オリジナルのGIF 483,574バイト | WebP 280,118バイト（42%減）|
|---|---|
| <img src="/posts/2026/lightfile-proxy-image-quality/sample-gif.gif" alt="コンゴウインコの羽根を横へパンする8コマのアニメーションGIF" width="320" height="240" /> | <img src="/posts/2026/lightfile-proxy-image-quality/sample-gif.webp" alt="同じアニメーションをgif2webpで可逆変換したもの。コマも速度も同じで動く" width="320" height="240" /> |

GIFは256色までしか使えないので、写真を素材にすると色が飛んで縞が出る。可逆の変換ではその縞も含めてそのまま保たれるため、**GIFらしい見た目は変わらない**。コマ数も再生の速度も同じになる。

## WebPのほうが大きくなるならオリジナルを返す

変換すれば必ず小さくなるわけではない。もともと圧縮の効いた小さな画像や色数の少ない画像では、WebPにしたほうが大きくなることもある。

LightFile Proxyは変換後のサイズをオリジナルと比べて、**大きくなっていればオリジナルを配信する**。弊社が本番で配信している画像700枚で確かめたところ、21枚（3%）がこれに当たった。

同じように、10MiBを超える画像とJPEG・PNG・GIF以外の形式も変換せず、オリジナルをそのまま配信する。10MiBの画像がWebに置かれていることはまずないが、それでも混入することはある。明らかに入稿の事故だが、変換しようとすると負荷が高く、ほかの画像の変換まで遅らせかねないので対象から外している。

## 見落としやすいメタデータ

ここまでが画質の話で、実際に事故が起きやすいのはここから先になる。画像には画素のほかに、色空間や撮影情報といったメタデータが付いている。変換のときにこれをどう扱うかで、見た目が変わってしまうことがある。

### ICCプロファイル

**ICCプロファイル**は、画像に添えられた色味の補正情報だ。

カメラやディスプレイには、扱える色の幅に違いがある。一般的な機器より広い範囲の色を表現できるものもあり、そうした機器で撮った写真は、同じ数値でも指している色が違う。そこで「この画像の数値はどの範囲の色を指すのか」を画像に添えておき、表示する側がそれを見て自分の画面に合わせて補正する。

**プロファイルが付いていなければ、一般的な範囲のものとみなして表示される。** 広い範囲で記録された写真からプロファイルだけを落とすと、鮮やかな色ほど表現しきれなくなる。

つまり、**広い色空間の画像からプロファイルだけを削除すると、表示される色味が変わってしまう**。次の2枚は画素の中身がまったく同じWebPで、違いはICCプロファイルが付いているかどうかだけになる。

ひまわりのマクロ写真をWebPに変換したものを並べる。

| ICCプロファイルを維持したWebP | ICCプロファイルを削除したWebP |
|---|---|
| <img src="/posts/2026/lightfile-proxy-image-quality/icc-flower-kept.webp" alt="ICCプロファイルを保持したWebP。ひまわりの黄色が鮮やかに出ている" width="320" height="320" /> | <img src="/posts/2026/lightfile-proxy-image-quality/icc-flower-dropped.webp" alt="同じ画素でICCプロファイルだけを落としたWebP。黄色がくすんで見える" width="320" height="320" /> |

一見同じようだが、よく見ると右の画像はくすんだ色合いに見えるはずだ。

もう一枚みてみよう。今度はバッグの写真だ。

| ICCプロファイルを維持したWebP | ICCプロファイルを削除したWebP |
|---|---|
| <img src="/posts/2026/lightfile-proxy-image-quality/icc-product-kept.webp" alt="バッグ売り場の写真。ICCプロファイルを保持したWebPで、バッグの色や値札の赤がそのまま出ている" width="300" height="400" /> | <img src="/posts/2026/lightfile-proxy-image-quality/icc-product-dropped.webp" alt="同じ写真からICCプロファイルだけを落としたWebP。赤や青がわずかにくすみ、商品の色味が変わって見える" width="300" height="400" /> |

こちらも左側はやや鮮やかで、右は落ち着いた色味になっている。

人によっては光の加減とも言える微妙な違いかもしれない。だがファッション通販やクリエイティブ関係の人からすると、この差は軽視できない。敏感な人によっては、色違いのクレームや返品にもつながる。

LightFile Proxyは**ICCプロファイルを保持して変換する**（`cwebp -metadata icc`）。色味は変わらない。

### EXIFの回転

スマホで縦に撮った写真は、画素としては横向きに記録され、EXIFの回転情報（Orientation）で「表示するときは回してください」と指示する形になっていることが多い。JPEGで配信していればブラウザがこの指示に従うので、正しい向きで表示される。

ここで、その回転情報をWebPへそのまま持ち込むと何が起きるか。スマホを縦に構えて撮ったときによくある回転情報（Orientation 6。表示するとき時計回りに90度回す、という指示）を付けたコンゴウインコの縦写真を用意して、変換して並べてみる。

| 回転情報を含むJPEG | 回転情報を含むWebP | 回転を解決してから変換したWebP |
|---|---|---|
| <img src="/posts/2026/lightfile-proxy-image-quality/exif-original.jpg" alt="コンゴウインコの縦写真。回転情報を持つJPEGで、ブラウザが指示に従って回すため正しい向きで表示される" width="240" height="360" /> | <img src="/posts/2026/lightfile-proxy-image-quality/exif-webp-with-orientation.webp" alt="同じ写真を回転情報ごとWebPに変換したもの。回転情報が無視され、記録されたままの横倒しの向きで表示される" width="360" height="240" /> | <img src="/posts/2026/lightfile-proxy-image-quality/exif-webp-resolved.webp" alt="回転を解決してからWebPに変換したもの。縦長で正しい向きに表示される" width="240" height="360" /> |

真ん中のWebPは、**EXIFの回転情報を持っているのに無視されて横に倒れている**のが分かるだろう（2026年9月現在。WebPの回転情報に関するブラウザの扱いが変わり、将来の時点では解決している可能性はある）。

このようにJPEGでは解釈される回転情報が、現在においてはWebPでは無視される。そのためEXIFを維持しても、画像が思わぬ向きに回転してしまう。

**LightFile Proxyは変換の前に画素そのものを正立させてからWebPにしている。** 右がその結果になる。回転は可逆な操作で行い、変換の前後で画像が一致することをSSIMで確かめてある。

自分でWebP変換の仕組みを組むなら、ここは必ず踏む。変換したあとに縦写真だけ倒れていないか、実機で確かめておくとよい。

## 画質だけではない落とし穴

このようにWebPは従来の画像フォーマット（JPEG/PNG/GIF）の特徴をよく受け継いでおり、見た目の画質は変えずにデータを軽くすることに長けている。

しかしICCプロファイルによる色味、EXIF情報による画像の回転のように、例としては少数で気づきにくい落とし穴もある。LightFile Proxyは多数のサイトでの導入実績を経て、このような問題にしっかり対処をしている。

---

:::info この記事で使った画像
検証にはWikimedia Commonsの次の3点を使わせていただいた。

- [Sunflower - macro shot1.jpg](https://commons.wikimedia.org/wiki/File:Sunflower_-_macro_shot1.jpg)（撮影: Christopher Carfi、[CC BY 2.0](https://creativecommons.org/licenses/by/2.0)）
- [Bauhaus handbag store window display](https://commons.wikimedia.org/wiki/File:HK_SKD_Po_Lam_MCL_two_Central_mall_shop_%E5%8C%85%E6%B5%A9%E6%96%AF_Bauhaus_%E6%89%8B%E8%A2%8B_handbag_store_window_display_May_2024_R12S_02.jpg)（撮影: Chayquo Shumo、CC0）
- [Scarlet Macaw](https://commons.wikimedia.org/wiki/File:Scarlet_Macaw_(259007229).jpeg)（撮影: Choi Yunhyok、[CC BY 3.0](https://creativecommons.org/licenses/by/3.0)）

変換にはlibwebpの`cwebp`と`gif2webp`を使い、オプションはLightFile Proxyと揃えてある。
:::
