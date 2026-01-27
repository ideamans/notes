# Qiita投稿スキル

このスキルは、ideamans-notesのブログ記事をQiitaに下書きとして投稿します。

## 使い方

```
/qiita [記事のパス]
```

引数が省略された場合は、現在IDEで開いているファイルを対象とします。

## 実行方法

以下のコマンドを実行してください:

```bash
source ~/.zshrc && npx tsx skills/qiita/post-to-qiita.ts <記事のパス>
```

例:
```bash
source ~/.zshrc && npx tsx skills/qiita/post-to-qiita.ts posts/2026/ec-site-speed-ab-test.md
```

## 処理内容

1. 指定されたマークダウンファイルを読み込む
2. frontmatterからタイトルとカテゴリを抽出
3. 以下の変換を行う:
   - `[[toc]]` を削除
   - 相対URLを絶対URL（`https://notes.ideamans.com/`ベース）に変換
   - frontmatter直後の `---` の位置に転載元の注記を追加
4. Qiita APIで下書きとして投稿（private: true）
5. 作成された記事のURLを表示

## 環境変数

`QIITA_ACCESS_TOKEN` - Qiita APIのアクセストークン（必須）

トークンがない場合は警告を出して終了します。

## カテゴリとタグの対応

ideamans-notesのカテゴリをQiitaのタグに変換:
- `sitespeed` → `WebPerformance`
- `business` → `ビジネス`
- `ai` → `AI`
- その他はそのまま使用

## 注意事項

- 投稿は必ず `private: true`（下書き）として作成される
- Qiitaのタグは最大5つまで
- 画像はQiitaにはアップロードされず、元サイトへの絶対URLとなる
