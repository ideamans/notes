---
id: miyanaga
title: サイトスピードと収益性を高い解像度で理解する
date: 2024-10-26 09:31:00
---

サイトスピードが遅いとサイトの収益性が悪化し、逆に早ければ儲かる。それはよく知られている。しかし **なぜそうなるのか説明** するには、少し高い解像度で理解していないと難しい。

サイトスピードが早くなると収益が上がると言うが、その財源は一体どこにあるのか？ 誰がどう払ってくれるものなのか。

単純化すると、**サイトスピードは機会損失率と成約率のトレードオフを調整するレバー** のようなものだ。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/yubi-ga-boton-o-oshiteiru.png" alt="指がボタンを押している" width="400" />

実はWebサイトは、サイトスピードに起因する機会損失を常に抱えている。サイトスピードが早くなれば機会損失率が減って成約率が増える。遅くなればその逆に作用する。

機会損失という見えないものを見るにはデータが要る。通販サイトの実例を交えて詳しく見てみよう。

[[toc]]

---

## 結論

これから紹介する実際の通販サイトでは **成約率 0.8%** であるが、**サイトスピードによる機会損失率は全体の 約1.7%** に及ぶ。現に得ている収益より機会損失の方が大きく、むしろ倍以上あるのだ。

だからサイトスピードを改善すれば、埋蔵金を掘るように機会損失を財源とした収益が手に入る。

### 成約率(CVR)について

本題に入る前に成約率(CVR)について少しおさらいをしよう。

通販サイトを例にすると、ユーザーはサイトを訪れて複数のページを閲覧、操作した後に注文を完了する。当然、途中で離脱するユーザーもいるし、直帰するユーザーもいる。

運よく注文にいたることをコンバージョンと呼び、訪問数に対するコンバージョンの割合を成約率やCVR(コンバージョンレート)という。

現実には、注文まではいたらず離脱するユーザーの方がずっと多い。**成約率はふつう数パーセント程度**で、1%を下回るケースも珍しくない。

つまり100人のユーザーがサイトに訪れても、実際に注文するのはせいぜい数人ということだ。

:::info ユーザーとセッション(訪問)について
実際にはひとりのユーザーが複数回、サイトを再訪することもある。訪問の数をセッション数と呼び、成約率はセッション数を分母にすることが多い。ただ再訪は通常そこまで多くないので、この記事では訪問数=セッション数≒ユーザー数という扱いをする。
:::

## サイトスピードと成約率の実例

次のグラフは実際のある通販サイトにおける、ページ読み込み時間と成約率(CVR)の関係を示したものだ。

- **横軸→** ユーザー(セッション)ごとの平均ページ読み込み時間(平均OnLoad)。それを20分割した階級
- **縦軸↑** 成約率(CVR)。グラフの都合上、数値は右軸

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/page_load_time_and_cvr.png" alt="ページの読み込み時間とCVRの関係" width="1013" height="513" />

実はユーザーは、みんな同じスピードでサイトを利用できているわけではない。私たちが思う以上にユーザーやページによってスピードにはばらつきがある。

平均数秒でページを読み込みできたユーザーから、10秒以上かかったユーザーまで体験はまちまちとなる。

:::info サイトスピードに関する認知バイアス
私もそうだが、サイト提供者側は「ユーザーも自分と同じくらいのスピードでサイトを利用している」と思いがちである。データを見るときは自分もユーザーとしてはN=1のサンプルにすぎないことを改めて理解したい。
:::

### サイトスピードによる成約率の差は8.3倍

グラフからは以下のことがわかる。

- サイトスピードが早いと **成約率は約2.5%** にもなる。これを **潜在的成約率** を呼ぶことにする。
- 読み込み時間が遅くなるほど成約率は低下する。つまり注文が成立しにくくなる。
- 大体8秒を超えると **0.3%程度で横ばい** になる。
- サイトスピードが早いユーザーと遅いユーザーでは成約率に **8.3倍** (≒ 2.5% / 0.3%) の差がある。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/yomi-komi-jikan-cvr.png" alt="読み込み時間が短くなるほど成約率(CVR)が低下" width="1013" height="513" />

もちろん階級を20に設定した恣意性があり、その前提によって数値は前後する。本質的な傾向として理解いただきたい。

## サイトスピードによるユーザー層の分類

このグラフから購買性向というか利用者の気分のようなものを想像して、ユーザー層を分類してみる。

### 絶対買わない層 97.5%

成約率について振り返った通り、ほとんどユーザーは注文をせずに離脱する。

いくらサイトスピードが早かったとしても潜在的成約率は約2.5%だった。つまり100% - 2.5% = 約97.5% のユーザーは、

- **「そもそも買う気はない」**
- **「サイトがいくら早かろうが、いらないものはいらない」**

…のようなことを考えていたと想像できる。これらのユーザーはサイトスピードに関係なく **絶対買わない層** である。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/graph-average-onload-cvr-session.png" alt="グラフは、横軸に平均OnLoad、縦軸にCVRとセッション数を示している。" width="1600" height="939" />

:::info サイトスピード以外の離脱要因
もちろん離脱の要因にはサイトスピード以外にもいろいろある。この記事およびグラフではあくまでサイトスピードに着目しており、その他の離脱はサイトスピードと独立して現れるものと想定している。
:::

