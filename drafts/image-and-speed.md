---
title: 画像軽量化はスピード改善に効くのか？
date: 2024-06-28 00:00:00
id: miyanaga
---

# 「画像は重い」は昔の話

ページスピードの改善と言えば、最もデータ量の多い画像の軽量化を連想する人は多く、そのような記事も散見する。

しかし**画像データが重いからページの表示が遅いというのはガラケーサイトの名残**である。ネット回線が高速化した今や、画像はフロントエンドの主要なボトルネックではない。

## 実際に重いのは画像よりJavaScript

実際にこれまで数多くのWebフロントエンドのスピード改善を検証してきて、画像が主要な問題であったケースはひとつもない。

ちなみに主要なボトルネックの9割はJavaScriptにあった。本記事は画像についてであるため、JavaScriptの問題についてはまた別の記事で触れたい。

## 画像は重くないが「AWSのコストは高い」

AWSをはじめとするクラウドサービスを利用するサイトが増えている。

意外にも、**クラウドサービスはデータ転送量に応じた従量課金**であると知らないユーザーも多い。

エンジニアなら当然の認識だが、上位の意思決定者になると「AWSのコストはサーバー代」という解釈に止まるはいたしかたないところではある。

## 100万PVの画像配信コストは6〜9万円

あなたのサイトの月間PVはどのくらいだろうか？ 大雑把な計算だが、**AWSにおいては100万PVあたりデータ転送料金はおおよそ10万円**になる(1ページあたり5MB、$1=160円、CloudFrontの日本向け単価を想定)。

AWSでのWebサイトは大抵、CloudFrontというCDNを通して配信されている。料金明細のCloudFrontの料金を参照すると、実際にいくらかかっているかがわかる。

一般的にWebページの構成データのうち、60%ほどが画像データによって占められる。通販サイトともなれば70〜90%に達することも少なくない。

したがって、**AWSでサイトを運用すると100万PVにつき6万円〜9万円を画像データの配信に支払う**こととなる。

## 画像配信コストは半減できる

例えば次世代画像フォーマットWebPを利用すると、経験上、画像データは半分以下に削減できる。

画質の劣化はほとんどなく、JPEGについて言えば80%近く削減できる場合もある。

もしあなたのサイトが毎月CloudFrontに100万円を費やしているのであれば、画像軽量化により30万円〜45万円を削減できる可能性が高い。

## 画像軽量化は無意味ではない

冒頭で画像はWebフロントエンドが遅い主要因ではないとないと解説したが、軽量化が無意味という意味ではない。

過剰な期待は禁物だが、効果に見合う費用内であればもちろん実施した方がよい。

例えば通販サイトなどでは画像が主役であり、画像の読み込みの遅れのために離脱を招く場面は十分にありうる。

AWSなどのクラウドサービスでは、スピードの他にデータ転送コストの観点が加わる。現にCloudFrontの利用料金が高額なら、即刻取り組んだ方がよい。

# 無料相談受付中