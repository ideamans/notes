---
id: miyanaga
title: Core Web Vitalsの実践的な改善術 - CLS編
date: 2024-11-09 18:29:00
categories:
  - sitespeed
  - development
  - technology
  - research

---

Core Web Vitalsのひとつ、CLS(Cumulative Layout Shift)の改善方法について解説する。

- [Cumulative Layout Shift（CLS）  |  Articles  |  web.dev](https://web.dev/articles/cls?hl=ja)

CLSの改善は他の指標に比べて難しくはない。丁寧にコーディングを行うことでほぼ解決できる。それゆえ改善済みのサイトも多い。

しかしJavaScriptによるコンポーネントのレイアウトを制御できていないWebページはまだ散見される。

この記事ではJavaScriptによるコンテンツの挿入が行われるページや、カルーセルスライダーを用いたページについて実践的なアドバイスを記した。

[[toc]]

---

## CLSとは

Webページの表示がある程度進むとユーザーは操作を始める。しかしその後でWebページのレイアウトが変化すると、ユーザーは誤操作をする可能性がある。

以下は[CLSの解説](https://web.dev/articles/cls?hl=ja)に掲載されている「注文をキャンセルするつもりが、ボタンを押す瞬間にレイアウトが変化して意図せず注文を確定してしまった例」である。

<video src="https://web.dev/static/articles/cls/video/web-dev-assets/layout-instability-api/layout-instability2.webm?hl=ja" autoplay controls muted loop />

こういうストレスを避けるため、「レイアウトはバシッと一発で決めて変わらないようにしよう」というのがCLSの指し示す価値だ。

## 何が後からレイアウトを変えるか

Webページのレイアウトを後から変化させる頻出パターンは以下の3つだ。

- 画像
- JavaScriptによるコンテンツ挿入
- カルーセルスライダー

逆に次の技術要素はWebページ表示プロセスの初期に処理されるため、レイアウトを安定化させる力がある。

- HTML
- CSS

要件はできるかぎりHTMLとCSSで実現したり、JavaScriptによる機能もこれらの段階で

### レアケース

レアケースであるが、過去にはこんな例もあった。

- JavaScriptによる高さの制御(グリッドの高さの統一)
- Webフォントがインライン要素の寸法を微妙に変えてしまう
- JavaScriptによるレスポンシブ対応の縮尺操作

## 画像のレイアウト安定化

常識的な話ではあるが、画像については`img`要素の`width`属性と`height`属性を正しく明示する。基本的にはそれだけでよい。

これらの情報がないと、画像データがダウンロードされるまで寸法がわからない。

画像データのダウンロードはWebページ表示の後半で行われるため、寸法が発覚することでのレイアウト変化がCLSを悪化させる要因になる。

CMSであれば`width`と`height`属性の指定はたいてい自動化できるが、アシストが得られない場合は、用いる画像の寸法の方を固定する運用でカバーする方法もある。

## JavaScriptによるコンテンツ挿入のレイアウト安定化

HTMLには当初存在しないコンテンツを、JavaScriptで後から挿入するケースはよくある。

JavaScriptもWebページ表示プロセスの後半で実行されるため、これもレイアウトの変化を招きCLSを悪化させる要因になりうる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/layout-change.png" alt="レイアウトの変化が発生" width="600" />

この問題への対処は、CSSの`min-height`プロパティなどであらかじめ領域を確保することだ。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/css-de-ryouiki-wo-hokyo.png" alt="CSSで領域を確保" width="600" />

領域を確保しておけば、あとからコンテンツが挿入されてもレイアウトの変化は起きない。

### 寸法が不定の場合はどうするか

JavaScriptによって後から挿入されるコンテンツの寸法が不定であるケースもある。

この場合も、予想される領域をあらかじめ確保しておくことをお勧めする。

CLSはレイアウトの変化の有無ではなく、変化の大きさを測る。したがって領域を確保しないよりは、変化量を減らしてCLSを改善に近づける。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/layout-change-width-comparison.png" alt="レイアウト変化による幅の比較" width="1200" />

### 省略記号による行数の固定

テキストの長さが不定で行数が変動する場合は、省略記号を用いて1行あるいは特定の行数に収める手法もある。

- [text-overflow - CSS: カスケーディングスタイルシート | MDN](https://developer.mozilla.org/ja/docs/Web/CSS/text-overflow)

### 設計や見せ方を見直す

最近はページの最上部に重要なお知らせを表示するパターンが増えている。この制御がJavaScriptが行われていると最も強烈なレイアウト変化を招く。

これはサイトの仕様に依存するところもあるが、本来ファーストビュー付近の主要コンテンツは初期のHTMLドキュメントに含める方がよい。

このように設計を見直すことでも、CLS悪化の要因をなかったことにできる可能性がある。

あるいはページ最上部の案内も、例えばウィンドウ下部にCSSの`position: sticky`で表示するとレイアウトの変化を招かない。見せ方を変える工夫もあるだろう。

## カルーセルスライダーのレイアウト安定化

個人的なユーザーとしてもなくなって欲しい表現ではあるが、ファーストビューにカルーセルスライダーを配置するページは多い。

このカルーセルスライダーもよくCLS悪化の原因になる。

### HTMLとCSSでモックアップを整える

カルーセルスライダーによるCLS悪化を防ぐには、HTMLとCSSが読み込まれた段階でそのレイアウトを固めることだ。

カルーセルスライダーには大きく二つの実現方針がある。

1. HTMLに存在するDOMを設計および土台として実現する。
2. JavaScriptで1からDOMを構築し対象要素に挿入して実現する。

1の場合は、表示する複数の画像がHTML上に記述されている。1枚目の画像だけはあらかじめ表示し、2枚目以降は非表示になるようなCSSを記述する。

2の場合は、対象要素の中に「動かないカルーセルスライダー」をHTMLとCSSにより描いておくとよい。

これは、**JavaScriptがカルーセルスライダーを起動する前に、モックアップを表示しておくイメージ**である。

### JavaScriptを無効にして動作確認

ではHTMLとCSSでカルーセルスライダーのモックアップを用意して、どのように動作確認をしたらよいか。

これはJavaScriptを一時的に無効にするとよい。

Chromeの管理者ツールの右上から設定を開くと、

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/network-timeline.png" alt="ネットワークのタイムライン" width="1600" height="287" />

`Debugger`のグループに`Disable JavaScript`のチェックボックスがある。このチェックボックスをOnにするとJavaScriptが無効になる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/11/chrome-debug-settings.png" alt="Chromeのデバッグ設定" width="1600" height="1027" />

:::info コマンドパレット
開発者ツールのコマンドパレット(Macであれば`⌘+Shift+P`)からも切り替えられる。筆者はその方法を利用している。
:::

この状態でWebページを開き、カルーセルスライダーが同じ寸法でそれらしく表示されればカルーセルスライダーのCLS対策は完了である。

### LCPにも効く

ファーストビューのカルーセルスライダーはたいてい、LCPの判定基準にもなる。

JavaScriptによるライブラリの起動を待たないとスライダーが表示されないのではLCPの達成に一手の遅れが出てしまう。

HTMLとCSSによるカルーセルスライダーのモックアップはその一手を縮め、LCPの改善にも効果が期待できる。
