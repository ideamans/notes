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
```

## 技術スタック

- VitePress 1.0（MPA mode有効）
- Vue 3
- TypeScript
- Tailwind CSS 3.4 + DaisyUI 4
- dayjs（日付処理）
- mermaid（図表描画）

## アーキテクチャ

### コンテンツ構造

- `/posts/{year}/*.md` - ブログ記事（frontmatterで日付、著者、カテゴリを指定）
- `/index.md` - トップページ
- `/categories.ts` - カテゴリ定義
- `/authors.ts` - 著者情報定義

### VitePressカスタム構成

- `/.vitepress/config.ts` - VitePress設定、OGP画像生成、ビルドフック
- `/.vitepress/theme/` - カスタムテーマ（Vue SFC）
  - `Layout.vue` - メインレイアウト
  - `Article.vue`, `ArticleList.vue` - 記事表示コンポーネント
  - `posts.data.ts` - VitePressのcreateContentLoaderを使った記事データローダー
  - `categories.data.ts` - カテゴリデータローダー
- `/.vitepress/genFeed.ts` - ビルド時にRSSフィード生成
- `/.vitepress/genLLMs.ts` - ビルド時にLLM向けテキスト出力生成

### 自動化スクリプト

- `/agents/x-ai-posting.ts` - Gemini APIで記事紹介文を生成し、X(Twitter)に自動投稿するスクリプト

### 記事のfrontmatter

```yaml
---
title: 記事タイトル
id: author-username
date: 2025-01-01
categories:
  - sitespeed
  - ai
---
```

## デプロイ

- mainブランチへのpushでGitHub Actionsが発火
- rsyncでサーバーに直接デプロイ
- `.github/workflows/publish.yml`で定義

## 環境変数（x-ai-posting用）

```
GEMINI_API_KEY=...
TWITTER_APP_KEY=...
TWITTER_APP_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
X_AI_POSTING_PROD=1  # 本番投稿を有効化
```
