#!/usr/bin/env npx tsx

/**
 * Qiita投稿スクリプト
 * ideamans-notesのブログ記事をQiitaに下書きとして投稿する
 *
 * ビルド済みHTMLから実際の画像URLを取得して使用する
 */

import * as fs from 'fs'
import * as path from 'path'

const BASE_URL = 'https://notes.ideamans.com'
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..')
const DIST_DIR = path.join(PROJECT_ROOT, '.vitepress/dist')

// カテゴリとQiitaタグの対応表
const CATEGORY_TO_TAG: Record<string, string> = {
  sitespeed: 'WebPerformance',
  business: 'ビジネス',
  ai: 'AI',
  frontend: 'フロントエンド',
  backend: 'バックエンド',
  devops: 'DevOps',
  security: 'Security',
}

interface Frontmatter {
  title: string
  categories: string[]
  date: string
}

interface QiitaTag {
  name: string
}

interface QiitaPostRequest {
  title: string
  body: string
  private: boolean
  tags: QiitaTag[]
}

interface QiitaPostResponse {
  id: string
  url: string
  title: string
}

interface ImageMapping {
  original: string // ./ec-site-speed-ab-test/ab-test-cvr.png
  built: string // /assets/ab-test-cvr.C-BBhs_X.png
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const lines = content.split('\n')
  let inFrontmatter = false
  let frontmatterEnd = 0
  const frontmatterLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true
      } else {
        frontmatterEnd = i
        break
      }
    } else if (inFrontmatter) {
      frontmatterLines.push(line)
    }
  }

  // Parse frontmatter
  let title = ''
  let categories: string[] = []
  let date = ''

  for (const line of frontmatterLines) {
    if (line.startsWith('title:')) {
      title = line.replace('title:', '').trim()
    } else if (line.startsWith('date:')) {
      date = line.replace('date:', '').trim()
    } else if (line.startsWith('categories:')) {
      const catMatch = line.match(/\[(.*)\]/)
      if (catMatch) {
        categories = catMatch[1].split(',').map((c) => c.trim())
      }
    }
  }

  const body = lines.slice(frontmatterEnd + 1).join('\n')

  return {
    frontmatter: { title, categories, date },
    body,
  }
}

function getBuiltHtmlPath(mdFilePath: string): string {
  // posts/2026/ec-site-speed-ab-test.md → .vitepress/dist/posts/2026/ec-site-speed-ab-test.html
  const relativePath = mdFilePath.replace(PROJECT_ROOT, '').replace(/^\//, '').replace(/\.md$/, '.html')
  return path.join(DIST_DIR, relativePath)
}

function extractImageMappings(builtHtml: string, mdContent: string): ImageMapping[] {
  const mappings: ImageMapping[] = []

  // ソースマークダウンから相対画像パスを抽出
  const srcImageRegex = /src="(\.\/[^"]+)"/g
  let match
  const sourceImages: string[] = []

  while ((match = srcImageRegex.exec(mdContent)) !== null) {
    const imgPath = match[1]
    if (!sourceImages.includes(imgPath)) {
      sourceImages.push(imgPath)
    }
  }

  // ビルド済みHTMLから画像パスを抽出してマッピング
  for (const srcImg of sourceImages) {
    // ./ec-site-speed-ab-test/ab-test-cvr.png → ab-test-cvr
    const baseName = path.basename(srcImg, path.extname(srcImg))

    // ビルド済みHTMLから対応する画像を探す
    const builtImgRegex = new RegExp(`src="(/assets/${baseName}\\.[^"]+)"`)
    const builtMatch = builtHtml.match(builtImgRegex)

    if (builtMatch) {
      mappings.push({
        original: srcImg,
        built: builtMatch[1],
      })
    }
  }

  return mappings
}

function convertToAbsoluteUrls(content: string, imageMappings: ImageMapping[]): string {
  let result = content

  // 画像の相対パスをビルド済みの絶対URLに変換
  for (const mapping of imageMappings) {
    const escaped = mapping.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`src="${escaped}"`, 'g')
    result = result.replace(regex, `src="${BASE_URL}${mapping.built}"`)
  }

  // 残りの相対パス（/posts/... 形式）を絶対URLに変換
  result = result.replace(/src="(\/[^"]+)"/g, `src="${BASE_URL}$1"`)

  // リンクの相対パス変換: ](/posts/... → ](https://notes.ideamans.com/posts/...
  result = result.replace(/\]\((\/(posts|categories|authors)[^)]+)\)/g, `](${BASE_URL}$1)`)

  // /posts/... 形式の相対リンク（markdownリンク内）
  result = result.replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, `[$1](${BASE_URL}$2)`)

  return result
}

