---
title: 詳説 LightFile Proxy (2) 拡張子は.jpgのまま中身をWebPにしてよいのか
description: URLが.jpgのままで中身だけWebPになる配信が仕様のうえで問題ないことを、MIME Sniffing Standardに当たって確かめる。HTTPで取得したリソースの型判定に拡張子は使われず、画像は宣言されたContent-Typeよりも実際のバイト列が優先される。あわせてWebP非対応ブラウザへの振り分けも説明する。
id: miyanaga
date: 2026-09-26 08:00:00
categories:
  - image-fitness
  - technology
---

LightFile Proxyでは、URLの拡張子を`.jpg`や`.png`としたまま、データの中身を軽量な次世代画像フォーマットのWebPに変換して配信する。このアプローチによって、従来のHTMLに変更を加えず、画像だけを最適化できるのだが、人によっては「気持ち悪い」と感じるかもしれない。

しかしこのアプローチは画像最適化で広く使われていて、CDN各社も同じ考え方の機能を持っている。とはいえ「よそもやっているから」では答えにならない。このアプローチが妥当であることを、一次情報に当たりながら解説したい。

<SeriesNav id="lightfile-proxy" />

[[toc]]

---

## ブラウザの振る舞いを決めているWHATWGの仕様

現在の主要なブラウザは、WHATWG（Web Hypertext Application Technology Working Group）が定める仕様に沿って動いている。2004年にApple・Mozilla・Operaが立ち上げ、2017年からはApple・Google・Microsoft・Mozillaの4社が運営している団体で、HTMLやDOM、fetchといった中心的な仕様を「Living Standard」として維持している。ブラウザを作っている当事者が、自分たちの実装の仕様を書いている格好だ。

