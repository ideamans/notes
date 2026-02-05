---
title: Web画像フォーマットの細かなバリエーションを網羅するデータセットとツールキットを公開
id: miyanaga
date: 2025-05-31 08:43:00
categories:
  - image-fitness
  - technology
ogp: /ogp/2025/web-image-format-variation-toolkit.jpg
---

弊社ではWeb画像に関するサービスを展開しているが、一言にJPEG、PNG、GIFといっても内部的に多くのバリエーションがある。例えばJPEGであれば、Exifの有無や圧縮方式の違いなどだ。

これまで試験用の画像は断片的に収集、変換するなどして用意してきたが、それらバリエーションを包括的に網羅するデータセットを生成プログラムとともにOSSとして公開した。

- [ideamans/web-image-format-variation-toolkit: JPEG、PNG、GIF形式の包括的なバリエーション画像を生成し、画像変換ツールの品質評価を行うためのPythonテストツールキット](https://github.com/ideamans/web-image-format-variation-toolkit)

弊社の画像系サービスでも今後はこのデータセットを活用していきたい。

[[toc]]

---

## フォーマットバリエーションの落とし穴

画像処理サービスにおいては、実運用時になって思わぬトラブルが報告されることがある。

よく調べてみると、あまり一般的ではないフォーマットオプションが用いられていたというケースが多い。

包括的にバリエーションを網羅したデータセットを用意しておくことで、こういったレアケースにおけるトラブルを察知できる。

## ツールキットの機能

このツールキットでは、JPEG・PNG・GIFの3つのフォーマットを対象にして、次の3つの機能を用意した。

1. オリジナル画像の生成
2. バリエーションの変換・生成
3. ディレクトリ間の画像比較

### オリジナル画像の生成

Webから収集できる画像には、すでに何らかの「クセ」がある。例えばJPEGのサブサンプリングがすでに4:2:2だと、4:4:4にアップスケーリングしても違いが分かりにくい。

そこでオリジナル画像はプログラムによって生成する。これによりフォーマット的にピュアなデータを用意できる。

```bash
python toolkit.py generate-original
```

### バリエーションの変換・生成

オリジナル画像をもとに、内部フォーマットのオプションを調整してバリエーションを生成する。

因子の組み合わせは無数にあるので、それぞれのパラメータを単独で調整したものと、注意が必要な因子の組み合わせについて特別に生成している。

```bash
python toolkit.py generate-variations
```

オリジナル画像とバリエーションについては`output`ディレクトリに作成されるが、実際のデータもリポジトリに含めているので画像だけの利用であればプログラムの実行は必要ない。

[web-image-format-variation-toolkit/output at main · ideamans/web-image-format-variation-toolkit](https://github.com/ideamans/web-image-format-variation-toolkit/tree/main/output)

バリエーションの一覧はREADMEにも記載があるが、`index.json`として作成される。

### ディレクトリ間の画像比較

同一の名称における画像データセットが格納されたふたつのディレクトリ間で、それぞれの画像のファイルサイズ、解像度、視覚的な差異(PSNRとSSIM)を計算するツールも用意した。

これは弊社特有の事情だが、画像を軽量化した後で仕様や見た目が大きく変わっていないかを確認するためだ。

```bash
# outputディレクトリとcompareディレクトリを比較
python toolkit.py compare-directories output compare
```

その他、詳細な使用方法やオプションについては、[README](https://github.com/ideamans/web-image-format-variation-toolkit)を参照していただきたい。

## 最後に

このプロジェクトはほとんど [Claude Code](https://docs.anthropic.com/ja/docs/claude-code/overview) で作成した。

画像処理もPythonが強いが、Pythonは個人的に苦手なので大変助かった。

バリエーションについて案があればお寄せいただきたい。
