import './style.css'
import Layout from './Layout.vue'
import ServiceAd from './ServiceAd.vue'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('ServiceAd', ServiceAd)
  },
}