その中に、今回の疑問にそのまま答える仕様がある。[MIME Sniffing Standard](https://mimesniff.spec.whatwg.org/)で、サーバーから届いたデータの種類をブラウザがどう判断するかを定めたものだ。

## 拡張子は何を決めているのか

手元のパソコンでは拡張子がファイルの種類を決めている。`.jpg` を `.txt` に変えればテキストエディタが開こうとする。この感覚があるので、拡張子と中身の食い違いが気になる。

HTTPで取得したリソースでは事情が違う。MIME Sniffing Standardの「[5.1. Interpreting the resource metadata](https://mimesniff.spec.whatwg.org/#interpreting-the-resource-metadata)」にこう書かれている。

> File extensions are not used to determine the supplied MIME type of a resource retrieved via HTTP because they are unreliable and easily spoofed.

（HTTPで取得したリソースの供給MIMEタイプを決めるのに拡張子は使わない。信頼できず、簡単に偽装できるからである）

ブラウザが型を決める材料はURLの末尾ではなく**`Content-Type`ヘッダ**だ。URLはそのリソースの置き場所を指しているだけで、中身の種類を約束してはいない。

## 画像はバイト列で判定される

画像についてはもう一段ある。同じ仕様の「[8.2. Sniffing in an image context](https://mimesniff.spec.whatwg.org/#sniffing-in-an-image-context)」では、画像として取得したリソースの型をこう決めると書かれている。

1. 供給された型がXML系ならそれを使う
2. そうでなければ「6.1. Matching an image type pattern」で、データの先頭のバイト列を照合する
3. 照合できたら、その結果を型として採用する
4. 照合できなかったときだけ、宣言された型を使う

極端な話、拡張子やMIMEタイプが何であれ、実際のバイト列がWebPならWebP画像として表示される。WebPのバイト列は先頭が `RIFF` で始まり、少し後ろに `WEBP` が続く。この形は仕様の照合表に載っていて、JPEGの `FF D8 FF` やPNGの `89 50 4E 47` と同じ扱いになっている。

なお`X-Content-Type-Options: nosniff`を付けると、ブラウザはこの照合をやめて宣言された型をそのまま信じる。

## LightFile Proxyはimage/webpを付けて返す

LightFile ProxyはWebPに変換した画像を返すとき、`Content-Type: image/webp` を付けて返す。宣言と中身は一致していて、従来のままなのはURLの見た目だけだ。

<img src="/posts/2026/lightfile-proxy-extension-vs-content-type/supported.png" alt="WebP対応ブラウザのシーケンス図。Accept: image/webp 付きで .jpg をリクエストし、LightFile Proxyがオリジンからオリジナルの画像を取得したうえで、Content-Type: image/webp のWebPを返す" width="1000" height="357" />

したがってバイト列の照合に頼ってもいないし、`nosniff`と衝突することもない。仕様のどの経路を通ってもWebPとして解釈される。**食い違っているのは拡張子だけで、拡張子はもともと型判定に使われていない。**

## 受け取れる形式を伝えるAcceptヘッダ

ここで、WebP非対応のブラウザに何が届くのかも確かめておきたい。その前に、振り分けの材料になる`Accept`ヘッダへ触れておく。

HTTPには**コンテントネゴシエーション**という仕組みがある。クライアントが「自分はこの形式を受け取れる」とリクエストの`Accept`ヘッダで伝え、サーバーはその中から選んで、選んだ結果を`Content-Type`で返す。

ブラウザは画像を取りに行くときにも画像用の`Accept`を送っている。[MDNがブラウザごとの既定値を一覧にしている](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation/List_of_default_Accept_values)ので、そこから引くと現在の値はこうなっている。

```
Chrome / Edge 121以降
  image/avif,image/webp,image/apng,image/*,*/*;q=0.8

Firefox 128以降
  image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5

Safari（macOS Big Sur以降）
  image/webp,image/png,image/svg+xml,image/*;q=0.8,video/*;q=0.8,*/*;q=0.5
```

どれにも`image/webp`が入っている。**WebPに対応したブラウザは、慣例として`Accept`に`image/webp`を並べる。**Firefoxは65から、SafariはmacOS Big Sur（Safari 14）からこの形になった。それ以前のFirefoxは`*/*`だけを送っていて、Big Sur以前のSafariの一覧にも`image/webp`は無い。

仕様で義務づけられた動作ではないが、主要ブラウザがこれに揃っているので、`image/webp`が並んでいるかどうかを対応可否の目印として使える。WebPに対応していない古いブラウザや、WebPを知らないツールは並べてこない。

## WebP非対応のブラウザにはオリジナルを返す

LightFile Proxyはこの`Accept`に`image/webp`が含まれているかどうかだけを見る。含まれていれば変換済みを、含まれていなければオリジナルを返す。

<img src="/posts/2026/lightfile-proxy-extension-vs-content-type/unsupported.png" alt="WebP非対応ブラウザのシーケンス図。Acceptにimage/webpがないリクエストに対して、LightFile ProxyはContent-Type: image/jpegのままオリジナルを返す" width="1000" height="376" />

判定は保守的にしてある。`Accept: */*` のように「何でも受け取る」と書かれているだけの相手にはWebPを送らない。WebPを知らないツールやクローラーが`*/*`を送ってくるためで、対応していると明示した相手にだけ変換済みを渡している。

判定に使ったヘッダは`Vary`に入れて返す。CloudFrontから見ると、同じURLでも`Accept`の内容が違えば別のキャッシュになるので、対応ブラウザに届いたWebPが非対応ブラウザへ配信されることはない。CloudFront側で判定させて専用のヘッダで渡す構成もあり、その場合は`Vary`もそのヘッダになる。

振り分けを確かめたいときは、以前に公開した[WebPやAVIFに対応していない旧ブラウザのふりをするChrome拡張機能](/posts/2025/next-gen-image-accept-controller.html)が使える。`Accept`を書き換えて非対応ブラウザを装う拡張で、実機を用意せずに両方の経路を踏める。

## オリジナルは書き換えない

WebPになるのはCloudFrontを通ってエンドユーザーへ配信されるデータだけで、オリジンサーバーやS3バケットに置かれている従来フォーマットのJPEG/PNG/GIFは書き換わらない。変換した結果は変換した側が持っていて、オリジンには書き戻さない。

画像のオリジナルは今までどおりの形式で管理でき、CMSの管理画面から見える画像も、デザイナーが書き出す画像ファイルも今までどおりになる。**LightFile Proxyをやめれば、その日から従来フォーマットの配信に戻る。**

## 副作用

問題はないと書いたが、知らないと戸惑う挙動はある。

- **保存したファイルの名前は `.jpg` のまま。** 対応ブラウザで画像を右クリックして保存すると、`item.jpg` という名前でWebPのデータが保存される。ブラウザや画像ビューアは中身で判断するので開けるが、拡張子で形式を判断するツールに渡すと扱えないことがある
- **ダウンロード用のリンクには向かない。** 印刷用データのように配布を目的としたファイルは、変換の対象から外す設定にしておきたい

どちらも、配信のときだけ中身を差し替えているために起きる。オリジナルはそのままなので、元の形式が必要ならオリジンから取ればよい。

もうひとつよく聞かれる「変換する分だけ表示が遅くならないか」には、連載の別の記事で答えている。

- <SeriesRef url="/posts/2026/lightfile-proxy-conversion-timing.html">(3) 画像変換のタイミングとその最適解</SeriesRef>
