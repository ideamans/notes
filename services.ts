export interface Service {
  id: string
  name: string
  url: string
  defaultLead: string
}

export const services: Service[] = [
  {
    id: 'lightfile-simulator',
    name: '画像最適化無料診断',
    url: 'https://simulator.lightfile.net/',
    defaultLead: 'URLを入力するだけで画像最適化の効果を無料診断。JPEG/PNGの最適化やWebP・AVIF変換の効果をシミュレーションできます。',
  },
  {
    id: 'lightfile-self',
    name: 'LightFile Self',
    url: 'https://self.lightfile.net/',
    defaultLead: '無料で使えるWeb画像最適化サービス。会員登録不要で、小規模サイトの画像を一括最適化できます。',
  },
  {
    id: 'lightfile-proxy',
    name: 'LightFile Proxy',
    url: 'https://www.lightfile-proxy.net/',
    defaultLead: 'CloudFrontのオリジンに設定するだけで画像を自動WebP変換。プログラムやHTML変更不要で導入できます。',
  },
  {
    id: 'lightfile-next',
    name: 'LightFile Next',
    url: 'https://next.lightfile.net/',
    defaultLead: '画像を1枚ずつ分析し、最適な設定を自動選択して軽量化。人間の手作業による画質調整を自動化します。',
  },
  {
    id: 'speedismoney',
    name: 'Speed is Money',
    url: 'https://speedis.money/',
    defaultLead: 'サイトスピードと収益の関係を明らかにする無料アクセス解析ツール。Core Web Vitalsがコンバージョンにどう影響するかを分析できます。',
  },
  {
    id: 'sitespeed-chronicle',
    name: 'サイトスピード クロニクル',
    url: 'https://chronicle.sitespeed.info/',
    defaultLead: 'CrUXデータを活用し、自社サイトと競合のCore Web Vitalsを5年間にわたって比較・分析できる無料ツールです。',
  },
  {
    id: 'pagespeed-rehearsal',
    name: 'ページスピード改善リハーサル',
    url: 'https://rehearsal.sitespeed.info/',
    defaultLead: 'スピード改善の効果を実装前に事前検証。エビデンスに基づいた確実な改善提案を実現します。',
  },
  {
    id: 'ranklet4',
    name: 'Ranklet4',
    url: 'https://ranklet4.com/',
    defaultLead: 'GA4データと連携して人気ページランキングをサイトに簡単表示。無料で利用できます。',
  },
  {
    id: 'ai-coaching',
    name: 'AI開発コーチング',
    url: 'https://ai-coaching.ideamans.com/',
    defaultLead: '自走するAI中心チームをあなたの組織に。週1回の継続セッションでAI活用を組織に定着させます。',
  },
]
