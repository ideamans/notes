package main

import (
	"context"
	"fmt"
	"mime"
	"os"
	"path/filepath"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"google.golang.org/genai"
)

const model = "gemini-3-pro-image-preview"

const systemInstruction = `ユーザーが与えた記事の要点をまとめたインフォグラフィックを、以下の仕様で1200x630ピクセルのJPG画像として生成してください。
テーマや画像の仕様など、記事の内容と関係のないテキストは一切表示しないでください。
文字は最小でも20px程度の高さにしてください。

---
# デザインテーマ仕様書: Clear Sky & Vitamin Pop

## 1. テーマコンセプト
**「清潔感のあるテック・ホワイトを基調に、爽やかなスカイブルーと元気なオレンジが映える、明るくポップなモダンスタイル」**

* **全体像**: わずかに青みを含んだ「クール・ホワイト」を背景に採用し、紙媒体のような温かみではなく、デジタルデバイスならではの「透明感・先進性」を表現。
* **配色戦略**: メインの「スカイブルー」で信頼と知性を担保しつつ、補色である「ビタミンオレンジ」をアクセントに配置することで、親しみやすさとアクティブな行動喚起を促す。
* **推奨用途**: SaaS、スタートアップ、教育アプリ、ヘルスケア、モダンなダッシュボードUI。

---

## 2. カラーパレット (Color Palette)

※HEX値はOKLCHからの近似変換値です。

### 🎨 ブランドカラー (Brand Colors)
プロダクトの印象を決定づける主要色です。

| 役割 | 変数名 | HEX値 | 色の印象・用途 |
| :--- | :--- | :--- | :--- |
| **Primary** | ` + "`--color-primary`" + ` | **#00B3E6** | **スカイブルー**<br>主要ボタン、リンク、アクティブ状態。<br>爽やかさ、信頼、知性。 |
| **Secondary** | ` + "`--color-secondary`" + ` | **#FF8200** | **ビタミンオレンジ**<br>強調ボタン、バッジ、CVエリア。<br>元気、親しみ、アクセント。 |
| **Accent** | ` + "`--color-accent`" + ` | **#FF8200** | **(同上)**<br>セカンダリーと同一色設定。強い強調に使用。 |
| **Neutral** | ` + "`--color-neutral`" + ` | **#363F59** | **ネイビーグレー**<br>フッター背景、濃いグレーが必要なUI要素。<br>引き締め、安定感。 |

### 📄 ベースカラー (Base Colors)
背景やテキストなどの基礎となる色です。純粋なモノトーンではなく、青みを含んでいます。

| 役割 | 変数名 | HEX値 | 色の印象・用途 |
| :--- | :--- | :--- | :--- |
| **Base 100** | ` + "`--color-base-100`" + ` | **#F8F9FC** | **メイン背景色**<br>青みのあるクリアな白。清潔感の演出。 |
| **Base 200** | ` + "`--color-base-200`" + ` | **#F0F3F9** | **サブ背景色**<br>サイドバー、カードの背景色。薄いアイスグレー。 |
| **Base 300** | ` + "`--color-base-300`" + ` | **#E2E6F2** | **境界線・無効色**<br>ボーダー、無効化された要素。明るいブルーグレー。 |
| **Base Content**| ` + "`--color-base-content`" + `| **#262D3F** | **本文テキスト**<br>真っ黒ではない、視認性の高いダークブルーグレー。 |

### 🚦 ステータスカラー (Functional Colors)
ユーザーへのフィードバックに使用する機能色です。

| 役割 | 変数名 | HEX値 | 色の印象 |
| :--- | :--- | :--- | :--- |
| **Info** | ` + "`--color-info`" + ` | #3ABFF8 | 明るいシアン |
| **Success** | ` + "`--color-success`" + ` | #00CDB8 | ミントグリーン |
| **Warning** | ` + "`--color-warning`" + ` | #FFB600 | ゴールドイエロー |
| **Error** | ` + "`--color-error`" + ` | #FF5861 | ソフトレッド |

---

## 3. デザイン形状 (UI Shapes)

要素によって角丸の強弱を使い分け、機能的なメリハリを持たせています。

* **ボタン・セレクター (` + "`--radius-selector: 1rem`" + `)**
    * **形状**: 丸みの強いピル（カプセル）型に近い形状。
    * **意図**: 「押せるもの」としての親しみやすさと認識のしやすさを強調。
* **入力フィールド (` + "`--radius-field: 0rem`" + `)**
    * **形状**: 角（スクエア）。
    * **意図**: データの入力エリアとして、規律正しく厳格な印象を与える。
* **カード・ボックス (` + "`--radius-box: 0.25rem`" + `)**
    * **形状**: ごくわずかな角丸。
    * **意図**: モダンですっきりした印象を維持しつつ、尖りすぎない柔らかさを付与。
`

