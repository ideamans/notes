import './style.css'
import './math.css'
// mermaid の図のスタイル（scripts/render-mermaid.mjs が生成）
import './mermaid.css'
import Layout from './Layout.vue'
import ServiceAd from './ServiceAd.vue'
import ZoomableImage from './ZoomableImage.vue'
import SeriesNav from './SeriesNav.vue'
import SeriesRef from './SeriesRef.vue'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('ServiceAd', ServiceAd)
    app.component('ZoomableImage', ZoomableImage)
    app.component('SeriesNav', SeriesNav)
    app.component('SeriesRef', SeriesRef)
  },
}
