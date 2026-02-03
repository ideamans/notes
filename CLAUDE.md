# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ideaman's Notes

アイデアマンズ株式会社の研究ノートブログ。VitePressをベースにした技術ブログサイト。

**サイトURL:** https://notes.ideamans.com

## 開発コマンド

```bash
# 開発サーバーの起動（ブラウザも自動で開く）
yarn dev

# プロダクションビルド
yarn build

# ビルドのプレビュー
yarn serve

# X(Twitter)へのAI投稿スクリプト
yarn x-ai-posting

# Qiitaへの下書き投稿（ビルド後に実行）
QIITA_ACCESS_TOKEN=xxx npx tsx skills/qiita/post-to-qiita.ts posts/2025/example.md
```

## 技術スタック

- VitePress 1.0（MPA mode有効）
- Vue 3（Composition API、`<script setup>`構文）
- TypeScript
- Tailwind CSS 3.4 + DaisyUI 4
- dayjs（日付処理、JSTタイムゾーン対応）
- mermaid（図表描画）

## 記事ファイルとURLのマッピング

```
/posts/{year}/{slug}.md  →  https://notes.ideamans.com/{year}/{slug}/
```

**例:**
- `/posts/2026/sitespeed-and-tv-ratings.md` → `/2026/sitespeed-and-tv-ratings/`
- `/posts/2025/blog-renewal.md` → `/2025/blog-renewal/`

**特殊ルート:**
- `/index.md`（`index: true`をfrontmatterに指定）→ `/`（ホームページ）
- カテゴリページ: `/categories/{basename}.html`（Layout.vueでパス検出し動的ルーティング）
- RSSフィード: `/feed.rss`（ビルド時にgenFeed.tsが生成）
- LLM向けテキスト: `/llms-full.txt`（ビルド時にgenLLMs.tsが生成）

## 記事のfrontmatter

```yaml
---
title: 記事タイトル（10〜30文字程度）
id: miyanaga
date: 2025-05-27 13:56:00
categories: [sitespeed, ai]
---
```

- `date`は`date`コマンドで現在日時を確認して設定する
- 日付はJST（日本標準時）として解釈される

**カテゴリ一覧**（`/categories.ts`で定義）:

| basename | 表示名 |
|----------|--------|
| sitespeed | サイトスピード改善 |
| image-fitness | 画像軽量化 |
| development | 開発 |
| ai | AI |
| automation | 自動化 |
| infrastructure | インフラ |
| content-management | コンテンツ管理 |
| business | ビジネス |
| ideas | アイデア |
| technology | 技術解説 |
| research | 研究 |

## 文体・執筆スタイル

### トーンと読者層
- **読者**: Web技術、AI、パフォーマンス最適化に関心のある技術者・ビジネス担当者
- **トーン**: プロフェッショナルだが会話的。厳密な分析と分かりやすい説明のバランス
- **視点**: 一人称（「私は〜」）で実践的な経験と洞察を共有

### 記事構成パターン

1. **導入フック**: 個人的なエピソードや問題提起（カジュアルなトーン）
2. **文脈説明**: なぜこのトピックが重要か（リサーチや外部ソースへのリンク）
3. **目次**: `[[toc]]`ディレクティブ
4. **区切り線**: `---`で導入と本文を分離
5. **本文セクション**: 詳細な解説
   - 見出し（h2/h3）で構造化
   - コードブロックと例示
   - 画像の埋め込み
   - 引用文（外部引用に`>`を使用）
   - ソース資料へのリンク
6. **結論**: 重要なポイントのまとめ

### マークダウン記法

```markdown
## 見出し2、### 見出し3 で構造化

**太字**で強調、*イタリック*で用語

[[toc]] で目次を自動生成

---（水平線）で視覚的な区切り

:::info 補足タイトル
追加情報やアップデート
:::

画像: ![説明](/posts/{year}/{slug}/image.png)
または: <img src="..." alt="" width="1600" height="XXX" />
```

## 画像の配置ルール

記事で使用する画像は `/public/posts/{year}/{slug}/` に配置する。

- **配置先**: `/public/posts/{year}/{slug}/*.png`
- **マークダウンでの参照**: `/posts/{year}/{slug}/image.png`（`/public`プレフィックス不要）
- VitePressの`public`ディレクトリはビルド時にルートとして配信される

## VitePressカスタム構成

### アーキテクチャ概要

```
/.vitepress/
├── config.ts          # VitePress設定、OGP生成、buildEndフック
├── genFeed.ts         # RSSフィード生成（buildEnd時実行）
├── genLLMs.ts         # LLM向けテキスト生成（buildEnd時実行）
└── theme/
    ├── index.ts       # テーマエントリポイント
    ├── Layout.vue     # マスターレイアウト（ルーティング制御）
    ├── Home.vue       # ホームページ
    ├── Article.vue    # 記事詳細ページ
    ├── Category.vue   # カテゴリアーカイブページ
    ├── posts.data.ts  # 記事データローダー
    ├── categories.data.ts  # カテゴリデータローダー
    └── [その他コンポーネント]
```

### データローダー（`*.data.ts`）

VitePressの`createContentLoader`を使用して記事データを読み込む。

```typescript
// posts.data.ts の構造
export interface Post {
  url: string
  title: string
  excerpt: string
  id: string
  date: string
  categories?: string[]
}

// コンポーネントでの使用
import { data as posts } from './posts.data.js'
```

### ビルドフック（`buildEnd`）

`config.ts`の`buildEnd`で実行されるカスタム処理:

1. **genFeed.ts**: RSSフィード生成（最新10件、`/feed.rss`に出力）
2. **genLLMs.ts**: 全記事を結合したテキストファイル（`/llms-full.txt`に出力）

### OGP画像の動的生成

`transformHead`フックで、外部バナーサービス（banners.ideamans.com）を使用してOGP画像URLを動的生成。

## 機能拡張方法

### 新しいVueコンポーネントを追加

1. `.vitepress/theme/`に`.vue`ファイルを作成
2. Vue 3の`<script setup lang="ts">`構文を使用
3. 親コンポーネントまたは`Layout.vue`からインポート

### 新しいデータローダーを追加

1. `.vitepress/theme/`に`{name}.data.ts`ファイルを作成
2. `createContentLoader`またはカスタム`load()`関数をエクスポート
3. コンポーネントで`import { data } from './{name}.data.js'`として使用

```typescript
// 例: .vitepress/theme/example.data.ts
import { createContentLoader } from 'vitepress'

export default createContentLoader('path/**/*.md', {
  transform(raw) {
    return raw.map(/* 変換処理 */)
  }
})
```

### 新しいビルド時生成処理を追加

1. `.vitepress/gen{Name}.ts`にasync関数を作成
2. `config.ts`の`buildEnd`フックに追加
3. 出力は`config.outDir`に書き込む

```typescript
// config.ts
buildEnd: async (config) => {
  await genFeed(config)
  await genLLMs(config)
  await genNewFeature(config)  // 新しい処理を追加
}
```

### 新しいカテゴリを追加

1. `/categories.ts`の配列にエントリを追加
2. 記事のfrontmatterで`basename`を使用
3. カテゴリページは`/categories/{basename}.html`で自動生成

## デプロイ

- mainブランチへのpushでGitHub Actionsが発火
- rsyncでサーバーに直接デプロイ

## 環境変数

```bash
# X(Twitter)投稿用
GEMINI_API_KEY=...
TWITTER_APP_KEY=...
TWITTER_APP_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
X_AI_POSTING_PROD=1  # 本番投稿を有効化

# Qiita投稿用
QIITA_ACCESS_TOKEN=...
```
