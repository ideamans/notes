import { useData as originalUseData } from 'vitepress'
import { computed } from 'vue'

export function useData() {
  const data = originalUseData()

  return {
    ...data,
    frontmatter: computed<Record<string, any>>(() => {
      return {
        ...data.frontmatter.value,
        author: '代表取締役 宮永邦彦',
        gravatar: '53ea23014763c68cf72d3d3e65dc0dd6',
        twitter: '@miyanaga'
      }
    })
  }
}
