import { Category, categories } from '../../categories.js'

declare const data: Category[]
export { data, categories }

export default {
  load() {
    return categories
  }
}
