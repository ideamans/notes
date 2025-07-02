---
title: WebPやAVIFに対応していない旧ブラウザのふりをするChrome拡張機能
id: miyanaga
date: 2025-07-02 09:53:00
categories: ['development', 'image-fitness']
---

WebPやAVIFといった次世代画像フォーマットと、従来フォーマット(JPEG・PNG・GIF)に両対応し、ブラウザの対応状況によって出し分けるサイトが増えている。

弊社でもそのようなアシストを行うサービスを提供しているが、

- [LightFile Proxy - AWS CloudFrontでシームレスにWebP対応・通信コスト削減](https://www.lightfile-proxy.net/)

次世代画像フォーマットに対応していない古いブラウザはもう絶滅寸前で、表示確認が面倒になってきた。

そこで対応画像フォーマットをサーバーに伝える役割を持つ、画像リクエストの`Accept`ヘッダを書き換えて旧ブラウザをシミュレートするChrome拡張機能を開発した。

- [Next Gen Image Accept Control - Chrome ウェブストア](https://chromewebstore.google.com/detail/next-gen-image-accept-con/ndoehffkihifmbfnhjpmahfiaopjjccp?hl=ja)

---

## 使い方

使い方は簡単で、拡張機能からどの次世代画像フォーマットに対応する(ふりをする)か選択する。

![Next Gen Image Accept Control](https://lh3.googleusercontent.com/jly7J2XjZ1dgbURQyzSY2BXfsbG-25GOByKPujpb8LOG_G_qzps9icJfBzXpRFyfJHfZ9hNGNJ1Q2mbWv6EZc-rn-Hw=s1280-w1280-h800)

例えば [ANA](https://www.ana.co.jp/ja/jp/) のページは WebP や AVIF を活用済みだが、

<img src="https://assets.ideamans.com/miyanaga/images/2025/07/ana-website-network-requests.png" alt="ANAのウェブサイトのネットワークリクエスト一覧" width="1600" height="1006" />

拡張機能で`No WebP/AVIF Support`を選択すると、WebPやAVIFはレスポンスに含まれなくなる。

<img src="https://assets.ideamans.com/miyanaga/images/2025/07/ana-website-network-requests_1.png" alt="ANAウェブサイトのネットワークリクエスト一覧" width="1600" height="1006" />

それでも画像表示に問題がなければ、画像フォーマットの出し分けは正常に機能していることが確認できる。

## 注意 - HTMLによる出し分けには非対応

次世代画像フォーマットと従来フォーマットの出し分けには `picture`要素を使い、HTMLマークアップで実現する方法もある。

- [マルチメディア: 画像 - ウェブ開発の学習 | MDN](https://developer.mozilla.org/ja/docs/Learn_web_development/Extensions/Performance/Multimedia)

CMSのサポートでもない限りこの方法はお勧めしないのだが、上記の拡張機能はこの出し分けのデバッグには使えないのでご注意いただきたい。

## 他の確認方法は大変

参考までに、他の確認方法を紹介する。以下の方法はHTMLによる出し分けも確認できるが、かなり面倒ということがわかると思う。

### IE・旧Safari(13以前)

次世代画像フォーマットに非対応のブラウザと言えばIEだが、今から調達するのは骨が折れるだろう。

Safariはバージョン13まではWebPに対応していなかった。これも5年前のバージョンにあたるので現存する環境は少ない。

### 旧Firefox(118以前)

少し前まではFirefoxの設定を変更することでWebP非対応の挙動を再現できたが、これも現在は使えない。

- [WebP非対応ブラウザでの画像表示を確認するには #フロントエンド - Qiita](https://qiita.com/miyanaga/items/401051035a52ca6ba905)
