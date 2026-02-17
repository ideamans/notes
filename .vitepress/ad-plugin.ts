/**
 * VitePress Ad Plugin for notes.ideamans.com
 *
 * frontmatterのads配列を読み取り、ServiceAdコンポーネントタグを
 * 最初のhr(thematic break)の直前と記事末尾に自動挿入する。
 */

import type MarkdownIt from 'markdown-it'

interface AdEntry {
  id: string
  lead?: string
}

function buildAdHtml(ads: AdEntry[]): string {
  return ads
    .map((ad) => {
      const leadAttr = ad.lead ? ` lead="${ad.lead.replace(/"/g, '&quot;')}"` : ''
      return `<ServiceAd id="${ad.id}"${leadAttr} />`
    })
    .join('\n')
}

export function adPlugin(md: MarkdownIt) {
  const originalRender = md.core.ruler.__rules__.find((r) => r.name === 'ad_insert')
  if (originalRender) return

  md.core.ruler.push('ad_insert', (state) => {
    const env = state.env
    if (!env?.frontmatter?.ads || !Array.isArray(env.frontmatter.ads)) {
      return
    }

    const ads: AdEntry[] = env.frontmatter.ads
    if (ads.length === 0) return

    const adHtml = buildAdHtml(ads)
    const tokens = state.tokens

    // 最初のhrトークンの直後（本文の上）に挿入
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'hr') {
        const adToken = new state.Token('html_block', '', 0)
        adToken.content = adHtml + '\n'
        tokens.splice(i + 1, 0, adToken)
        break
      }
    }

    // 末尾にも追加
    const endToken = new state.Token('html_block', '', 0)
    endToken.content = adHtml + '\n'
    tokens.push(endToken)
  })
}
