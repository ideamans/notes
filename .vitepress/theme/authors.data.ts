import { Author, authors } from '../../authors.js'

declare const data: Author[]
export { data }

export default {
  load() {
    return authors
  }
}
