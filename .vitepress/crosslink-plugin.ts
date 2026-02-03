/**
 * VitePress Cross-Link UTM Plugin for notes.ideamans.com
 *
 * 記事中の自社ドメインへの絶対URLに自動的にUTMパラメータを付与するVitePressプラグイン。
 */

import type MarkdownIt from 'markdown-it'

const SOURCE_HOST = 'notes.ideamans.com'

/**
 * 自社ドメイン一覧
 */
const OWNED_DOMAINS = [
  'ideamans.com',
  'lightfile.net',
  'lightfile-proxy.net',
  'ranklet4.com',
  'speedis.money',
  'sitespeed.info',
]

/**
 * URLが自社ドメイン（サブドメイン含む）かを判定
 */
function isOwnedDomain(hostname: string): boolean {
  return OWNED_DOMAINS.some(domain =>
    hostname === domain || hostname.endsWith('.' + domain)
  )
}

/**
 * utm_mediumを決定（lettersはemail、その他はowned_media）
 */
function getMedium(sourceHost: string): string {
  return sourceHost === 'letters.ideamans.com' ? 'email' : 'owned_media'
}

/**
 * 自社ドメインへのリンクにUTMパラメータを付与
 */
export function addUtmParams(
  targetUrl: string,
  slug: string,
  campaign: string = 'regular'
): string {
  try {
    const url = new URL(targetUrl)

    // 自社ドメインでなければそのまま返す
    if (!isOwnedDomain(url.hostname)) {
      return targetUrl
    }

    // 同一ホストへのリンクはUTM不要
    if (url.hostname === SOURCE_HOST) {
      return targetUrl
    }

    // 既存のUTMパラメータがあれば上書きしない
    if (url.searchParams.has('utm_source')) {
      return targetUrl
    }

    url.searchParams.set('utm_source', SOURCE_HOST)
    url.searchParams.set('utm_medium', getMedium(SOURCE_HOST))
    url.searchParams.set('utm_campaign', campaign)
    url.searchParams.set('utm_content', slug)

    return url.toString()
  } catch {
    // 無効なURLはそのまま返す
    return targetUrl
  }
}

export interface CrosslinkPluginOptions {
  /**
   * 記事のslugを取得する関数
   * envからファイルパスなどを使用してslugを抽出する
   */
  getSlug: (env: any) => string

  /**
   * キャンペーン名（デフォルト: 'regular'）
   */
  campaign?: string
}

/**
 * VitePress markdown-it プラグイン
 *
 * リンクトークンを処理し、自社ドメインへのリンクにUTMパラメータを追加する
 */
export function crosslinkPlugin(md: MarkdownIt, options: CrosslinkPluginOptions) {
  const { getSlug, campaign = 'regular' } = options

  // リンクのレンダリングルールを上書き
  const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')

    if (hrefIndex >= 0) {
      const href = token.attrs![hrefIndex][1]

      // https://で始まる絶対URLのみ処理
      if (href.startsWith('https://')) {
        const slug = getSlug(env)
        const newHref = addUtmParams(href, slug, campaign)
        token.attrs![hrefIndex][1] = newHref
      }
    }

    return defaultRender(tokens, idx, options, env, self)
  }
}
