export interface Category {
  basename: string
  name: string
}

const categories: Category[] = [
  {
    basename: 'sitespeed',
    name: 'サイトスピード改善'
  },

  {
    basename: 'image-fitness',
    name: '画像軽量化'
  },

  {
    basename: 'development',
    name: '開発'
  },

  {
    basename: 'ai',
    name: 'AI'
  },

  {
    basename: 'automation',
    name: '自動化'
  },

  {
    basename: 'infrastructure',
    name: 'インフラ'
  },

  {
    basename: 'content-management',
    name: 'コンテンツ管理'
  },

  {
    basename: 'business',
    name: 'ビジネス'
  },

  {
    basename: 'ideas',
    name: 'アイデア'
  },

  {
    basename: 'technology',
    name: '技術解説'
  },

  {
    basename: 'research',
    name: '研究'
  },

  {
    basename: 'claude-code',
    name: 'Claude Code'
  }
]

export { categories }
