---
id: miyanaga
title: 広報ブログをリニューアル・VitePressカスタマイズのコツ
date: 2025-05-06 10:43:00
---

この技術ブログと別に、以前から運用している広報ブログがある。

- [ideaman's Blog](https://blog.ideamans.com/)

長らくこれをリニューアルしたいと考えていたが、このゴールデンウィークにやっと実現した。

<img src="https://assets.ideamans.com/miyanaga/images/2025/05/ideamans-blog-webpage.png" alt="アイデアマンズブログのWebページ" width="1600" height="592" />

最近は[Cursor](https://www.cursor.com/ja)であらゆる作業を行うため、Movable TypeからVitePress + GitHub Actionsにシステムを移行した。構成をシンプルにしたのもあるが、ビルド(再構築)時間も1分41秒から5.66秒に短縮した。

いろいろと悩んだ技術選定の経緯や、[VitePress](https://vitepress.dev/)で本格ブログを構築するノウハウを共有したい。

[[toc]]

---

## ブログシステムの選定

以前のブログシステムは[Movable Type AMI版](https://www.movabletype.jp/documentation/mt7/start-guide/about-movable-type/about-movable-type-for-aws/)をAWS上で運用していた。

Movable Typeを使い続けるか、それともVitePressのようなSSG(Static Site Generator)に切り替えるかは最後まで迷った。

### 要件 - 静的Webサーバーでのホスティング

特に複雑な要件がないのであれば、静的コンテンツをシンプルなWebサーバーで運用するスタイルがよい。

まずプログラムの都合でサイトが壊れることがない。その結果、運用コストが安い。また、シンプルな分サイトの表示も早い。

### 候補1 Astro

最初に検討したのがAstroだ。Astro自体もそうだが、AstroWindというOSSのテンプレートが秀逸で、これを使いたいと思っていた。

- [Astro](https://astro.build/)
- [AstroWind | Astro](https://astro.build/themes/details/astrowind/)

ひとまずMovable Typeから約268記事をMarkdownで出力し、Astroでビルドの性能試験をしたところ、完了まで1分半くらい要した。

Astroの使い方が間違っていたのかもしれないが、ひとつの記事の更新にもこの時間がかかるようでは大きなストレスとなる。Astroの利用は断念した。

### 候補2 Movable Type

Astroのビルド時間に失望して、Movable Typeなら記事の更新だけであれば差分ビルドがあっという間に終わる。268記事もあるとやはり差分ビルドが要ると思い、Movable Typeの継続を検討した。

Movable Typeのテンプレートシステムはよく知っているが、難点はアセットパイプラインがないことだ。そこでデザインシステムは別で用意し、そこで最適化されたCSS・JavaScriptを用意。それらをテンプレートから参照するワークフローを考えた。

しかしデザインシステムとテンプレートの二重管理は、やる前から気力が削がれてしまった。

### 候補3 VitePress (採用)

本ブログではVitePressを使っている。VitePressを最初に検討しなかったのは、カスタマイズの自信がなかったからだ。

Movable Typeにはカテゴリ別、年月別といった多様で柔軟なアーカイブシステムがある。せっかく検索エンジンにインデックスされた履歴を放棄したくないので、URLのパス構造は維持したいと思っていたが、VitePressでそれを再現する方法がわからなかった。

最終的に手探りで試行錯誤しながら、Movable Typeのアーカイブシステムを概ね再現することに成功した。

VitePressはビルド時間も早い。268記事のビルドをテストしたところ、なんと2.56秒で完了した。Astroのビルド時間で勘違いをしたが、268記事というのは今やデータとしては決して多くない。

このようにViteによるアセットパイプラインがあり、アーカイブシステムも再現でき、ビルドも高速と条件が揃ったのでVitePressを採用した。

## VitePressをブログシステムに活用するTips

しかしVitePressを都合の良いブログCMSに仕立てるにはドキュメントを読み込み、トライアンドエラーが必要だった。

以下、Tipsをいくつか紹介したい。

### テンプレートシステム

はじめにCMSは通常、複数のテンプレートを管理できる。トップページ、記事詳細ページ、記事一覧ページといった具合にだ。

素のVueアプリケーションでは、`vue-router`のようなライブラリがあるが、VitePressではもっとラフなテンプレート管理を行うようだ。

`.vitepress/theme/Layout.vue`が全体的なテンプレートを司り、その中でURLパスを判定してテンプレートを切り替える。

```vue
<script setup lang="ts">
// ...
// URLパス情報を持つrouteを用いて条件分岐する
const route = useRoute()
</script>

<template>
  <!-- 略 -->
  <Home v-if="トップページのパス条件" />
  <List v-else-if="一覧ページのパス条件" />
  <Article v-else-if="詳細ページのパス条件" />
  <NotFound v-else />
  <!-- 略 -->
</template>
```

弊社の広報ブログでは以下のようになった。

- [blog-v3.vitepress/theme/Layout.vue at main · ideamans/blog-v3](https://github.com/ideamans/blog-v3/blob/main/.vitepress/theme/Layout.vue)

### 動的データの供給

デフォルトではMarkdownファイルがいわゆる記事データに対応する。しかしブログCMSではカテゴリーや著者情報など、他のデータも欲しい。

VitePressでは、`.vitepress/theme`ディレクトリに`.data.ts`ファイルを用意することでそれを実現するのが作法のようだ。

- [Build-Time Data Loading | VitePress](https://vitepress.dev/guide/data-loading)

例えば広報ブログでは以下のファイルでカテゴリーデータを供給している。

- [blog-v3/.vitepress/theme/categories.data.ts at main · ideamans/blog-v3](https://github.com/ideamans/blog-v3/blob/main/.vitepress/theme/categories.data.ts) # Vueにカテゴリーリストを供給するアダプタ
- [blog-v3/categories.ts at main · ideamans/blog-v3](https://github.com/ideamans/blog-v3/blob/main/categories.ts) # 実際のカテゴリーデータを管理するコード

`categories.data.ts`ひとつで供給することももちろん可能である。しかし、後述するRSSフィードを生成する`genFeed.ts`から`categories.data.ts`の利用が思った通りにできなかった。

そのため、`genFeed.ts`と`categories.data.ts`の両方から使える`categories.ts`を用意した。これは解決法がありそうだが、今回は見つけられなかった。

### ダイナミックルートとパスのリライト

Movable Typeは柔軟なアーカイブシステム(コンテンツとURLパスの対応付け)があり、比較的自由な切り口でURLパスを設計できる。

一方、VitePressはMarkdownファイルとURLパスが自動的に1対1に対応する。それ以外のルーティングを用意するには、[ダイナミックルート](https://vitepress.dev/guide/routing#dynamic-routes)と[パスのリライト](https://vitepress.dev/guide/routing#route-rewrites)を使う。

ダイナミックルートは、配列データを元に仮想的なMarkdownファイルを展開するような機能だ。実際にMarkdownファイルは個別には存在しないが、それに対応するルーティングが生成される。

これにより、カテゴリごとや年月ごとのURLをパスを用意できる。

ただしダイナミックルートはあくまでフラットな仮想ファイル群を用意する仕組みのようである。説明を見る限り、`/2025/04`、`/2025/05`のような階層構造を表現ができない。

そこでパスのリライトを使う。パスのリライトはMarkdownファイルのパスに対し、実際に出力するパスをマッピングできる。

例えば上記の年月は以下のようにダイナミックルートを用意し、

```text
.
└─ monthly
   ├─ [year]-[month].md
   └─ [year]-[month].paths.js
```

パスのリライトを次のようにした。

```javascript
{
  rewrites: {
    'monthly/:year-:month.md': ':year/:month/index.md'
  },
}
```

- [blog-v3/.vitepress/config.ts at main · ideamans/blog-v3](https://github.com/ideamans/blog-v3/blob/main/.vitepress/config.ts)
- [blog-v3/monthly/[year]-[month].md at main · ideamans/blog-v3](https://github.com/ideamans/blog-v3/blob/main/monthly/%5Byear%5D-%5Bmonth%5D.md) # 年月のMarkdownはダミー・実際にはテンプレートで内容を描画する
- [blog-v3/monthly/[year]-[month].paths.js at main · ideamans/blog-v3](https://github.com/ideamans/blog-v3/blob/main/monthly/%5Byear%5D-%5Bmonth%5D.paths.js)

これで

### MPAモードの明示

VitePressはSSG(Static Site Generator)だが、画面遷移はSPA的な機能も持つようだ。

詳細は不明なのだが、HTML内にはJavaScriptコードが多数埋め込まれるし、ビルドしたHTMLファイル群を静的Webサーバーにアップロードすると、特にダイナミックルートへの遷移で正常な表示が行われなくなる。

そこで、`defineConfig`による設定に`mpa: true`を渡す。これによりSPA(Single Page Application)ではなく複数ページからなるMPA(Multi Page Application)であることを明示でき、ページ遷移が正常になった。

### RSSフィードの生成

VitePress自体にはRSSフィードの生成機能はない。そこで簡易的なスクリプトを`.vitepress/genFeed.ts`を用意し、設定ファイル(`config.ts`)の`buildEnd`でそれを起動する設定を行う。

- [blog-v3/.vitepress/genFeed.ts at main · ideamans/blog-v3](https://github.com/ideamans/blog-v3/blob/main/.vitepress/genFeed.ts)

ちなみにこの方法は、Vueプロジェクトの公式ブログである以下の方法に倣っている。

- [blog/.vitepress/genFeed.ts at main · vuejs/blog](https://github.com/vuejs/blog/blob/main/.vitepress/genFeed.ts)

## まとめ

VitePress、その前身のVuePressから長らく活用させてもらってきた。しかし、ドキュメントサイトの域を出ず、このようにカスタマイズすることはなかった。

今回、Movable Typeによるブログから移行先としてさまざまなカスタマイズ手法を習得できた。

自分好みのCMSをまたひとつ手に入れられた満足感が高い。例えばLP制作などこれからの弊社のサイト展開に積極的に利用していきたい。
