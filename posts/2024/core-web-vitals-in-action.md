---
id: miyanaga
title: Core Web Vitalsの超実践的な改善術 - 総集編
date: 2024-11-23 16:41:00
categories:
  - sitespeed
  - development
  - technology
  - research
ogp: /ogp/2024/core-web-vitals-in-action.jpg
---

このブログでは最近、Core Web VitalsやPageSpeed Insightsに関する記事を続けて書いた。

きっかけは[2024年11月23日のMTDDC Meetup TOKYO 2024にて登壇させていただくこと](https://mtddc2024.mt-tokyo.net/speaker/roomC05.html)になり、これまでの集大成を語りたく「これで完璧！超実践的Core Web Vitalsの健全化手法」と仰々しいテーマにしたのだが、プレゼンテーションの構成を検討するうち、話したいことが多すぎてまったく完璧ではなくなってしまった。

- [宮永 邦彦 氏｜MTDDC Meetup Tokyo 2024【11/23（土）開催】](https://mtddc2024.mt-tokyo.net/speaker/roomC05.html)

そこで講演では話しきれない内容を補完するために、テーマについて詳細な記事を書き始めた。

- [PageSpeed Insightsの正しい読み方・活かし方 | ideaman's Notes](https://notes.ideamans.com/posts/2024/effective-pagespeed-insights.html)
- [pagespeed-quest/README.ja.md at main · ideamans/pagespeed-quest](https://github.com/ideamans/pagespeed-quest/blob/main/README.ja.md)
- [Core Web Vitalsの実践的な改善術 - CLS編 | ideaman's Notes](https://notes.ideamans.com/posts/2024/core-web-vitals-in-action-cls.html)
- [Core Web Vitalsの実践的な改善術 - LCP編 | ideaman's Notes](https://notes.ideamans.com/posts/2024/core-web-vitals-in-action-lcp.html)
- [Core Web Vitalsの実践的な改善術 - INP編 | ideaman's Notes](https://notes.ideamans.com/posts/2024/core-web-vitals-in-actino-inp.html)
- [INPの収集および改善提案サービスを開始 | ideaman's Notes](https://notes.ideamans.com/posts/2024/speedismoney-fieldwork.html)
- [Core Web Vitalsの改善術 - サードパーティタグ編 | ideaman's Notes](https://notes.ideamans.com/posts/2024/thirtparty-tag.html)

本記事はその講演のまとめと、これまで書いた記事の総集編をお届けする。

[[toc]]

---

## Core Web Vitals

Core Web Vitalsは、Googleが提唱するUXの健全性を示す3つの指標だ。

多くの記事で解説があるのでここでは詳細は省略するが、飲食店のサービスに例えるとユーモラスに覚えられると思っている。

- [LCP (Largest Contentful Paint)](https://web.dev/articles/lcp?hl=ja)
  - 「セットメニューのメイン料理が早く出てくると嬉しい」
- [CLS (Cumulative Layout Shift)](https://web.dev/articles/cls?hl=ja)
  - 「お皿をガチャガチャと並べずコース料理のように優雅に」
- [INP (Interaction to Next Paint)](https://web.dev/articles/inp?hl=ja)
  - 「お客さんが店員を呼んだらすぐに応える」

## Core Web Vitalsとサイトの収益性

以下は実際のある通販サイトにて、Core Web Vitalsのひとつである[LCP(Largest Contetful Paint)](https://web.dev/articles/lcp?hl=ja)と、CVRの関係を計測した結果である。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/cvr-lcp-graph.png" alt="CVRとLCPの関係を示す折れ線グラフ" width="1600" height="815" />

平均LCPが1秒弱のセッションはCVRが1.72%であるが、3秒強になると0.33%まで低下する。その差は5.2倍に及ぶ。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/cvr-lcp-graph_1.png" alt="CVRとLCPの関係を示すグラフ、1秒のLCPでCVRが1.72%、3秒で0.33%になる" width="1600" height="815" />

つまりLCPが良好であれば注文まで行きついたであろうユーザーも、約2秒のLCPの遅れで5人のうち4人が離脱することを示す。

これほどまでにユーザーはサイトスピードにシビアということだ。

SEOの文脈を抜きにしても、サイトスピードの改善には大きな意味がある。

## 失敗するスピード改善プロジェクトとPageSpeed Insights

SEOや収益性改善を意図してCore Web Vitals、あるいはサイトスピードの改善を企図するサイトは多い。しかしそのプロジェクトの多くはうまく進行しない。

以下のような進め方はたいてい失敗する。

- PageSpeed Insightsのスコアに注目する
- そのスコアを改善するために指摘事項の消化に取り組む
- 改修をリリースして効果測定する

実際は多くの企業がこのような進め方をしていると推測する。

この進め方はなぜうまくいかないのか、正しく効果を生むためにPageSpeed Insightsをどのように活用すればよいのか、以下の記事にまとめた。

- [PageSpeed Insightsの正しい読み方・活かし方 | ideaman's Notes](https://notes.ideamans.com/posts/2024/effective-pagespeed-insights.html)

## アイデアマンズ流サイトスピード改善提案

弊社アイデアマンズ株式会社でサイトスピードの改善提案を行う際は、基本的に以下の流れで行なっている。

1. PageSpeed Questによる検証環境の用意
2. サードパーティタグの分離
3. Lighthouseによる指標改善の仮説検証
4. サードーパーティタグの復元と対策の検討

### PageSpeed Quest

弊社ではページスピード改善の仮説を検証するために[PageSpeed Quest](https://github.com/ideamans/pagespeed-quest/blob/main/README.ja.md)を利用している。

- [PageSpeed Quest](https://github.com/ideamans/pagespeed-quest/blob/main/README.ja.md)

これは弊社で独自開発したフロントエンドのスピード改善を実験するフレームワークである。

HTTPプロキシを使い、あらゆるWebページについて簡単にスピード改善の仮説検証を進められる。

オープンソースで公開しているので、読者の皆さんにも気軽にご利用いただきたい。

### サードパーティタグの分離

サードパーティタグは気軽に追加されてしまうが、実はサイトスピード低下の大きな要因になっている。

その負荷が仮説検証のノイズになり、内容を柔軟に変更できないため他の技術要素とアプローチが異なる。そのため弊社の調査では一度分離している。

### Lighthouseによる指標改善の仮説検証

続いてPageSpeed Questに同梱されたLighthouseを利用し、次の順番で指標の改善を図る。

1. **CLS (Cumulative Layout Shift)** 最低 0.25 目標 0.1
2. **TBT (Total Blocking Time)** 最低 600ms 目標 200ms
3. **FCP (First Contentful Paint)** 最低 3秒 目標 1.8秒
4. **LCP (Largest Contentful Paint)** 最低 4秒 目標 2.5秒
5. **SI (Speed Index)** 最低 5.8秒 目標 3.4秒

CLSとLCPはCore Web Vitalsと共通であり、Lighthouseでの評価を改善できればおのずとCore Web Vitals(Chrome User Experience Report)の評価も上がる。

- [Core Web Vitalsの実践的な改善術 - CLS編 | ideaman's Notes](https://notes.ideamans.com/posts/2024/core-web-vitals-in-action-cls.html)
- [Core Web Vitalsの実践的な改善術 - LCP編 | ideaman's Notes](https://notes.ideamans.com/posts/2024/core-web-vitals-in-action-lcp.html)

TBTはINPに関係があると言われているが、INPの悪化はTBTによるものとは限らない。

加えてINPはユーザーがページ操作を行なった結果として観測される指標である。つまりLighthouseによるシミュレーションでは真の原因を掴むことができない。

弊社ではINPの発生原因を実際のユーザー環境から収集し、BigQueryに蓄積するサービスも開始した。

- [Core Web Vitalsの実践的な改善術 - INP編 | ideaman's Notes](https://notes.ideamans.com/posts/2024/core-web-vitals-in-actino-inp.html)
- [INPの収集および改善提案サービスを開始 | ideaman's Notes](https://notes.ideamans.com/posts/2024/speedismoney-fieldwork.html)

### サードパーティタグの復元と対策の検討

ここまでページを構成するWeb技術を工夫しCore Web Vitalsの改善を図ってきたが、最後に分離してあったサードパーティタグを復元する。

すると当然だが、スコアによる評価は下がる。主にTBTが悪化する。その悪化の大きな原因となっているサードパーティタグを特定し、TBT悪化を避ける方法を提案する。

- [Core Web Vitalsの改善術 - サードパーティタグ編 | ideaman's Notes](https://notes.ideamans.com/posts/2024/thirtparty-tag.html)

サードパーティタグはここまで柔軟に改変できた自社配信のリソースと異なり、他社のプログラムであるため内容を変更することができない。

そのため対策としては削除するか、読み込むタイミングを遅延するといった消極的な対策しかとれない。

また、サードパーティの扱いはWeb制作者の課題ではなく、通常はサイトオーナーの責任だ。最後はサイトオーナーの決断次第となる。

## 最後に

インターネットが社会に浸透しはじめ、そろそろ30年になる。

その間、社会のネットリテラシーは上がり続けてきた。そしてよほどの事態がない限り、今よりネットリテラシーが下がる時代はやってこない。

そして私たちインターネット関係の事業者はみなその夢を見て仕事をしていると言っていいだろう。

自信のあるユーザーが求めるサービスはなにか？ それは「自分の思考スピードについてこれるサービス」だと考えている。

思考スピードについてこられないサービスが切り捨てられる傾向は、今後も強くなる一方である。

社会のニーズに応え、生き残るために私たちはサイトスピードを追求しなければならない。

サイトスピードの改善は、徹底して行うことで短期的にも収益改善を見込める。ぜひ多くのサイトに前向きに投資いただきたい。

- [サイトスピードと収益性を高い解像度で理解する | ideaman's Notes](https://notes.ideamans.com/posts/2024/sitespeed-profiling.html)