### 絶対買う層 0.3%

逆に、サイトスピードがいくら遅くても約0.3%のユーザーは注文に到達した。そのことから、約0.3%のユーザーは

- **「何がなんでも欲しい」**
- **「今日、どうしても注文しなければならない」**

…のようなことを考えていたのではないだろうか。これらのユーザーはサイトスピードに関係なく **絶対買う層** である。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/cvr-graph.png" alt="CVRの推移がグラフで示されている" width="1600" height="811" />

### 買うかも層 2.2%

絶対買わない層と絶対買う層の間の約2.2%、ここは **買うかも層** だ。

- **「いちおう買うつもりでいる」**
- **「気になる商品はある」**
- **「うっかり衝動買いしちゃうかも」**

…のようなことを考えており、体験したサイトスピードにより行動が左右する。最終的に注文したユーザーと離脱したユーザーが混在する層である。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/graph-session-cvr-time.png" alt="グラフは、横軸に秒数を、縦軸にセッション数とCVRの割合を示しています。セッション数は、0.81秒で80%を超え、その後減少傾向にあります。CVRは、0.81秒で0%から始まり、14.67秒で0.5%を超え、その後横ばいになっています。" width="1600" height="939" />

### 最終的な成約率 0.8%

では、買うかも層 2.2% のうち、注文に到達した **運よく注文層** と、買う気はあったが離脱してしまった **機会損失層** はどのくらいの割合になるか。

それは **最終的な成約率 0.8%** を描くとよくわかる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/graph-cvr-time.png" alt="グラフは、時間経過によるCVRの変化を表す。" width="1600" height="802" />

なんと買うかも層 2.2%のうち運よく注文に到達したのはわずか 約0.5%で、**大部分の約1.7%はサイトスピードが遅いことによる機会損失に消えていた**のである。

## なぜそんなに機会損失が多いのか

厳しい言い方をすると、このサイトは必要に駆られた品物は提供しているが、ふわふわと楽しい気分の買い物体験はあまり提供できていない。

ユーザーの声を想像すると、

- **「サイトが遅いのが気になってそれどころではない」**

といったあたりだろうか。

しかしこのサイトが他のサイトと比べて特別遅いというわけではない。どのサイトも多かれ少なかれ似たような状況なのだ。

### ユーザー(セッション)数をグラフに重ねる

このように「多くの機会損失が生じている」と言われてもピンとこないかもしれない。特に自身のサイトがそうだと言われたら、にわかに信じられないだろう。

しかし実際のユーザー(セッション)数の分布をグラフに重ねてみるときっと納得できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/histogram-and-line-graph.png" alt="ヒストグラムと折れ線グラフ" width="1014" height="514" />

成約率(CVR)が最大化する階級のセッション数が少なく、逆に成約率(CVR)が低下した階級のセッション数が多い。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/graph-on-load-time-cvr-sessions.png" alt="グラフは、横軸にオンロード時間、縦軸にCVRとセッション数を示しています。" width="1600" height="911" />

つまり成約率が高くなるようなサイトスピード体験を、多くのユーザーに提供できていないミスマッチが大きいのである。

### サイトスピード 20%改善 → 収益 22%向上の見込み

もし、**サイトスピードが一律20%改善できたら**どうなるかシミュレーションしてみよう。

より多くのユーザー(セッション)に早いサイトスピードを提供することになると、分布の山が左方向にシフトする。下図でいうと緑のヒストグラムである。

それによりユーザーに快適なサイトスピードを提供できていないミスマッチがいくらか解消され、機会損失率が低下→成約率が上昇する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/site-speed-cvr-shift.png" alt="サイトスピードの改善でセッションの分布がCVRの高い方にシフトする" width="1600" height="998" />

全体の成約率は、新たなヒストグラムの度数と階級に対応する成約率の加重平均で大まかに計算し直せる。

それによると **20%のサイトスピード改善で成約率は 0.8% から 0.98% になる見込み** となる。これは、**収益(売上)でいうと 22.37% の増加** に相当する。

### サイトスピード 20%悪化 → 収益 -15%減少の見込み

逆にサイトスピードが低下すると分布の山が右にシフトし、ミスマッチがさらに拡大する。同様に全体の成約率を加重平均で計算すると、**20%のサイトスピード悪化で成約率は 0.8%から 0.68%に低下し、収益は -15.19%減少** する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/10/histogram-graph.png" alt="ヒストグラムが描かれたグラフ" width="1017" height="629" />

## まとめ

以上がサイトスピードと収益性の詳細な関係性であり、**サイトスピードは機会損失率と成約率のトレードオフを調整するレバー** と比喩した根拠である。

サイトスピードがユーザーによってまちまちであるため、それに起因する機会損失が常に生じている。サイトスピードの変化でボーダーラインにいるユーザー行動が注文達成か離脱か揺れ動く。それが収益を左右するという因果関係となる。

筆者も以前、サイトが遅いと離脱が増えて収益性が下がるというのはわかるが、早いと収益性が上がるといってもその財源が何なのか、うまく説明できずモヤモヤした感情を抱いていた。

その当時の自分を納得させる思いで文章を記した。共感が得られたら幸いである。