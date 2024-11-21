---
id: miyanaga
title: Core Web Vitalsの実践的な改善術 - INP編
date: 2024-11-21 09:42:00
---

[INP(Interaction to Next Paint)](https://web.dev/articles/inp?hl=ja)は、2023年4月に[FID(First Input Delay)](https://web.dev/articles/fid?hl=ja)と置き換わる形でCore Web Vitalsに昇格した指標だ。

- [Interaction to Next Paint（INP）  |  Articles  |  web.dev](https://web.dev/articles/inp?hl=ja)

この指標はページの読み込みに関する指標ではなく、ユーザーの操作に対する応答の速さを示す値である。

性能の低いPCを使っていると、画面上のメニューやボタンなどをクリックしてもすぐに反応せずイライラすることがあるだろう。同じ事象はWebページでも起こりうる。それがINPと捉えて間違いない。

本記事では、このINPの改善術について解説する。

---

## INPはCore Web Vitalsの新たな課題

主要通販サイト100サイトのうち、[Core Web Vitalsが良好と評価を受けているサイト](https://sitespeed-hikaku.com/reports/YYrRMKgS6Lq92ueU2W0g/compare-density?theMonth=202410)は以下の通りだ(2024年10月のデータ)。

- **CLSが良好なサイト** 63%
- **LCPが良好なサイト** 68%
- **INPが良好なサイト** 46%

以前のFIDは、評価の低いサイトは少なかった。INPに変わって評価が厳しくなった格好となった。

### INPの改善の難しさ

Core Web Vitalsの[CLS(Cumulative Layout Shift)](https://web.dev/articles/cls?hl=ja)と[LCP(Largest Contentful Paint)](https://web.dev/articles/lcp?hl=ja)は、Webページの読み込みプロセスにおいて計測される。そのためPageSpeed Insights(Lighthouse)で容易にシミュレーションできる。

ところがINPは、ユーザーがページ上で何らかの操作を行った際にはじめて計測される。何の操作を行うかはユーザーによるので、読み込みプロセスのように機械的なシミュレーションができない。

そのため試行錯誤による仮説検証を進めにくい指標であり、他の指標と異なるアプローチが必要となる。

## INPの仕組みと悪化の原因

ユーザーがページを操作すると、JavaScriptで登録されたプログラム(イベントハンドラ)が何らかの処理を行う。その結果、ページの一部が描き変わったり、次のページに遷移したりする。

このユーザーのページ操作から画面に何らかの変化が現れるまでの時間がINPである。

以下の図は[INPの解説ページ](https://web.dev/articles/inp?hl=ja)から引用したものだ。

![INPの内容](https://web.dev/static/articles/inp/image/a-diagram-depicting-inte-d2bec16a5952.svg?hl=ja)

この図に基づくと、INPは以下の時間の合計値である。

- `Input delay` イベントハンドラ実行までの待ち時間。ユーザー操作の瞬間、JavaScriptや表示に関する他の処理が行われていると、その完了を待たなければならない。
- `Processing time` イベントハンドラの処理時間。複数のイベントハンドラが登録される可能性もある。
- `Presentation delay` イベントハンドラ実行後から描画までの時間。イベントハンドラがDOMを変更すると表示レイアウトが再計算され、結果が画面に反映される。

これらの時間が長いと、その分INPが悪化する。それぞれ詳しく見ていこう。

### Input delay

ユーザーの操作に対し、登録されたイベントハンドラはすぐに実行されるとは限らない。

後述するが、ブラウザはほぼシングルスレッドなので、他の処理が行われているとその完了を待たなければならないのだ。

特にページの読み込みからしばらくは、ブラウザやJavaScript(サードパーティスクリプトも含む)はさまざまな処理を大忙しで実行している。その間にユーザーがページを操作しても、対応が後回しにされがちとなる。

このようなページの読み込みからしばらくの間の忙しさの度合いが[TBT(Total Blocking Time)](https://web.dev/articles/tbt?hl=ja)である。GoogleもTBTがINPに関係があると述べている。

TBTの改善については後述する。

### Processing time

次にイベントハンドラ自体の実行時間であるが、これは単純にイベントハンドラに長時間を要する処理があるか、またはイベントハンドラの数が異常に多いといった原因が考えられる。

事象はあまり多くはないが、長時間を要する処理としては以下のような例があった。

- **大量のDOM操作** jQueryでは大量のDOMノードを簡単な記述で操作できるが、その分処理時間は伸びる。
- **レイアウト即時計算** ページ上の要素の寸法(`width`や`height`など)を取得するとレイアウトの再計算がその場で発生することがある。
- **同期通信** サーバーとAPI通信を行う際に同期通信(`async: true`)が指定されていると、通信中ずっとメインスレッドを占有してしまう。

イベントハンドラの数は開発者ツールの`Elements`タブで確認できる。対象の要素を選択し、右側のインスペクタで`Event Listeners`を開くと登録されているイベントハンドラを一覧できる。

クリックイベントを確認するには`click`を選択する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/blog-source-code-and-monthly-report-thumbnails-september-october-2024.png" alt="ブログのソースコードと、2024年9月と10月の月報記事のサムネイル" width="1600" height="616" />

イベントハンドラの詳しいタイムラインの観察については後述する。

### Presentation delay

イベントハンドラが実行されると、DOMの変更に基づいてレイアウトの再計算が行われ(レンダリング)、その結果が実際に表示される。

レイアウトの再計算は、対象のDOMとCSS(CSSOM)に基づいて行われる。DOMとCSSが巨大であるとその分、計算に時間を要する。

### INPの対象となる操作

INPはページ上のポイント指示操作(クリックまたは画面タップ)か、キーボード操作が対象となっている。

なお、もっとも頻繁に行われる画面操作はスクロールであるが、スクロールは実はページ上の表示範囲(ビューポート)を移動しているだけでページ操作には含まれない。言うなればスクロールはページではなくウィンドウの操作である。

## INPを計測するには

INPは開発者ツールの`Performance`タブで簡単に計測できる。

### PerformanceタブでのINP計測

Performanceタブを開くとすぐにINPの表示欄がある。ページ操作を行うと、直前の操作のINPが表示され、履歴も残る。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/pagespeed-insights-and-monthly-report-202409.png" alt="ページ速度測定結果と、2024年9月度月報" width="1600" height="873" />

INPは元々値が小さく、高性能なPCではさらに処理時間が短くなる。`CPU`の設定を`20x slowdown`などに設定するとシビアに計測できる。

### ページ遷移のINPを計測するには

この計測機能は大変便利だが、弱点はページ遷移の際のINPを計測できないことだ。

そこで開発者ツールの`Console`から以下のスクリプトを実行しておくと、ページ遷移をダイアログでブロックできる。

```javascript
window.addEventListener('beforeunload', e => e.returnValue='unload?')
```

### タイムラインを詳しく観察するには

開発者ツールのPerformanceタブでは、もっと詳しくINPのタイムラインを観察できる。

Performanceタブの左上の録画ボタンを押し、対象となるページ操作を行う。そして録画ボタンの代わりに表示される停止ボタンを押すと、その間に起きたJavaScriptなどのタスクがタイムラインに表示される。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/pagespeed-insights-lightfile-ranklet.png" alt="ページスピードインサイトの計測結果と、画像最適化AIツール、LightFileの紹介記事" width="1600" height="716" />

もしINPの値が大きい操作を見つけたら、この方法で詳細な原因を特定できる。

## INPの悪化原因を正確に見つけるには

ここまでINPの計測方法を紹介したが、INPの評価が悪いサイトで実際に原因を特定するのはかなり難しいだろう。

というのも、ページ操作の選択肢は無数にあり、仮に原因となる操作がわかっても実際のユーザー環境と同じように遅いINPを再現できるとは限らない。

### 実際のユーザーからINPの詳細を集める

そこで弊社では、実際のユーザーからINPの詳細をBigQueryに収集する仕組みを構築した。

- [INPの収集および改善提案サービスを開始 | ideaman's Notes](https://notes.ideamans.com/posts/2024/speedismoney-fieldwork.html)

ユーザーが遅いINPを経験すると、そのINPの原因となった要素と操作、時間の要素であるInput delay、Processing time、Presentation delayの値があとで確認できる。

```json
{
  "inputDelay": 4.100000023841858, // Input delay
  "interactionTarget": "#responsive-menu-button", // Interaction target
  "interactionTargetElement": {
    "jQuery1102040541704606536055": 1
  },
  "interactionTime": 1793.3999999761581,
  "interactionType": "pointer", // Interaction type
  "loadState": "complete", // Load state
  "longAnimationFrameEntries": [],
  "nextPaintTime": 1825.3999999761581,
  "presentationDelay": 27.899999976158142, // Presentation delay
  "processedEventEntries": [
    {
      "duration": 32,
      "entryType": "first-input",
      "interactionId": 0,
      "name": "mousedown",
      "startTime": 1793.3999999761581
    }
  ],
  "processingDuration": 0 // Processing delay
}
```

例えば総じてInput delayが長いのであれば、ユーザーの操作時に他のタスクが実行されていたので、TBTを短縮することでINPを改善できる可能性が高い。

Processing timeが長いのであれば、その操作を開発者ツールで再現し、タイムラインを詳しく見ていくことで原因を突き詰めていける。

## TBTを改善するには

前述の通りINPにはTBTが関係すると言われており、実際にINPが悪い原因はイベントハンドラやその後の描画プロセスではなく、イベントハンドラ開始の遅延にあることが多いと思われる。

TBTはPageSpeed Insights(Lighthouse)でシミュレーションにより計測できる指標なので、試行錯誤により改善を進めやすい。

PageSpeed Insightsでも重視される指標であるので、原因の追求を待たずTBTの改善に着手してもよいだろう。それで運良くINPも改善されるかもしれない。

### ロングタスクとTBT

はじめにTBTを語る上で欠かせないロングタスクの概念について説明する。

昨今のCPUはモバイル端末においてもマルチコアが当たり前になっているが、実はブラウザにおいて多くの処理はシングルスレッド(メインスレッド)で行われている。

つまりブラウザは一度にひとつのタスクしか実行できないのだが、タスクはひとつひとつが短時間で細切れになっており、それが高速で切り替わる。それで人間にとっては、複数の処理がリアルタムかつ同時並行に感じられるようになっている。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/task-flow-diagram.png" alt="タスクA1,タスクB1,タスクA2,タスクC1,タスクB2,タスクA3が処理A,処理B,処理Cに流れる図" width="1600" height="691" />

ところがタスクの中には、メインスレッドをなかなか手放さないマナーの悪いタスクがある。**一度に50ms(0.05秒)以上の処理を行うタスクをロングタスク** と呼ぶ。

TBTは、ロングタスクの50ms超過分の合計値である。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/tasks-diagram.png" alt="タスクが並んでいる図" width="1600" height="690" />

### ロングタスクを確認する

ロングタスクの確認は開発者ツールのPerformanceタブで行う。

左上のリロードマークをクリックすると、現在表示中のページを再読み込みし、タイムラインを表示する。このとき設定において`CPU`は`4x slowdown`などにするとロングタスクを検知しやすい。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/website-performance-measurement.png" alt="ウェブサイトのパフォーマンス測定結果が表示された画面です。" width="1600" height="1132" />

右肩に赤い三角マークがついたタスクが50ms以上を要するロングタスクである。

`Bottom up`、`Call tree`、`Event log`タブでは選択したタスクをブレークダウンでき、JavaScriptの該当コードにジャンプできる。

### ロングタスクを分解する

ロングタスクは処理自体を軽量化できたら何よりだが、それはかなり難しいだろう。そこで`setTimeout`を用いて分解していく。

重い処理の続きをsetTimeout関数のコールバックに移すと、一旦そのタスクを切り上げて他のタスクにメインスレッドを譲ることができる。

例えば単体ではロングタスクにならない処理`a`〜`c`があったとして、次の記述ではロングタスク化してしまう。

```javascript
a(); // 30ms
b(); // 20ms
c(); // 30ms
// 合計80msでロングタスク化
```

これをsetTimeoutで次のタスクに送ることで、`a`〜`c`はロングタスク化を免れる。

```javascript
a(); // 30ms
setTimeout(function() { // メインスレッド解放
  b(); // 20ms
  setTimeout(function() { // メインスレッド解放
    c(); // 30ms
  });
});
```

### jQueryにおけるロングタスクの解消

jQueryは簡易な記述でDOM操作を実現できるが、これがロングタスクを引き起こす場合がある。

例えばカルーセルスライダーを起動する`slider`プラグインがあったとしよう。カルーセルスライダーの起動は複雑な処理が行われ、単体でも実行に時間を要する。ここでは30msとする。

ページにはカルーセルスライダーの適用箇所が5箇所あり、すべてクラス名`slider`がつけられている。すると、jQueryの記述は以下のようになるだろう。

```javascript
$('.slider').slider(); // 30ms × 5 = 150ms
```

jQueryのDOM操作は一息で実行されるため、ひとつ30msを要するカルーセルスライダーの起動が5つ分まとめて行われてしまう。

この問題を解決するためにもsetTimeoutを活用できる。

```javascript
$('.slider').each(function(i, el) { // .sliderを一つずつ処理
  setTimeout(function() { // メインスレッド解放
    $(el).slider(); // 30ms
  });
});
```

先ほど一息で行われた5件分のカルーセルスライダーの起動を、ひとつずつメインスレッドを解放するようにした。これによりロングタスク化を回避できる。

### サードパーティタグの場合

サードパーティタグを元に提供される社外のJavaScriptは、上記のように柔軟に変更はできない。

したがって実行タイミングを遅延させるか、使用をやめるかいずれかの消極的な対応しかできない。

この件については以下の記事に詳しく述べたので参考にしていただきたい。

- [Core Web Vitalsの改善術 - サードパーティタグ編 | ideaman's Notes](https://notes.ideamans.com/posts/2024/thirtparty-tag.html)

## まとめ

INPはユーザーの環境でのみ計測される指標で、PageSped Insights(Lighthouse)でシミュレーションできない。実態を掴みづらく、試行錯誤も難しい。また、TBTの改善にはJavaScriptの技能が要求される。

CLSに比べるとLCPも改善が難しい指標であるが、INPはそれ以上に難しいかもしれない。

しかし、手間をかけ詳細をトラッキングして、タイムラインをじっくり掘り下げることで少しずつ答えに近づくことはできる。

今回の内容を参考にぜひ改善に取り組んでいただきたい。
