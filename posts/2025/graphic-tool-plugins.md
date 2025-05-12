---
id: miyanaga
title: Web技術で作るグラフィックツールの拡張機能
date: 2025-01-14 10:54:00
categories: ['development', 'technology']
---

次のグラフィックツールの拡張機能(プラグイン、アドオン、アプリなどの呼称)について軽く調査した。

- [Figma](https://www.figma.com/ja-jp/)
- [Canva](https://www.canva.com/)
- [Photoshop](https://www.adobe.com/jp/products/photoshop.html)

いずれも Web 技術(HTML・CSS・JavaScript)で作ることができる。HTML と CSS でユーザーインターフェースを整え、JavaScript でアプリケーションとの連携や独自の機能を実装する。

これはまさにブラウザの拡張機能と同じアプローチであり、多くのアプリケーションがそれに寄せてきている流れを感じる。

プラグイン開発と言うとハードルが高い印象があるが、今や Web のフロントエンド技術があれば簡単に挑戦できる時代になった。簡単なものであれば AI だけで実装できてしまうかもしれない。

個人的なメモも兼ねて、それぞれのグラフィックツールの拡張機能の作り方を紹介する。

[[toc]]

---

## グラフィックツールの拡張機能の作り方

### Figma の場合

こちらの記事を参考にした。

- [Figma プラグインの作り方](https://zenn.dev/ixkaito/articles/how-to-make-a-figma-plugin)

本格的な Figma プラグインはデスクトップアプリ版でしか利用できないようだ。

デスクトップアプリ版の Figma にはプラグインプロジェクトの生成機能があり、選択を進めるだけで Node.js のプロジェクトが作成できてしまう。

以下のコマンドで TypeScript からのコンパイルも自動で行われるので、コードを変更すると結果が Figma にも即座に反映される。開発体験が非常によい。

```bash
yarn watch
```

Figma のドキュメント上の要素はオブジェクト化されており、JavaScript でそれらを自由に操作できる。

次のページで Figma プラグインの API について詳しく解説されている。

- [Introduction | Plugin API](https://www.figma.com/plugin-docs/)

Figma には Web API もあり、実は当初、プラグインを開発するつもりではなく、API を使って Figma のデータを操作することを試みた。しかし、API ではドキュメントの内容までは操作できないようで、プラグインの調査を開始した経緯があった。

- [REST API - Figma](https://www.figma.com/developers/api)

### Canva の場合

Canva は「アプリ」として拡張機能を開発するようだ。こちらも NPM でプロジェクトを立ち上げる。

- [Quickstart - Canva Apps SDK Documentation](https://www.canva.dev/docs/apps/quickstart/)

Canva については試作に至らなかったが、React で開発する様子が解説されている。

日本語ではこちらの記事が参考になる。

- [\[Part 1\] Canva API を使ったアプリ作成 事始め](https://zenn.dev/aninomiya/articles/143e0ab8e50701)

### Photoshop の場合

デザインツールの雄、Photoshop も今は Web 技術ベースでプラグインを開発できる。そのプラットフォームを UXP(Unified Extensibility Platform)と呼ぶ。

- [Documentation\-UXP for Adobe Photoshop](https://developer.adobe.com/photoshop/uxp/2022/)

Photoshop の場合、UXP Developer Tool というアプケーションがあり、開発中のプラグイン管理に加え、サンドボックス環境まで用意されている。

- [Adobe UXP Developer Tool](https://developer.adobe.com/photoshop/uxp/2022/guides/devtool/)

UXP Developer Tool のサンドボックス環境で HTML ライクな UI 記述言語と JavaScript を変更すると、自前のプラグインをすぐに試すことができた。サンドボックス環境からエクスポートするとプロジェクトファイル一式を取得できる。

ひとつ試しに作ってみた。

- [miyanaga/my-first-photoshop-plugin: Photoshop でテキストオブジェクトを作成するプラグインの作例](https://github.com/miyanaga/my-first-photoshop-plugin)

Photoshop の場合、JavaScript でオブジェクト指向ライクな API を用いるのではなく、JSON で宣言的なバッチ処理を記述し、それを実行するというアプローチだった。

Photoshp には伝統的に操作を自動化するアクション機能がある。内部ではこのアクション機能を流用する形になっているのだろうと想像する。

## プラグイン・エンジニアというキャリア

プラグイン開発はハードルが高いと思われている。確かに母体となるアプリケーションと、API・SDK の体系を学ぶのは大変だ。加えてたいていはニッチな世界になるので、ネットにも情報が少ない。

しかし昨今は母体アプリケーション側にとってもエコシステムの拡充が重要な競争力になることは明らかだ。プラグイン開発体験を向上させる圧力が高まっていると感じる。重い腰を上げてみると思ったよりも簡単に作れてしまう。

筆者はプラグイン開発の需要はこれから高まると感じている。AI を業務フローに組み込むには、プラグインによるカスタマイズが最もシームレスになるからだ。

AI の活用に取り組みたい企業やエンジニアは多いだろう。それをインテグレーションする技術も重要であるが、よい意味で目立たず競争の緩やかなニッチな分野になる気がしている。

あるアプリケーションのプラグイン開発シーンで頂点を目指すのは難しいが、いろいろなアプリケーションのプラグイン開発を広く浅く得意とする「プラグイン・エンジニア」というキャリアも有望ではないかと思う。