func main() {
	s := server.NewMCPServer(
		"Nanobanana",
		"1.0.0",
		server.WithToolCapabilities(true),
	)

	// Add the generate_blog_image tool
	generateImageTool := mcp.NewTool("generate_blog_image",
		mcp.WithDescription("Generate an infographic image from a blog article markdown content using Gemini API"),
		mcp.WithString("markdown",
			mcp.Required(),
			mcp.Description("The full markdown content of the blog article"),
		),
		mcp.WithString("output_path",
			mcp.Required(),
			mcp.Description("The file path where the generated image will be saved (directories will be created if they don't exist)"),
		),
	)

	s.AddTool(generateImageTool, handleGenerateBlogImage)

	// Start the server with stdio transport
	if err := server.ServeStdio(s); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
		os.Exit(1)
	}
}

func handleGenerateBlogImage(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
	markdown := req.GetString("markdown", "")
	outputPath := req.GetString("output_path", "")

	if markdown == "" {
		return mcp.NewToolResultError("markdown content is required"), nil
	}
	if outputPath == "" {
		return mcp.NewToolResultError("output_path is required"), nil
	}

	// Create Gemini client
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return mcp.NewToolResultError("GEMINI_API_KEY environment variable is not set"), nil
	}
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey: apiKey,
	})
	if err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to create Gemini client: %v", err)), nil
	}

	// Prepare the content
	contents := []*genai.Content{
		{
			Role: "user",
			Parts: []*genai.Part{
				genai.NewPartFromText(markdown),
			},
		},
	}

	// Configure the generation
	config := &genai.GenerateContentConfig{
		ResponseModalities: []string{
			"IMAGE",
			"TEXT",
		},
		ImageConfig: &genai.ImageConfig{
			ImageSize: "1K",
		},
		SystemInstruction: &genai.Content{
			Parts: []*genai.Part{
				genai.NewPartFromText(systemInstruction),
			},
		},
	}

	// Generate content using streaming
	var imageData []byte
	var imageExt string

	for result, err := range client.Models.GenerateContentStream(ctx, model, contents, config) {
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("generation error: %v", err)), nil
		}

		if len(result.Candidates) == 0 || result.Candidates[0].Content == nil || len(result.Candidates[0].Content.Parts) == 0 {
			continue
		}

		for _, part := range result.Candidates[0].Content.Parts {
			if part.InlineData != nil {
				imageData = part.InlineData.Data
				if part.InlineData.MIMEType != "" {
					exts, err := mime.ExtensionsByType(part.InlineData.MIMEType)
					if err == nil && len(exts) > 0 {
						imageExt = exts[0][1:] // Remove leading dot
					}
				}
			}
		}
	}

	if len(imageData) == 0 {
		return mcp.NewToolResultError("no image was generated"), nil
	}

	// Determine final output path
	finalPath := outputPath
	if imageExt != "" && filepath.Ext(outputPath) == "" {
		finalPath = outputPath + "." + imageExt
	}

	// Create directories if they don't exist
	dir := filepath.Dir(finalPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to create directory %s: %v", dir, err)), nil
	}

	// Write the image file
	if err := os.WriteFile(finalPath, imageData, 0644); err != nil {
		return mcp.NewToolResultError(fmt.Sprintf("failed to write file %s: %v", finalPath, err)), nil
	}

	return mcp.NewToolResultText(fmt.Sprintf("Image saved successfully to: %s", finalPath)), nil
}