function removeToc(content: string): string {
  return content.replace(/\[\[toc\]\]\n*/g, '')
}

function addRepostNotice(body: string, title: string, articleUrl: string): string {
  const lines = body.split('\n')
  const result: string[] = []
  let firstHrFound = false

  for (const line of lines) {
    if (line.trim() === '---' && !firstHrFound) {
      firstHrFound = true
      // 転載注記を挿入
      result.push('')
      result.push(':::note info')
      result.push(`この記事は [${title}](${articleUrl}) からの転載です。`)
      result.push(':::')
      result.push('')
      result.push(line)
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}

function categoriesToTags(categories: string[]): QiitaTag[] {
  const tags = categories.map((cat) => {
    const tagName = CATEGORY_TO_TAG[cat] || cat
    return { name: tagName }
  })

  // Qiitaのタグは最大5つまで
  return tags.slice(0, 5)
}

function getArticleUrl(filePath: string): string {
  // /posts/2026/ec-site-speed-ab-test.md → https://notes.ideamans.com/posts/2026/ec-site-speed-ab-test.html
  const relativePath = filePath.replace(/^.*\/posts\//, '/posts/').replace(/\.md$/, '.html')
  return `${BASE_URL}${relativePath}`
}

async function postToQiita(request: QiitaPostRequest): Promise<QiitaPostResponse> {
  const token = process.env.QIITA_ACCESS_TOKEN

  if (!token) {
    throw new Error('QIITA_ACCESS_TOKEN 環境変数が設定されていません')
  }

  const response = await fetch('https://qiita.com/api/v2/items', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Qiita API エラー (${response.status}): ${errorBody}`)
  }

  return (await response.json()) as QiitaPostResponse
}

async function main() {
  const filePath = process.argv[2]

  if (!filePath) {
    console.error('使い方: npx tsx post-to-qiita.ts <マークダウンファイルのパス>')
    process.exit(1)
  }

  // 環境変数チェック
  if (!process.env.QIITA_ACCESS_TOKEN) {
    console.error('エラー: QIITA_ACCESS_TOKEN 環境変数が設定されていません')
    console.error('Qiita の設定画面からアクセストークンを取得し、環境変数に設定してください。')
    process.exit(1)
  }

  // ファイル読み込み
  const absolutePath = path.resolve(filePath)
  if (!fs.existsSync(absolutePath)) {
    console.error(`エラー: ファイルが見つかりません: ${absolutePath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(absolutePath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(content)

  // ビルド済みHTMLを読み込み
  const builtHtmlPath = getBuiltHtmlPath(absolutePath)
  if (!fs.existsSync(builtHtmlPath)) {
    console.error(`エラー: ビルド済みHTMLが見つかりません: ${builtHtmlPath}`)
    console.error('先に yarn build を実行してください。')
    process.exit(1)
  }

  const builtHtml = fs.readFileSync(builtHtmlPath, 'utf-8')

  // 画像マッピングを取得
  const imageMappings = extractImageMappings(builtHtml, content)
  console.log(`画像マッピング: ${imageMappings.length}件`)
  for (const mapping of imageMappings) {
    console.log(`  ${mapping.original} → ${BASE_URL}${mapping.built}`)
  }

  // 記事URL
  const articleUrl = getArticleUrl(absolutePath)

  // 本文の変換
  let convertedBody = removeToc(body)
  convertedBody = convertToAbsoluteUrls(convertedBody, imageMappings)
  convertedBody = addRepostNotice(convertedBody, frontmatter.title, articleUrl)

  // タグの変換
  const tags = categoriesToTags(frontmatter.categories)

  // タグがない場合はデフォルトタグを追加
  if (tags.length === 0) {
    tags.push({ name: 'tech' })
  }

  console.log('')
  console.log(`タイトル: ${frontmatter.title}`)
  console.log(`タグ: ${tags.map((t) => t.name).join(', ')}`)
  console.log(`元記事URL: ${articleUrl}`)
  console.log('')
  console.log('Qiitaに投稿中...')

  try {
    const response = await postToQiita({
      title: frontmatter.title,
      body: convertedBody,
      private: true,
      tags,
    })

    console.log('')
    console.log('Qiita下書きを作成しました!')
    console.log(`URL: ${response.url}`)
  } catch (error) {
    console.error('')
    console.error('投稿に失敗しました:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
