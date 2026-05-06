---
title: GridgramをAIエージェントフレンドリーにする
description: CLIツールGridgramをAIエージェントから使いやすくするために実施した取り組みを解説する。ドキュメント系（llms.txt・Context7・gg llm）とコマンド系（Skills・gg icons）の2軸で整理し、SSOTからの自動派生による情報の一貫性維持、SKILL.mdの複数エージェント対応設計など、試行錯誤の記録を詳述する。
id: miyanaga
date: 2026-04-23 13:00:00
categories:
  - development
  - ai
  - automation
ogp: /ogp/2026/gridgram-ai-agent.jpg
---

[前回の記事](/posts/2026/gridgram-concept)でGridgramのコンセプトと基本的な使い方を紹介した。今回は、このCLIツールを「AIエージェントから使いやすい状態」へ整えるべく取り組んだことを記録する。

CLIツールを作ることと、AIエージェントがそのツールをうまく使えることは別の話だ。エージェントはドキュメントを読み、コマンドを試し、診断結果を解釈できなければならない。それを可能にするには、CLIの設計段階からエージェントを意識した工夫が要る。

<img src="/posts/2026/gridgram-ai-agent/ai-agent-flow.png" alt="GridgramのAIエージェント対応を示す概念図。左側にAnthropic Claude MarketplaceとGitHub CLIからSkillsへの配布経路、中央に開発者・AIエージェント・Context7の関係、右側に.ggファイル・ggコマンド・SVG/PNGの生成フローを表現" width="1200" />

[[toc]]

---

## AIエージェントへのツール提供は試行錯誤の段階にある

本題の前に、前提を共有しておく。

AIエージェントに対するツール側の能力提供は、まだまだ発展途上の領域だ。どの粒度でドキュメントを渡すのが効果的か、どの形でコマンド群を配布するのが自然か、といった知見はこれから積み上がっていく段階にある。「このやり方が正解」と言える定型は、現時点では存在しない。

Gridgramでも、現時点で有効そうに見える経路をいくつか試し、手応えを観察している段階だ。本記事では、その試行錯誤の内容を取り組みごとに紹介する。

## 取り組みの全体像——2系統のアプローチ

Gridgramで実施したAIエージェント対応を整理すると、大きく2系統に分かれる。

**ドキュメント系**——`.gg` DSLの書き方やCLIの使い方を、AIが参照しやすい形に整えて提供するもの:
- llms.txt / llms-full.txt のWeb公開
- Context7 への登録（MCP経由で検索可能にする）
- `gg llm` サブコマンド（手元でLLM向けリファレンスMarkdownを取り出す）

**コマンド（スキル）系**——AIエージェントが作業の中で呼び出せるワークフローやサブコマンド:
- Skills（Anthropic Claude Marketplace / `gh skill install` の2経路で配布）
- `gg icons` サブコマンド（エージェントがアイコン検索に使う）

この区別が後の説明の軸になる。ドキュメント系は「エージェントが知識を得るための経路」、コマンド系は「エージェントが作業を実行するための経路」だ。

なお、これらの出口を複数持つことは、逆に言えば「同じ情報を複数の場所に保つ」ことを意味する。手で同期すれば必ず内容がずれる。この問題への答えが、後述するSSOT（単一情報源）からの自動派生だ。

## ドキュメント系の取り組み

### llms.txt / llms-full.txt——Web公開のLLM向けドキュメント

