# Nanobanana - 画像生成スキル

Gemini APIを使用して画像を生成する汎用スキルです。ユーザーの指示に柔軟に従って画像を生成します。

## 使い方

```
/nanobanana [指示内容]
```

例:
```
/nanobanana 猫がコーヒーを飲んでいるイラストを生成して
/nanobanana src/content/emails/2025/02-invitation-sample.md のインフォグラフィックを作成
```

## 実行手順

1. **GEMINI_API_KEY の確認**

   まず環境変数 `GEMINI_API_KEY` が設定されているか確認してください:
   ```bash
   echo $GEMINI_API_KEY
   ```

   設定されていない場合は、ユーザーに以下のメッセージを表示して設定を促してください:

   > GEMINI_API_KEY が設定されていません。
   > Google AI Studio (https://aistudio.google.com/apikey) でAPIキーを取得し、
   > 以下のコマンドで設定してください:
   > ```
   > export GEMINI_API_KEY="your-api-key"
   > ```

2. **リクエストの種類を判断**

   ユーザーのリクエストを分析し、以下のどちらかを判断してください:

   ### A. インフォグラフィック・図版の場合

   以下のいずれかに該当する場合は **インフォグラフィックモード** を使用:
   - Markdownファイルからの図版・サムネイル生成
   - 「インフォグラフィック」「図版」「OGP画像」「サムネイル」などのキーワードがある
   - ブログ記事やメールコンテンツの視覚的要約

   **実行方法:**
   ```bash
   node .claude/skills/nanobanana/generate.mjs "<プロンプト>" "<出力パス>" infographic.md
   ```

   ### B. その他の画像生成の場合

   上記以外の一般的な画像生成リクエストの場合は、システムプロンプトなしで実行:

   **実行方法:**
   ```bash
   node .claude/skills/nanobanana/generate.mjs "<プロンプト>" "<出力パス>"
   ```

3. **出力パスの決定**

   - ユーザーが指定した場合: その通りに使用
   - Markdownファイルからの生成の場合: `public/images/{年}/{ファイル名}.jpg`
   - その他の場合: ユーザーに出力先を確認するか、適切なパスを提案

4. **結果の確認**

   生成された画像のパスをユーザーに報告します。

## パラメータ

generate.mjs の引数:

| 引数 | 必須 | 説明 |
|------|------|------|
| prompt | ✓ | 画像生成のプロンプト（ユーザーの指示やMarkdown内容） |
| output_path | ✓ | 出力ファイルパス |
| system_prompt_file | - | システムプロンプトファイル（例: `infographic.md`） |

## システムプロンプトファイル

### infographic.md

ideamansブランドに沿ったインフォグラフィック・図版用のデザインガイドライン:
- 1200x630px サイズ
- 白背景ベース
- オレンジ (#E34500) アクセント
- SNS OGP画像に最適化

## 使用例

### インフォグラフィック生成
```bash
# Markdownファイルからインフォグラフィックを生成
node .claude/skills/nanobanana/generate.mjs "$(cat src/content/emails/2025/sample.md)" "public/images/2025/sample.jpg" infographic.md
```

### 一般的な画像生成
```bash
# ユーザーの指示に従って自由に画像を生成
node .claude/skills/nanobanana/generate.mjs "夕暮れの東京タワーの写真風イラスト、1200x630px" "output/tokyo-tower.jpg"
```

## 依存関係

- Node.js 18+
- GEMINI_API_KEY 環境変数
