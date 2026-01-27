# Qiita投稿スキル

ideamans-notesのブログ記事をQiitaに下書きとして投稿・更新します。

## 使い方

```
/qiita [記事のパス]
```

## LLM側で行う処理

スクリプトに渡す前に、以下の変換処理をLLM側で行うこと：

### 1. 画像URLの絶対パス変換

記事内の画像パスを以下のルールで変換する。

**ベースURL:** `https://notes.ideamans.com`

**変換ルール:**

1. **絶対URL（`https://` など）** → そのまま
   ```markdown
   ![example](https://example.com/image.png)
   # 変換なし
   ```

2. **`/` から始まるパス** → ベースURLを先頭に付加
   ```markdown
   ![example](/images/photo.png)
   ↓
   ![example](https://notes.ideamans.com/images/photo.png)
   ```

3. **`/` 以外の文字から始まるパス（相対パス）** → 記事のディレクトリURLを基準にrebase
   ```markdown
   # 記事: posts/2026/http-playback-proxy.md
   # 記事のディレクトリURL: https://notes.ideamans.com/posts/2026/

   ![記録の仕組み](./http-playback-proxy/recording.png)
   ↓
   ![記録の仕組み](https://notes.ideamans.com/posts/2026/http-playback-proxy/recording.png)

   ![別の画像](../shared/image.png)
   ↓
   ![別の画像](https://notes.ideamans.com/posts/shared/image.png)
   ```

**重要:**
- 画像は https://notes.ideamans.com/ にデプロイ済み
- 相対パスは記事ファイルのディレクトリを基準に解決する
- `./` は現在のディレクトリ、`../` は親ディレクトリを意味する

**VitePressの画像ハッシュ対応:**

VitePressはビルド時に画像を `/assets/` フォルダにハッシュ付きで配置する。
相対パスから実際のURLを特定するには、ビルド済みHTMLを確認する：

```bash
# ビルド済みHTMLから画像URLを取得
grep -oE 'src="/assets/[^"]+\.(png|jpg|gif|webp)"' .vitepress/dist/posts/2026/記事名.html
```

例:
- ソース: `./http-playback-proxy/recording.png`
- ビルド後: `/assets/recording.pHxjn1OZ.png`
- 絶対URL: `https://notes.ideamans.com/assets/recording.pHxjn1OZ.png`

### 2. 内部リンクの絶対パス変換

サイト内リンクも絶対URLに変換する。

```markdown
# 変換前
[関連記事](/posts/2025/example.html)

# 変換後
[関連記事](https://notes.ideamans.com/posts/2025/example.html)
```

### 3. [[toc]] の削除

VitePress独自の目次記法を削除する。

### 4. 転載注記の追加

本文の最初の `---`（水平線）の前に転載注記を挿入する。

```markdown
:::note info
この記事は [記事タイトル](元記事URL) からの転載です。
:::
```

### 5. カテゴリからタグへの変換

frontmatterのcategoriesをQiitaタグに変換：
- `sitespeed` → `WebPerformance`
- `business` → `ビジネス`
- `ai` → `AI`
- その他はそのまま使用
- タグは最大5つまで

## スクリプトの実行

変換済みのデータをJSONファイルに書き出し、スクリプトを実行する。

```bash
npx tsx .claude/skills/qiita/post-to-qiita.ts <JSONファイルのパス>
```

### JSONファイルの形式

```json
{
  "title": "記事タイトル",
  "body": "変換済みMarkdown本文",
  "tags": ["WebPerformance", "tag2"],
  "qiita_id": "既存記事ID（更新時のみ）"
}
```

- `title`: 必須
- `body`: 必須（変換済みMarkdown）
- `tags`: 省略時は `["tech"]`
- `qiita_id`: 指定すると更新モード、省略すると新規作成

## 投稿後の処理

### qiita_idの記入

新規投稿後、スクリプトが出力した `qiita_id` を記事のfrontmatterに追記すること。

```yaml
---
title: 記事タイトル
categories:
  - sitespeed
qiita_id: abc123def456  # ← これを追記
---
```

これにより、次回同じ記事を投稿する際は更新モードになる。

## 環境変数

`QIITA_ACCESS_TOKEN` - Qiita APIのアクセストークン（必須）