[llmstxt.org](https://llmstxt.org/)が提唱するパブリック標準に対応した。サイト直下の`/llms.txt`にリンク集Markdownを、`/llms-full.txt`に全文連結を配置する。

```bash
curl https://gridgram.ideamans.com/llms.txt
curl https://gridgram.ideamans.com/llms-full.txt
```

これはVitePressで構築したドキュメントサイトのビルド前に生成スクリプト（`bun run build-llms-txt`）を走らせる形で実現した。生成物はgitignoreとし、毎回のビルドで作り直す。

### Context7——MCP経由のドキュメント配信

[Context7](https://context7.com/)はUpstashが提供するMCPサービスだ。リポジトリに`context7.json`を置いてAdd Docsから登録すると、Context7側がドキュメントをクロールしてMCP経由で各種エージェントに配信してくれる。

```json
{
  "$schema": "https://context7.com/schema/context7.json",
  "projectTitle": "gridgram",
  "description": "Grid-based diagram rendering library and CLI...",
  "folders": ["docs/en", "examples", "src/generated"],
  "excludeFolders": ["docs/.vitepress", "docs/public", "docs/ja", ...],
  "rules": [
    "Use `doc { … }` command statements. The legacy `%%{…}%%` form is removed.",
    "Built-in Tabler icons are referenced as `tabler/<name>` (outline) or `tabler/filled/<name>` (filled).",
    "Diagnostics are warnings, not exceptions. An SVG with diagnostics is still a valid render.",
    ...
  ]
}
```

`folders`に`src/generated`を含めているのは、後述の`gg llm`が生成する`llm-reference.md`（CLIリファレンス）をContext7にも読ませるためだ。人が書いたドキュメントだけでは拾えないCLIの詳細仕様が検索でヒットするようになる。

`rules`配列の設計にも意図がある。「コードを読めば当然わかること」ではなく、「ハマりやすい落とし穴」だけを5〜10本に絞って書く。`doc { }`の記法（旧来の`%%{…}%%`記法の廃止）や、ダイアグノスティクスがエラーではなく警告である点など、実際にエージェントが間違えやすいポイントを選んだ。

Context7のMCPツールをAIエージェント（例: Claude Code）に設定しておけば、エージェントは`.gg`ファイルの記法について質問したとき、自動的にリポジトリのドキュメントを参照できる。

### `gg llm`——手元でリファレンスを取り出すサブコマンド

`gg llm`はエージェントが実行時に叩くというより、**ドキュメント配布パイプラインの一部**として機能するサブコマンドだ。

```bash
gg llm
gg llm --format json
```

実行すると、`.gg`のDSL文法、CLIオプションの一覧、`doc { }`ブロックの設定キー、代表的な使用例をひとつのMarkdownドキュメントとして出力する。この出力物がllms.txt / llms-full.txt / Context7 / Skills内のリファレンスに使われる。

バイナリとしてコンパイルしたときも、生成済みのMarkdownが静的に埋め込まれているので同様に動作する。オフライン環境のエージェントが自習のために叩く使い方も想定しているが、主眼はパイプラインでの利用だ。

### SSOT（Single Source of Truth）設計——情報を1か所から自動派生する

ドキュメントの出口が llms.txt・llms-full.txt・Context7・Skills内リファレンス・`gg llm`出力と複数になると、人力で同期するのはすぐ破綻する。CLIのオプションを1つ変えたとき、それを5か所に反映する作業は現実離れしている。

そこで、すべての派生物をソースコードから自動生成する構造にした。具体的には、次のような派生構造になっている。

<img src="/posts/2026/gridgram-ai-agent/ssot.png" alt="SSOTから派生物への自動生成フロー。左の「SSOT（ソース）」領域にsrc/gg/dsl.ts・src/cli/args.ts・llm-reference.template.md・examples/*.ggが縦に並び、中央のregen-aiスクリプトを経由して、右の「派生物」領域にicon-index.json・llm-reference.md・llms.txt・llms-full.txtが生成される" width="1200" />

`src/gg/dsl.ts`（BNF文法コメント）、`src/cli/args.ts`（CLIオプション定義）、`src/templates/llm-reference.template.md`（テンプレート）、`examples/*.gg`（サンプル群）の4つがSSOTだ。これらを原本として`bun run ai:regen`（または`/regen-ai`スキル）を実行すると、`src/generated/llm-reference.md`・`src/generated/icon-index.json`・`docs/public/llms.txt`・`docs/public/llms-full.txt`の4つが自動生成される。

派生ファイルは直接編集せず、原本を修正してから`bun run ai:regen`（または`/regen-ai`スキル）で再生成する。

このポリシーを強制するために、`.claude/rules/ai-artifacts-policy.md`というClaude Code向けのルールファイルをリポジトリにコミットしている。Claude Codeがセッションを開始するたびにこのルールを読み込み、派生物への手動編集を防ぐ仕組みだ。

さらに`regen-triggers.md`というルールファイルもある。こちらはfrontmatterの`paths:`で対象ファイルを指定し、SSOTに当たるファイルを編集したセッションでだけ読み込まれる。「`/regen-ai`を実行してください」とリマインドする役割で、常駐ルールにするとノイズになるため、必要なときだけ表示される設計にしている。

## コマンド（スキル）系の取り組み

### Skillsの設計——エージェントが呼び出せるワークフロー

Gridgramはリポジトリ内に`plugins/gridgram/`ディレクトリを持ち、4つのスキルを定義している。

| スキル | 役割 |
|--------|------|
| `gg-render` | `.gg`ファイルをSVG/PNG/JSONにレンダリング |
| `gg-icons` | Tablerアイコンの検索ワークフロー |
| `gg-author` | 説明文から`.gg`ファイルを作成してレンダリング |
| `gg-install` | `gg` CLIをGitHubリリースから導入・更新 |

各スキルは`SKILL.md`というMarkdownファイルで定義する。frontmatterにはスキル名・説明・ライセンス・互換性要件・許可ツールを書き、本文にはAIエージェント向けのワークフロー手順を書く。

```yaml
---
name: gg-render
description: Render a .gg file to SVG, PNG, or a JSON envelope using the gridgram CLI.
license: MIT
compatibility: Requires the gridgram `gg` CLI on PATH.
allowed-tools: Bash(gg:*) Bash(bun:*) Read Write
---
```

#### Agent Skills標準フィールドのみを使う

ここで重要な設計判断がある。**SKILL.mdにはAgent Skills標準フィールドのみを書く**という方針だ。

Claude Code固有の拡張フィールド（`disable-model-invocation`、`argument-hint`、`paths`など）は`metadata.claude-code.*`以下にのみ記述する。こうすることで、同一の`SKILL.md`がClaude Code、GitHub Copilot、Cursor、Gemini CLI、Codexのいずれでも動作する。

このポリシーを維持するために`scripts/validate-plugin-skills.ts`という検証スクリプトを自作し、CIで必ず通過させている。検証項目は`name`フィールドと親ディレクトリ名の一致、`description`の文字数、必須キーワードの有無、`plugin.json`のバージョンが`package.json`と一致しているかなどだ。

### 配布経路——Anthropic Claude Marketplaceと`gh skill`の2系統

#### Anthropic Claude Marketplace経由

Anthropic Claude Marketplace経由でClaude Codeにインストールするには2リポジトリ構成を採用した。

```
ideamans/gridgram（本体リポ）
└── plugins/gridgram/    ← プラグイン本体

ideamans/claude-public-plugins（別リポ）
└── .claude-plugin/marketplace.json  ← git-subdirで本体を参照
```

マーケットプレイスリポが`git-subdir`で本体リポの`plugins/gridgram`を参照するため、本体リポを更新するだけでマーケットプレイスにも自動で反映される。

```
/plugin marketplace add ideamans/claude-public-plugins
/plugin install gridgram@ideamans-plugins
```

#### `gh skill`コマンド経由

GitHubが追加した`gh skill`コマンドにも同じSKILL.mdで対応できる。

```bash
gh skill install ideamans/gridgram plugins/gridgram/skills/gg-render --agent claude-code
gh skill install ideamans/gridgram plugins/gridgram/skills/gg-icons --agent copilot
```

`gh skill install`は実行時にリポジトリ情報（`repository`、`ref`、tree SHA）をfrontmatterに注入する。この仕組みにより、`gh skill update`がバージョン変更を検出できる。本体リポで`SKILL.md`を更新すれば、ユーザー側は`gh skill update`を実行するだけで最新版を取得できる。

Agent Skills標準フィールドのみというポリシーが、ここでも活きてくる。同じファイルをClaude CodeとCopilotで共有できるため、「エージェントホストごとにSKILL.mdを別々に管理する」という手間がない。

#### `gg-install`スキルによる`gg`コマンドの導入

配布を意識して`gg-install`スキルも用意した。スキルをインストールしても`gg`コマンドがPATHにないと動かない。`gg-install`はOSとアーキテクチャを自動検出してGitHubリリースから適切なバイナリをダウンロードし、書き込み可能なディレクトリに設置する。

### `gg icons`——AIエージェントが実行時に叩くアイコン検索

`gg icons`は、エージェントが**実行時に**呼び出すサブコマンドだ。Gridgramには[Tablerアイコン](https://tabler.io/icons)6,000種類以上が組み込まれているが、その中から目的のアイコンを探すのは人間でも難しい。エージェントが総なめで検討するのは不可能だ。

```bash
# キーワードで意味的に検索
gg icons --search database --limit 10 --format json

# タグで絞り込む
gg icons --tag cloud --limit 15

# 使えるタグの一覧
gg icons --tags --limit 30
```

`--search`はアイコン名・ラベル・タグ・カテゴリを横断するファジー検索で、スコアで結果をランキングする。エージェントは`gg-icons`スキルの手順に従い、まず`--tags`でドメイン関連の語彙を確認し、`--search`で候補を絞り込むというフローを取れる。

この検索インデックス（`src/generated/icon-index.json`）はTablerアイコンのJSONダンプに加え、`src/data/icon-tags.json`という手書きのタグ補完ファイルから生成している。Tablerのメタだけでは拾えない語（`cache`、`kubernetes`、`loadbalancer`など）をここで補っている。なお`icon-index.json`もSSOTから自動生成される派生物の一つだ。

## プロジェクトローカルなClaude Code環境

プロジェクトローカルな`.claude/`ディレクトリにも仕掛けを入れている。これはリポジトリにコミットしてあるので、チームの誰がチェックアウトしても同じ環境が再現する。

```
.claude/
├── rules/
│   ├── ai-artifacts-policy.md    # 派生物の手編集禁止ポリシー（常駐ロード）
│   └── regen-triggers.md         # SSOT編集時にだけ読まれるリマインダー
└── skills/
    └── regen-ai/
        └── SKILL.md              # /regen-ai スラッシュコマンド
```

`/regen-ai`スキルは`bun run ai:regen`の実行、型チェック、テストの3ステップをまとめたものだ。SSOTを変更したあとにこれを実行すれば、すべての派生物が整合性を保って再生成される。

## AI時代のCLIツール設計——今回の試行から見えたこと

今回の取り組みを通じて、「AIエージェントフレンドリーなCLIツール」に共通して必要な要素が見えてきた。ただしこれらはあくまでも現時点での仮説であり、実際にエージェントとの協働の中で検証を続けている段階だ。

**1. ドキュメントの出口を複数持つ**
Web公開（llms.txt）・MCP（Context7）・CLIコマンド（`gg llm`）・Skills内リファレンスという複数の経路を用意することで、エージェントの環境や状況に関わらずドキュメントへのアクセス手段を確保できる。

**2. SSOTと自動派生で情報の整合性を保つ**
出口が増えるほど同期の問題が深刻になる。ソースコードを正とし、すべての出口をビルドスクリプトで自動生成する構造が必要だ。

**3. セマンティック検索のサポート**
6,000件のアイコンをキーワード・タグで絞り込める`gg icons`のように、大量の選択肢に対して、エージェントが効率よく探せる仕組みは重要だ。

**4. 決定論的な出力とエラー情報**
Gridgramは`--diagnostics`フラグで配置上の問題をJSON形式でstderrに出力する。エラーが起きても途中経過のSVGを返し、診断情報を別途提供することでエージェントが修正のループを回しやすくなる。

**5. ポータブルなスキル定義**
特定のエージェントホスト固有の仕様に依存しないAgent Skills標準フィールドで書くことで、Claude Code、GitHub Copilot、Cursorなど複数のエージェント環境に同一のスキルを提供できる。

---

Gridgramはまだ開発中のツールだが、この一連の取り組みは「CLIツールをAIエージェントと一緒に使う」という新しい開発スタイルの実験でもある。

- 公式ドキュメント（日本語）: [https://gridgram.ideamans.com/ja/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=gridgram-ai-agent](https://gridgram.ideamans.com/ja/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=gridgram-ai-agent)
- GitHub: [https://github.com/ideamans/gridgram](https://github.com/ideamans/gridgram)

コンセプト編はこちら: [Mermaid風のテキストから図解を生成するGridgram](/posts/2026/gridgram-concept)
