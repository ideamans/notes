---
id: miyanaga
title: PageSpeed Insightsの正しい読み方・活かし方
date: 2024-11-08 23:15:00
---

PageSpeed InsightsはWebページのスピードを評価する際に便利なツールではあるが、非常にミスリードを起こしやすい。

目立つのはパフォーマンススコアと指摘事項の数々だが、弊社がフロントエンドのスピード改善を提案する上でそれらを見ることはほとんどない。

厳しい言い方をするとスコアはまやかしで、指摘事項は時代遅れである。加えてスコアと指摘事項に因果関係もない。

断っておくがツールを非難したいのではない。スコアと指摘事項に振り回されては、サイトを高速化したいという本来の目的は一向に果たせないことをお伝えしたい。

[[toc]]

---

## ANAトップページの例

この記事ではANAのトップページを題材にする。

- [ANAの航空券・飛行機 予約、空席照会、運賃案内|ANA](https://www.ana.co.jp/ja/jp/)

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/kokunai_tour_time_sale.png" alt="国内ツアータイムセール" width="300" />

公共性の高いサイトであり、筆者自身も高速化を願う一人の利用者である。

## 最も重要な CrUX Web Vitals

最終的に重視すべきなのは、以下の **「実際のユーザーの環境で評価する」** の欄である。

ここではいわゆるCore Web Vitalsを含む、5つの指標(**Web Vitals**)についての評価を確認できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/web-main-metrics-evaluation-failed.png" alt="ウェブに関する主な指標の評価 不合格" width="1600" height="1392" />

### リアルユーザー指標

このWeb Vitalsが最も重要である理由は、**現実を反映したリアルユーザー指標**だからだ。

Googleは、世界中のChromeユーザーから実際のサイト閲覧時のスピード指標を日頃から収集している。これをCrUX(Chrome User Experience Report)と言う。

- [CrUX の概要  |  Chrome UX Report  |  Chrome for Developers](https://developer.chrome.com/docs/crux?hl=ja)

上記に表示されているのはそのデータの過去28日分に基づく統計であり、**実際のANAサイトのユーザーがどのようなスピードでトップページを体験したか**を如実に現している。これらを **CrUX Web Vitals** と呼ぶことにする。

極端な話、PageSpeed Insightのスコアが低く多数の警告の指摘事項を示そうが、この統計が良ければ心配はない。スピード改善の最終目標はこのCrUX Web Vitalsの健全化である。

:::info
あくまでPageSpeed Insightsのレポートを使う場合の最終目標であって、リアルユーザー指標を独自に計測する場合はそちらが最終目標となるだろう。
:::

### オリジンとは

右上の「このURL」と「オリジン」には以下の意味がある。

- **このURL** 対象ページそのものの統計。ある程度の閲覧数が必要で、ページによっては表示されないこともある。
- **オリジン** 他のページも含めた `www.ana.co.jp` ドメインの全体の統計。

### CrUX Web Vitalsの見方

LCPについて見てみよう。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/page-load-time.png" alt="ページの読み込み時間" width="325" />

Googleの基準においては、LCPが2.5秒以下であればユーザーは概ね不満を感じない(良好)とされている。

:::info
もちろんスピードに対する感情は主観的なものであり、2.5秒以下でも遅いと思われる可能性はある。それでは定量的な表現ができないため、便宜的に基準が設けられている。
:::

上記のグラフは、実際にモバイル端末でANAトップページを閲覧した61%の利用者がおおむねLCPに違和感はなく、17%は逆に遅いと感じている。22%はその中間で印象は人による、といった解釈でよいだろう。

3.4秒は75パーセンタイルを示している。例えば100人のユーザーが1回ずつこのページを閲覧したとして、LCPが早かった順に並べると、75番目のユーザーは3.4秒だったということだ。

### 合格を得るには

このレポートでは **「ウェブに関する主な指標の評価」が「不合格」** とされている。

合格を得るためには、LCP、INP、CLSの3指標(Core Web Vitals)すべてにおいて、良好の割合が75%以上、つまり75%パーセンタイルが良好の基準以下になる必要がある。

つまりANAのトップページについて言えば、75パーセンタイルにおいて

- `LCP` 3.4秒から2.5秒に短縮する = 約26%高速化
- `INP` 398ミリ秒から200ミリ秒に短縮する = 約50%高速化
- `CLS` 0.49から0.1に改善する = 約80%改善

以上の改善を達成することが条件となる。

## 二番目に重要な Lightouse の指標

次に大事なデータは、 **「パフォーマンスの問題を診断する」の中にある「指標」** である。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/page-load-speed-metrics.png" alt="ページの読み込み速度に関する指標" width="1600" height="425" />

これは **実際にたった今、PageSpeed Insightsが持つブラウザでANAトップページを表示し、以下の5つのWeb Vitalsを計測した結果** だ。

- First Contentful Paint ☆
- Largest Contentful Paint ☆
- Total Blocking Time
- Cumulative Layout Shift ☆
- Speed Index

☆をつけた指標は、前述の Web Vitals と共通している。

これらのWeb Vitalsの計測には、裏側で [Lighthouse](https://chromewebstore.google.com/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk?hl=ja&pli=1) が用いられている。

そこでこちらはLighthouse Web Vitalsとここでは呼ぶことにする。

### CrUXとLighthouseの使い分け

CrUXとLighthouseは似たような指標を示すが、どう使い分けたらよいか。

CrUXの指標はリアルユーザーデータだが、フィードバックに時間がかかる。改善から最長28日待たないと正確な結果がわからない。

一方、Lighthouseは試験データではあるが、改善した結果がすぐにわかる。

したがって、**Lighthouse Web Vitalsでフィードバックを速やかに受けながら改善を繰り返し、CrUX Web Vitalsの健全化を目指す** のが使い分けであり、全体の方針となる。

### LighthouseとPageSpeed Insights

Lighthouseはソフトウェアであり、例えば読者のPCでも実行できる。手軽ではあるが、実行する端末のスペックによって結果が変わってしまう。

PageSpeed Insightsは、おそらく一定の環境でLighthouseが実行するため結果が安定しやすい。

## なぜスコアは重要ではないか

PageSpeed Insightsのレポートで最も目立つのがパフォーマンススコアだ。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/en-graph-7.png" alt="円グラフは7を示す" width="465" />

しかし実のところ、**このスコアを見ても次にどんなアクションをとるべきか、ほとんどヒントにもならない。**

その理由を簡単に説明したい。

### スコアはLighthouse Web Vitalsの平均点

先に述べた5つのLighthouse Web Vitalsそれぞれに対し、値が小さければ100点に近く、一定以上の大きさだと0点になるような点数を割り当てる。

例えばLCPは以下のような曲線でスコアが決まる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/lcp-score-value-graph.png" alt="LCPのスコアと値の関係を示すグラフ" width="1288" height="1530" />

それらの平均点(実際は重みの違う加重平均)がスコアとして表示される。

もしスコアが100点に近ければ、どの指標も優秀である説明にはなるのだが、スコアが20点だった場合、どの指標に問題があるのか正確に説明ができない。

### スコアは0点以下にならない

LCPについて言えば、10秒を超えたあたりからLCPスコアは0点になる。

ANAのトップページではLCPが31.9秒と評価されている。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/page-load-speed-metrics.png" alt="ページの読み込み速度に関する指標" width="1600" height="425" />

LCPが10秒と31.9秒では対策がずいぶん異なるが、スコアの上ではどちらも0点である。この点も当てにならない。

### スコアはただの結果

Lighthouse Web Vitalsを改善していけば自ずとスコアは上がる。それだけの数値であって、スコア自体の説明力は低い。

スコアを重要視しないのはそういった理由からである。

## 指摘事項はなぜ重要ではないか

最後にレポートの下部にある指摘事項の数々だ。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/layout-unchanged.png" alt="レイアウトが大きく変わらないようにする" width="1600" height="899" />

この指摘事項も人気がある。サイトスピード改善提案を名乗る資料が、これらの指摘事項のコピペとその補足説明に過ぎない場面は何度も目にした。

しかしこちらも、弊社がフロントエンドの改善提案する際にほとんど見ることはない。

### フロントエンドが遅い理由はデータサイズではない

多いのはリソースデータの軽量化についての事項であるが、データが大きいとサイトが重いというのは10年前の話だと言っていい。

もちろんデータは少しでも軽量な方がいい。しかし極端な例を除き、データを軽量化して早くなるのはよくても1秒という話だ。

数秒単位で指標の短縮が必要な場面で、データの軽量化を繰り広げても焼石に水なのである。

### 主戦場はJavaScriptと3rdパーティタグ

多くのフロントエンドのボトルネックを見てきた経験から言うと、今やWeb Vitalsが悪い原因のほとんどはJavaScriptである。

その意味で言うと、以下の指摘事項だけはたまに参考にすることがある。

- JavaScript の実行にかかる時間の低減
- 第三者コードの影響を抑えてください

JavaScriptに詳しい人は少ない。JavaScriptプログラマーが少ないわけではないのだが、彼らの多くはもっと最新の技術が好きで、Webページのレガシーコードなど見たくない。

だからJavaScriptについての分析や課題解決は避けられ、その他の技術課題(データ軽量化など)から着手される傾向がある。

### 答えはパフォーマンスタイムラインにある

では成果の出る改善のために指摘事項は見ずにどこを見るか。

主には開発者ツールの **Performance** タイムラインを見る。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/webpage-performance-analysis.png" alt="ウェブページのパフォーマンス分析" width="1600" height="1010" />

フロントエンドが遅い本当の答えは、このタイムラインにある。

## まとめ

以上、PageSpeed Insightsの正しい見方を述べてきた。

- 大切なのはCrUXとLighthouseのWeb Vitalsの値
- スコアは重要な情報を持たない
- 指摘事項はほとんど当てにならない

これらを理解いただき、スコアと指摘事項に振り回されず、実のあるスピード改善に取り組んでいただけたら幸いである。
