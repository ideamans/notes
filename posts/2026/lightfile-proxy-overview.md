---
title: 詳説 LightFile Proxy (1) サイトに手を加えず画像をWebPで配信する仕組み
description: AWS CloudFrontの料金は送信データ量で決まり、ページの転送量で最も大きいのは画像である。次世代フォーマットへの移行は転送量の削減幅が大きいが、CMSやECなどのシステム改修とデータ作成手順の変更が必要になるため、取り組んでいるサイトはまだ少ない。弊社のLightFile ProxyはCloudFrontとオリジンの間に入り、運営者が気づかないうちに配信画像だけをWebPにする。
id: miyanaga
date: 2026-09-25 08:00:00
categories:
  - image-fitness
  - sitespeed
draft: true
---

一般的にWebサイトは転送量の多くを画像が占める。この画像を従来フォーマットのJPEG/PNG/GIFから次世代フォーマットのWebPに変えるだけで転送量が減り、CloudFrontの料金も下がる。しかし既存のサイトをWebPに対応させるには、システムの改修やデザイナーの画像ファイル出力作業の変更が必要になる。

弊社の[LightFile Proxy](https://www.lightfile-proxy.net/)は、そういった変更を必要とせず、今まで通りのシステムと運用でいつの間にか画像がWebPに変わって画像を軽量化、転送量とAWSコストを削減するための製品だ。本記事からしばらく連載として、その仕組みと機能、AWSが公式に提供する[Dynamic Image Transformation for Amazon CloudFront](https://aws.amazon.com/solutions/implementations/dynamic-image-transformation-for-amazon-cloudfront/)（DIT）との違いを詳しく解説したい。

<SeriesNav id="lightfile-proxy" />

[[toc]]

---

## 転送量で決まるCloudFrontの料金

CloudFrontの料金は基本的に従量課金で、AWSからエンドユーザーへ送ったデータの量とリクエストの数で決まる。2025年11月からは上限付きの定額プランも選べるようになったが、上限を超えれば上位のプランへ移ることになる。送るデータが減れば費用が下がる構造は変わらない。

では、送っているデータの中身は何だろうか。[HTTP ArchiveのWeb Almanac 2025](https://almanac.httparchive.org/en/2025/page-weight)によると、デスクトップの中央値でページ全体が約2.86MB、そのうち画像が約1,058KBを占める。リソースの種類としては画像が最も大きい。

画像を軽くすればCloudFrontの請求額が下がる。どのくらい下がるのかを、東京リージョンの単価で計算してみる。

CloudFrontのデータ転送料金は段階制で、東京では最初の10TBが1GBあたり$0.114、次の40TBが$0.089という単価になっている（AWS Price List APIで取得した2026年9月時点の値）。月に10TBを配信しているサイトで計算してみる。

<img src="/posts/2026/lightfile-proxy-overview/cloudfront-cost-general.png" alt="画像が転送量の37%を占めるサイトのCloudFront料金の積み上げ横棒グラフ。そのまま配信すると画像以外735ドルと画像432ドルで合計1,167ドル、画像を半分にすると951ドルとなり、18%削減の位置に補助線が引かれている" width="1000" height="300" />

さきほどのWeb Almanacの中央値どおり、画像が転送量の37%を占めるサイトを想定した。その画像が半分になると、月額は$1,167から$951へ、18%下がる。画像以外の転送は変わらないので、減るのは青い部分だけになる。

転送量が増えれば差も広がる。月10TBなら年間で$2,600ほど、50TBなら$10,000ほどになる。

| 月間の転送量 | そのまま | 画像を半分に | 差 |
|---|---:|---:|---:|
| 1TB | $117 | $95 | -$22 |
| 10TB | $1,167 | $951 | -$216 |
| 50TB | $4,813 | $3,970 | -$843 |

なお、無料枠は配信がTB単位になると相対的にかなり小さいため計算に入れていない。

ここまでは一般的なサイトの話になる。実際の通販サイトでは画像の比率がもっと高く、**転送量の70%、ときには80%を画像が占める**。そしてWebP変換で70%減るケースも珍しくない（<SeriesRef url="/posts/2026/lightfile-proxy-measure-before.html">(4) 次世代画像フォーマットでどのくらい軽くなるか</SeriesRef>）。同じ月10TBの配信で計算し直すとこうなる。

<img src="/posts/2026/lightfile-proxy-overview/cloudfront-cost-ec.png" alt="画像が転送量の70%を占めるサイトのCloudFront料金の積み上げ横棒グラフ。そのまま配信すると画像以外350ドルと画像817ドルで合計1,167ドル、画像を70%削減すると595ドルとなり、49%削減の位置に補助線が引かれている" width="1000" height="300" />

$1,167が$595になる。**CloudFrontの従量課金がほぼ半分になる。**

## 閲覧する側の負担も減る

画像を軽くすると表示も速くなる、というのが一般的な定説になっている。だが昨今の高速回線とハイスペック端末を前提にすると、残念ながら画像を軽くしただけで表示が速くなることは期待できない。表示速度は前段の処理でほぼ決まってしまうためで、これは弊社の実測でも確かめている（[実例に学ぶサイトスピード改善(2) 画像は次世代フォーマットに移行する](/posts/2026/images-webp-conversion.html)）。

いまや画像の軽量化は、数ある高速化施策のうちの一つでしかない。それでも画像が軽いに越したことはない。

むしろスピードの面より、**ユーザーのモバイル通信料金の負担を軽減したり、省エネルギーによって環境に配慮したりする側面が相対的に重要になっている。** 同じページを見るのに必要なデータが半分で済むなら、それは閲覧する側の負担がそのまま半分になるということでもある。

表示速度のためだけに画像を最適化していた頃から、動機が一つ増えている。

## なぜ次世代フォーマットから手を付けるのか

画像を軽くする方法はいくつかあるが、削減幅が大きいのはWebPやAVIFといった次世代フォーマットへの移行だ。JPEGやPNGのまま圧縮を詰めるより減り方が大きい。

今や対応ブラウザも実用レベルに充実している。WebPとAVIFはどちらも主要ブラウザの対応率が95%を超えた。弊社も以前は「まだ早い」と書いていたが、[そろそろWeb画像はWebPだけでよいか](/posts/2024/webp-only.html)を書いた2024年には判断が変わっている。

ところが実際のサイトでは採用が進んでいない。弊社が国内のECサイトを300サイト調べた[EC画像最適化白書](https://ec-image-2026.whitepapers.ideamans.com/next-gen-images/)では、次世代フォーマットをほとんど採用していない（全体の0〜10%）サイトが、まだ半数近くを占めている。

## 移行を進めるときに考える3点

ではなぜ移行が進んでいないのか。次世代画像フォーマットへの移行を進める上で考えることは、大きく次の3点である。

- **システムの改修。** CMSやECなどが出力するHTMLと画像URLに手を入れ、`<picture>`要素かサーバー側の設定で、対応ブラウザにだけWebPを配信する仕組みを入れる必要がある
- **データ作成手順の変更。** デザイナーや制作会社に周知し、画像ファイルを書き出すときにWebPも出力する手順へ変える必要がある
- **過去の画像の扱い。** すでに登録された何万枚もの画像をどうするかを決めないと、新しい画像だけが対応した状態になる

どれも単独ではそこまで難しいわけではないが、一斉に調和をとって進めようとするとアーキテクチャや体制に関するスケールになる。

これが最適解だ、と自信を持ってリードしきるのは案外難しい。それで手付かずになっているのではないか、というのが弊社の見立てだ。

## CloudFrontには画像最適化のオプションがない

このように画像最適化は思ったよりハードルが高い。そこで大手のCDNにはオプションが用意されている。追加料金を支払えば、配信する画像が自動で最適化されるというものだ。

| CDN | 画像最適化のオプション |
|---|---|
| Akamai | Image & Video Manager |
| Cloudflare | [Polish](https://developers.cloudflare.com/images/polish/) |
| Fastly | [Image Optimizer](https://www.fastly.com/documentation/guides/full-site-delivery/image-optimization/about-fastly-image-optimizer) |
| CloudFront | Dynamic Image Transformation（DIT）／**LightFile Proxy** |

DITはAWS公式だが、CloudFormationのテンプレートを自分のアカウントに建てて更新と監視を自分で回すもので、設定を入れるだけのマネージドなオプションとは言いにくい（<SeriesRef url="/posts/2026/lightfile-proxy-vs-dit.html">(9) AWS純正のDITで代替できるか</SeriesRef>）。LightFile Proxyは、**CloudFrontでImage ManagerやPolishと同じ位置をSaaSで埋める**製品として作った。

## 配信経路に画像変換を後付けする

そこでLightFile Proxyは、この3つをどれも動かさずに済ませる。システムにもデータ作成の手順にも手を付けず、配信の途中でだけ画像を差し替える。置き場所はCloudFrontとオリジン（既存のWebサーバー、またはS3バケット）の間になる。

導入前の経路はこうだ。

<img src="/posts/2026/lightfile-proxy-overview/before-gg.png" alt="導入前の構成図。エンドユーザーからCloudFront、オリジンサーバーへと並び、CloudFrontがオリジンサーバーからJPEG/PNG/GIFを取りに行く。お客様の環境が枠で囲まれている" width="1000" height="355" />

導入後はこうなる。

<img src="/posts/2026/lightfile-proxy-overview/after-gg.png" alt="導入後の構成図。エンドユーザー・CloudFront・LightFile Proxy・オリジンサーバーが並び、弊社が運用するLightFile Proxyの範囲が青い枠で囲まれている" width="1000" height="268" />

CloudFrontから見ると、LightFile Proxyがオリジンに見える。LightFile Proxyはオリジンからオリジナルの画像を取りに行き、WebPに変換してCloudFrontへ渡す。CloudFrontはそれをエンドユーザーへ配信する。

このとき画像のURLは変わらない。`/images/item.jpg` は `/images/item.jpg` のままで、中身だけがWebPになる。HTMLとCMS、データ作成の手順は変わらず、オリジンに置かれているJPEG/PNG/GIFにも触れない。作業はCloudFrontの設定を数手順変えるだけで、やめるときは設定を元に戻す。

**上の3つをどれも動かさずに、運営者が気づかないうちに、配信される画像だけが次世代フォーマットになる。**

## この連載で扱うこと

ここまでが全体像になる。この説明をすると、たいてい次の2つを聞き返される。

**拡張子が`.jpg`のままで中身がWebPというのは問題ないのか。** ブラウザが画像の形式をどう判断しているかで決まる。<SeriesRef url="/posts/2026/lightfile-proxy-extension-vs-content-type.html">(2) 拡張子は.jpgのまま中身をWebPにしてよいのか</SeriesRef>で仕様に当たって確かめる。

**変換する分だけ表示が遅くならないか。** いつ変換するかで答えが変わる。事前に全部変換する方法、リクエストの中で変換する方法、LightFile Proxyが採っている半同期変換の3つを比べる。<SeriesRef url="/posts/2026/lightfile-proxy-conversion-timing.html">(3) 画像変換のタイミングとその最適解</SeriesRef>で扱う。

連載ではこのほかに、<SeriesRef url="/posts/2026/lightfile-proxy-measure-before.html">効果の測り方</SeriesRef>、<SeriesRef url="/posts/2026/lightfile-proxy-image-quality.html">画質とメタデータ</SeriesRef>、<SeriesRef url="/posts/2026/lightfile-proxy-failover.html">障害時の挙動</SeriesRef>、<SeriesRef url="/posts/2026/lightfile-proxy-cache.html">キャッシュ戦略</SeriesRef>、<SeriesRef url="/posts/2026/lightfile-proxy-multisite.html">複数サイトの収容とそのほかの細かな特徴</SeriesRef>、<SeriesRef url="/posts/2026/lightfile-proxy-vs-dit.html">AWS純正のDITで代替できるか</SeriesRef>、そして<SeriesRef url="/posts/2026/lightfile-proxy-pricing.html">料金体系</SeriesRef>を扱っている。どの記事から読んでも構わない。
