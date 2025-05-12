import { categories } from '../categories.js'

export default {
  paths() {
    return categories.map((category) => ({
      params: { category: category.basename }
    }))
  }
}
