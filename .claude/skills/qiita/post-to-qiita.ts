#!/usr/bin/env npx tsx

/**
 * Qiita投稿スクリプト
 * 変換済みのMarkdownをQiitaに投稿・更新する
 *
 * 画像パスの変換などの前処理はLLM側で行う
 */

import * as fs from 'fs'

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

async function postToQiita(request: QiitaPostRequest, itemId?: string): Promise<QiitaPostResponse> {
  const token = process.env.QIITA_ACCESS_TOKEN

  if (!token) {
    throw new Error('QIITA_ACCESS_TOKEN 環境変数が設定されていません')
  }

  const url = itemId ? `https://qiita.com/api/v2/items/${itemId}` : 'https://qiita.com/api/v2/items'
  const method = itemId ? 'PATCH' : 'POST'

  const response = await fetch(url, {
    method,
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
  const jsonPath = process.argv[2]

  if (!jsonPath) {
    console.error('使い方: npx tsx post-to-qiita.ts <JSONファイルのパス>')
    console.error('')
    console.error('JSONファイルの形式:')
    console.error('{')
    console.error('  "title": "記事タイトル",')
    console.error('  "body": "Markdown本文",')
    console.error('  "tags": ["tag1", "tag2"],')
    console.error('  "qiita_id": "既存記事ID（更新時のみ）"')
    console.error('}')
    process.exit(1)
  }

  if (!process.env.QIITA_ACCESS_TOKEN) {
    console.error('エラー: QIITA_ACCESS_TOKEN 環境変数が設定されていません')
    process.exit(1)
  }

  if (!fs.existsSync(jsonPath)) {
    console.error(`エラー: ファイルが見つかりません: ${jsonPath}`)
    process.exit(1)
  }

  const input = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  const { title, body, tags, qiita_id } = input

  if (!title || !body) {
    console.error('エラー: title と body は必須です')
    process.exit(1)
  }

  const qiitaTags: QiitaTag[] = (tags || ['tech']).map((t: string) => ({ name: t }))

  console.log(`タイトル: ${title}`)
  console.log(`タグ: ${qiitaTags.map((t) => t.name).join(', ')}`)
  if (qiita_id) {
    console.log(`Qiita記事ID: ${qiita_id} (更新モード)`)
  }
  console.log('')
  console.log(qiita_id ? 'Qiita記事を更新中...' : 'Qiitaに投稿中...')

  try {
    const response = await postToQiita(
      {
        title,
        body,
        private: true,
        tags: qiitaTags,
      },
      qiita_id
    )

    console.log('')
    if (qiita_id) {
      console.log('Qiita記事を更新しました!')
    } else {
      console.log('Qiita下書きを作成しました!')
      console.log(`qiita_id: ${response.id}`)
    }
    console.log(`URL: ${response.url}`)
  } catch (error) {
    console.error('')
    console.error('投稿に失敗しました:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
