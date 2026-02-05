---
id: miyanaga
title: INPの収集および改善提案サービスを開始
date: 2024-11-14 19:28:00
categories:
  - sitespeed
  - development
  - technology
  - research
ogp: /ogp/2024/speedismoney-fieldwork.jpg

---

Core Web Vitalsの中で [INP(Interaction to Next Paint)](https://web.dev/articles/inp?hl=ja) は、**実際のユーザーがWebページを操作して初めて計測される指標**だ。

そのため指標が悪い原因を正確に特定するのが難しい。

そこでユーザー環境で生じたINPを計測、BigQueryに収集し、調査に活かす仕組みを構築した。

そのデータを用い、理論に頼るだけではない実践的なINPの改善提案サービスを開始する。

---

## INPの調査は難しい

スピードに関する指標の多くは、Webページの読み込みプロセスに関するものだが、INPや以前のCore Web Vitalsであった [FID](https://web.dev/articles/fid?hl=ja) などはユーザーの操作に由来する。

開発者ツールのPerformanceタブには [INPを計測し、タイムラインを取得する機能](https://web.dev/articles/manually-diagnose-slow-interactions-in-the-lab?hl=ja) がある。

しかし次の理由で指標が悪い原因を特定するのは容易ではない。

- 操作の選択肢は多数ある。
- 状況やタイミングによるところがあり、再現するとは限らない。

INPの評価が悪いサイトで、開発者ツールを使って様々な操作を試してもなかなかINPの悪い数値が出ない。まるで幽霊や素粒子を見つけるような作業となる。

### TBTとINPの関連性

[TBT(Total Blocking Time)](https://web.dev/articles/tbt?hl=ja) がINPに関係すると言われている。

しかし後述するが、INPの遅延発生ポイントは大きく3つある。TBTはそのひとつにしか関係しない。TBTを改善すればよいという保証はない。

## INPを計測して詳細を記録

こういうとき予測の精度を上げる努力をしたところでそれは憶測に過ぎない。事実を計測する方がはるかに良い。

Web Vitalsの計測でお馴染みの [web-vitals](https://www.npmjs.com/package/web-vitals) パッケージには **attribution build** というバリエーションがあり、指標の数値の根拠となる情報も取得することができる。

これを用い、Webページにシンプルな`script`タグを埋め込むだけで、INPの詳細を収集する仕組みを構築した。

詳細はBigQueryに格納されるので、統計的に主要な原因を絞り込むことができるようになる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/access-log-table.png" alt="アクセスログのテーブル" width="1600" height="863" />

## INPの要素

INPは次の図が示すように、**Input delay + Processing Time + Presentation delay** の値として解釈できる。

![INPの内容](https://web.dev/static/articles/inp/image/a-diagram-depicting-inte-d2bec16a5952.svg?hl=ja)

- `Input delay` ユーザーの操作発生からイベントハンドラの起動まで。他のメインスレッドタスク(他のJavaScriptコードや、それによるレンダリングなど)が実行中だと、それが終わるまで待たされる。
- `Processing Time` イベントハンドラの実行。ひとつの操作にも段階によって複数のイベントがあり、ひとつのイベントにも複数のハンドラが割り当てられる。その全ての実行時間。
- `Presentation delay` イベントハンドラの実行後から画面上に変化が描画されるまで。DOM操作に対するレイアウト再計算や描画処理そのものの時間。

また、INPはユーザーの操作に由来するのでその原因も知りたい。

- `Interaction target` 操作の対象となったDOM要素。
- `Interaction type` 操作の内容。マウスやタッチ操作かキーボード操作か。
- `Load state` 操作が行われたタイミングのページ読み込み状態。

### BigQueryに記録される詳細

`web-vitals`のattribution buildでは上記の値をすべて検知し、以下のような構造データを得ることができる。

この構造データをそのままBigQueryに記録する。

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

例えば`loadStage`が`loading`で、時間として`inputDelay`の値が大きければ、そのINPはページ読み込み時の高負荷に巻き込まれた結果と判断できる。その場合、TBTの改善がINPの改善につながる可能性が高い。

また、`processingDuration`の値が大きければイベントハンドラに高負荷な処理があり、`presentationDelay`であればDOM操作やHTML・CSSの大きさに原因があると判断できる。

これで理論だけに頼って無責任な答えを出す必要も、開発者コンソールで幽霊や素粒子を見つける無駄な努力も不要になる。

## お問い合わせ

以上のデータを元に、サイト上のどの要素におけるどんな処理にボトルネックがあるか個別にレポートして提出する。

興味のある読者はぜひ、`contact@ideamans.com`にメールまたは、以下のフォームから問い合わせいただきたい。

<iframe src="//mautic.ideamans.com/form/6" width="100%" height="550" border="1" scrolling="no"><p>Your browser does not support iframes.</p></iframe>
