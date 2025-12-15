// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node
import { join, relative } from 'path'
import { readdir, readFile } from 'fs/promises'
import { randomInt } from 'crypto'

import { GoogleGenAI } from '@google/genai'
import Dotenv from 'dotenv'
import { TwitterApi } from 'twitter-api-v2'

Dotenv.config()

async function getRandomPost() {
  // Get all markdown files from posts directory
  const postsDir = join(process.cwd(), 'posts')
  const years = await readdir(postsDir)

  // Collect all markdown files
  const markdownFiles: string[] = []
  for (const year of years) {
    const yearDir = join(postsDir, year)
    const files = await readdir(yearDir)
    markdownFiles.push(
      ...files.filter((f) => f.endsWith('.md')).map((f) => join(yearDir, f))
    )
  }

  // Select a random file
  const randomIndex = randomInt(markdownFiles.length)
  const selectedFile = markdownFiles[randomIndex]

  // Read and return the content
  const relativePath = relative(process.cwd(), selectedFile)
  const content = await readFile(selectedFile, 'utf-8')

  return { content, relativePath }
}

async function main() {
  const { content, relativePath } = await getRandomPost()

  const entryUrl = `https://notes.ideamans.com/${relativePath.replace(
    '.md',
    '.html'
  )}`

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  })
  const config = {
    responseMimeType: 'text/plain'
  }
  const model = 'gemini-3.0-pro'
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `ユーザーが渡したMarkdownの記事を読み、その記事へのリンクをX(Twitter)で紹介する投稿文を考えてください。

# 要件

- 下記の観点を参考に、ランダムにひとつだけ考えてください。
- 120文字以内にまとめてください。
- そのまま投稿できる原稿だけを出力してください。投稿文に対するメタ説明や引用符は不要です。
- URLは不要です。
- テーマを説明する短いハッシュタグも4個ほどつけてください。
- ハッシュタグには「#AIポスト」も必ずつけてください。

# 観点

1. **全体の要約**: 「この記事では〇〇の全体像をわかりやすく解説しています」
2. **意外性のある事実**: 「えっ、〇〇って実は△△だったの？」
3. **困りごとへの問いかけ**: 「〇〇で悩んでいませんか？」
4. **新たな提言・推奨**: 「これからは“〇〇”が当たり前になるかもしれません」
5. **物語・体験談風の導入**: 「昔、〇〇で失敗した話をします…」
6. **数字・統計を使った強調**: 「〇〇%の人が知らない〇〇の話」
7. **常識への疑問・ツッコミ**: 「“〇〇すべき”って本当？ 実は…」
8. **図解・スライド付きで視覚訴求**: 「この記事を図解でまとめました👇」
9. **比較・ランキング風**: 「3つの〇〇を試してみた。最も効果的だったのは…」
10. **引用・一節紹介**: 「“〇〇〇〇”──この記事で一番響いた一文」
11. **Before/After型の変化を見せる**: 「この記事を読む前のあなた→〇〇。読んだ後のあなた→△△」
12. **対立構造で煽る**: 「あなたは〇〇派？それとも△△派？」
13. **タイムリーな話題に便乗**: 「今日のニュースを見てこの記事を思い出しました」
14. **失敗や後悔の共有**: 「昔の自分に教えたい記事」
15. **短いクイズ・なぞかけ風**: 「Q. なぜ〇〇がうまくいかない？A. 答えはこの記事に👇」
16. **あえて結論を隠す型**: 「読んだ後に“ゾッとする”内容です…」
17. **制作背景・裏話**: 「この記事を書いた理由は〇〇です」
18. **ミニマル強調（たった1つ）**: 「“これ1つ”だけで〇〇が改善します」
19. **逆張りの視点**: 「実は〇〇って必要ないと思ってます」
21. **明確な対象提示型**: 「✔〇〇な人へ届けたい内容です」
22. **他記事・著名人との関連付け**: 「〇〇さんの話を聞いてこの記事を思い出しました」
23. **保存・再訪を促す**: 「これは“ブックマーク必須”の記事です」`
        }
      ]
    },
    {
      role: 'user',
      parts: [
        {
          text: content
        }
      ]
    }
  ]

  const aiResponse = await ai.models.generateContentStream({
    model,
    config,
    contents
  })

  const chunks: string[] = []
  for await (const chunk of aiResponse) {
    chunks.push(chunk.text ?? '')
  }

  const post = [chunks.join(''), entryUrl].join('\n')
  console.log(`Xに次の投稿をします:`)
  console.log(post)

  if (process.env.X_AI_POSTING_PROD) {
    const twitter = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY!, // Consumer Key
      appSecret: process.env.TWITTER_APP_SECRET!, // Consumer Secret
      accessToken: process.env.TWITTER_ACCESS_TOKEN!, // Access Token
      accessSecret: process.env.TWITTER_ACCESS_SECRET! // Access Secret
    })

    const xResponse = await twitter.v2.tweet(post)
    console.log(`Xに投稿しました:`)
    console.log(xResponse)
  } else {
    console.log('実際の投稿はしません')
    console.log(`TWITTER_APP_KEY: ${process.env.TWITTER_APP_KEY}`)
  }
}

main()
