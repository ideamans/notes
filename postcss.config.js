// Tailwind CSS 4 は PostCSS プラグインが別パッケージになった。
// 設定（content・プラグイン・テーマ）は CSS 側（.vitepress/theme/style.css）に移してある。
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
