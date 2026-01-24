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
- Vue 3
- TypeScript
- Tailwind CSS 3.4 + DaisyUI 4
- dayjs（日付処理）
- mermaid（図表描画）

## アーキテクチャ

### コンテンツ構造

- `/posts/{year}/*.md` - ブログ記事（frontmatterで日付、著者、カテゴリを指定）
- `/index.md` - トップページ
- `/categories.ts` - カテゴリ定義（`basename`と`name`のペア）
- `/authors.ts` - 著者情報定義

### VitePressカスタム構成

- `/.vitepress/config.ts` - VitePress設定、OGP画像の動的生成（banners.ideamans.comを使用）、ビルドフック
- `/.vitepress/theme/` - カスタムテーマ（Vue SFC）
  - `posts.data.ts` - VitePressのcreateContentLoaderを使った記事データローダー（日付はJSTとして処理）
  - `categories.data.ts` - カテゴリデータローダー
- `/.vitepress/genFeed.ts` - ビルド時にRSSフィード生成
- `/.vitepress/genLLMs.ts` - ビルド時にLLM向けテキスト出力生成

### 自動化スクリプト

- `/agents/x-ai-posting.ts` - Gemini APIで記事紹介文を生成し、X(Twitter)に自動投稿
- `/skills/qiita/post-to-qiita.ts` - 記事をQiitaに下書き投稿（ビルド済みHTMLから画像URLを取得）

### 記事のfrontmatter

```yaml
---
title: 記事タイトル（10〜30文字程度）
id: miyanaga
date: 2025-05-27 13:56:00
categories: [sitespeed, ai]
---
```

カテゴリは`/categories.ts`で定義された`basename`を使用。

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
