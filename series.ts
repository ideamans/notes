// 連載（シリーズ）の定義。記事間の相互リンクは .vitepress/theme/SeriesNav.vue が
// ここを読んで描く。記事側に一覧を持たせない。
//
// date は日本時間。公開前の記事は「（M月D日公開予定）」としてリンクにならない。
// 予約公開は毎朝9:00の GitHub Actions が行うので、date の時刻はそれより前にしておく
// （そうしないと、公開された当日のビルドでまだ未公開と判定される）。

export interface SeriesPost {
  /** 公開URL。cleanUrls: false なので .html まで含める */
  url: string
  title: string
  /** 'YYYY-MM-DD HH:mm'（日本時間）。記事の frontmatter の date とそろえる */
  date: string
}

export interface Series {
  id: string
  /** 連載名。ブロックの見出しに出る */
  title: string
  /** 連載の説明。見出しの下に1段落 */
  description: string
  posts: SeriesPost[]
}

export const series: Series[] = [
  {
    id: 'lightfile-proxy',
    title: '連載「詳説 LightFile Proxy」',
    description: 'AWS CloudFrontの後ろに置いて、既存のサイトを変えずに画像をWebPで配信する仕組みを説明する連載。',
    posts: [
      {
        url: '/posts/2026/lightfile-proxy-overview.html',
        title: 'サイトに手を加えず画像をWebPで配信する仕組み',
        date: '2026-09-25 08:00'
      },
      {
        url: '/posts/2026/lightfile-proxy-extension-vs-content-type.html',
        title: '拡張子は.jpgのまま中身をWebPにしてよいのか',
        date: '2026-09-26 08:00'
      },
      {
        url: '/posts/2026/lightfile-proxy-conversion-timing.html',
        title: '画像変換のタイミングとその最適解',
        date: '2026-09-27 08:00'
      },
      {
        url: '/posts/2026/lightfile-proxy-measure-before.html',
        title: '次世代画像フォーマットの採用でどのくらい画像が軽くなるか',
        date: '2026-09-28 08:00'
      },
      {
        url: '/posts/2026/lightfile-proxy-image-quality.html',
        title: 'WebP化によるデータ削減で見た目は劣化するか',
        date: '2026-09-29 08:00'
      },
      {
        url: '/posts/2026/lightfile-proxy-failover.html',
        title: '画像のリンク切れを起こさない二重の障害対応',
        date: '2026-09-30 08:00'
      },
      {
        url: '/posts/2026/lightfile-proxy-cache.html',
        title: '無駄な変換を避け高速に画像を配信するためのキャッシュ戦略',
        date: '2026-10-01 08:00'
      },
      {
        url: '/posts/2026/lightfile-proxy-multisite.html',
        title: 'その他の細かな特徴',
        date: '2026-10-02 08:00'
      },
      {
        url: '/posts/2026/lightfile-proxy-vs-dit.html',
        title: 'AWS純正のDITで代替できるか',
        date: '2026-10-03 08:00'
      },
      {
        url: '/posts/2026/lightfile-proxy-pricing.html',
        title: '料金体系',
        date: '2026-10-04 08:00'
      }
    ]
  }
]
