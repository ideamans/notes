---
title: 詳説 LightFile Proxy (10) 料金体系
description: LightFile Proxyの料金体系は大きく2つある。現行のクラスタ提供は基本料金・ノード数・キャッシュ容量・外部通信実費の積み上げで決まる。もうひとつは今後検討している成果報酬型で、CloudFrontの削減額の一部をいただく方式になる。具体的な単価は非公開だが、どのように料金を計算しているのか、体系を解説する。
id: miyanaga
date: 2026-10-04 08:00:00
categories:
  - image-fitness
  - business
draft: true
---

LightFile Proxyの料金体系は大きく2つある。現行の**クラスタ提供**と、今後検討している**成果報酬型**だ。

具体的な単価は非公開だが、**どのように料金を計算しているのか**、体系を解説したい。

<SeriesNav id="lightfile-proxy" />

[[toc]]

---

## クラスタ提供

現行の料金体系になる。月額は4つの積み上げで決まる。

```
基本料金 + ノード数 + キャッシュ容量 + 外部通信実費
```

<img src="/posts/2026/lightfile-proxy-pricing/cluster.png" alt="クラスタ提供の料金構成を示す積み上げ棒グラフ。基本料金・ノード数・キャッシュ容量・外部通信実費の4つが積み上がり、アクセスが増えるとノード数が、画像が多いとキャッシュ容量が、CloudFront以外のCDNでは外部通信実費が乗る" width="1000" height="460" />

### 基本料金

クラスタを1つ用意するための固定の部分になる。構築・更新・監視・障害対応はここに含まれる（<SeriesRef url="/posts/2026/lightfile-proxy-failover.html">(6)</SeriesRef>）。

### ノード数

LightFile Proxyはノードの数で伸縮できるクラスタを単位に提供している（<SeriesRef url="/posts/2026/lightfile-proxy-multisite.html">(8)</SeriesRef>）。**最小は2ノード**で、CloudFrontからLightFile Proxyへ届くアクセス数と画像のサイズによって必要な数が変わる。ノード単価 × ノード数で増えていく。

### キャッシュ容量

変換済みのWebPをどれだけ一度に保持するかになる（<SeriesRef url="/posts/2026/lightfile-proxy-cache.html">(7)</SeriesRef>）。**200GB単位**で、200GB × 単位数で増える。

大きく取るほど、たまにしかアクセスされない画像も残り続けるので変換のやり直しが減る。画像の量とアクセスの傾向を見て決めることになる。

### 外部通信実費

AWSから外部へのネットワークのアウトバウンドで生じる費用になる。**CloudFrontが相手ならAWSネットワーク内で完結するので、ここは発生しない。**

実はCloudFront以外のCDNで使われている例もある。その場合は外部CDNからLightFile Proxyへの通信が発生するので、その分を実費で請求している。そのCDNにも標準の画像最適化オプションはあるのだが、**LightFile Proxyの料金に通信費の実費を重ねても標準オプションより安い**ということで利用いただいているケースもある。

### 目安と代理店価格

最小構成で**月額15万円〜**という料金イメージになる。

ノード単価やキャッシュ容量の単価は公表していない。**実際の金額は見積もりで出している**ので、[LightFile Proxyのサイト](https://www.lightfile-proxy.net/)から依頼してほしい。画像の量とアクセスの傾向が分かるものを添えると、精度が上がる。

代理店価格制度があり、システムベンダーは値引きして再販できる。1つのクラスタで複数のサイトをホストして再販してもかまわない。

## 成果報酬型

こちらは今後検討している方式になる。

クラスタ提供は小規模なサイトには高額すぎる。そこで、**CloudFrontの料金を削減できた分の一部を料金としていただく**形を考えている。

CloudFrontの料金が月額20万円かかっていたサイトで、LightFile Proxyによって10万円まで削減できた場合を例にする。

<img src="/posts/2026/lightfile-proxy-pricing/performance-80.png" alt="CloudFrontキャッシュヒット率が80%の場合の積み上げ棒グラフ。導入前は20万円、導入後はCloudFrontの10万円とLightFile Proxyの成果報酬2万円で合計12万円になり、月8万円お得になる" width="1000" height="400" />

CloudFrontキャッシュヒット率が80%なら、成果報酬として**2万円**を請求させていただく。合計は12万円で、月8万円お得になる。

<img src="/posts/2026/lightfile-proxy-pricing/performance-90.png" alt="CloudFrontキャッシュヒット率が90%の場合の積み上げ棒グラフ。導入前は20万円、導入後はCloudFrontの10万円とLightFile Proxyの成果報酬1万円で合計11万円になり、月9万円お得になる" width="1000" height="400" />

CloudFrontキャッシュヒット率が90%なら**1万円**になり、月9万円お得になる。

こちらにも代理店制度を用意する。**制作会社がお客様を紹介してくれた場合、月額費用の一部をマージンとしてお支払いする。**

## LightFile Proxyの料金を抑えるコツ

いずれの料金体系でも、利用者の工夫でLightFile Proxyの料金を抑える共通の方法がある。それが**キャッシュ効率を高めること**だ。

CloudFrontにおけるキャッシュ期間をできるだけ長く持つことで、CloudFrontからLightFile Proxyへのアクセスが減少する。その分、費用を抑えられる。

キャッシュ期間が1日と1時間では、単純計算で24倍の差がある。もちろん画像によってアクセスのばらつきがあるのでこのように単純な差にはならないが、**LightFile Proxyでは1日以上のキャッシュ期間を推奨している**。

一方でキャッシュ期間を伸ばすことにはリスクもある。同じファイル名で画像を差し替えたとき、その反映が遅くなる点だ。

LightFile Proxyには、CloudFrontとも連携した、ユーザーリクエストに基づくキャッシュクリア機能を備えている（<SeriesRef url="/posts/2026/lightfile-proxy-cache.html">(7)</SeriesRef>）。また、画像を差し替えるときはファイル名を変更したり、タイムスタンプなどをURLパラメータに付与するCache Bustingの機構があればこの心配はない。
