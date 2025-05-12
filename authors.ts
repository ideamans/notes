export interface Author {
  name: string
  username: string
  email: string
  image: string
  bio: string
}

export const authors: Author[] = [
  {
    name: '代表取締役 宮永',
    username: 'miyanaga',
    email: 'miyanaga@ideamans.com',
    image: 'https://gravatar.com/avatar/53ea23014763c68cf72d3d3e65dc0dd6',
    bio: `画像軽量化とWebフロントエンドのスピード改善の専門家です。Web系のIT技術大好き。このサイトではスピード改善のリアルや、日々の技術的な気づきを共有します。`
  }
]
