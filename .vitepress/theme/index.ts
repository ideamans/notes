import './style.css'
import Layout from './Layout.vue'
import ServiceAd from './ServiceAd.vue'
import ZoomableImage from './ZoomableImage.vue'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('ServiceAd', ServiceAd)
    app.component('ZoomableImage', ZoomableImage)
  },
}
