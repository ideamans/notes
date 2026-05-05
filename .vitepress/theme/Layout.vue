<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useData, useRoute, useRouter } from 'vitepress'
import Home from './Home.vue'
import Article from './Article.vue'
import Category from './Category.vue'
import Monthly from './Monthly.vue'
import CategoriesIndex from './CategoriesIndex.vue'
import TagsIndex from './TagsIndex.vue'
import Tag from './Tag.vue'
import OgpGallery from './OgpGallery.vue'
import NotFound from './NotFound.vue'
import { categories } from '../../categories.js'
import { data as posts } from './posts.data.js'
import Dayjs from 'dayjs'

const { page, frontmatter } = useData()
const { path } = useRoute()
const router = useRouter()

const category = computed(() => {
  const paths = path.split('/')
  if (paths[1] !== 'categories') return null
  const basename = (paths[2] || '').replace('.html', '')
  if (!basename || basename === 'index') return null
  return categories.find((c) => c.basename === basename)
})

const yearMonth = computed(() => {
  const m = path.match(/^\/monthly\/(\d{4})-(\d{2})\.html$/)
  if (!m) return null
  return { year: Number(m[1]), month: Number(m[2]) }
})

const visibleCategories = computed(() =>
  categories.filter((c) =>
    posts.some((p) => p.categories?.includes(c.basename))
  )
)

const mobileOpen = ref(false)

onMounted(() => {
  router.onAfterRouteChanged = () => {
    mobileOpen.value = false
    window.scrollTo({ top: 0 })
  }
})
</script>

<template>
  <div class="nb antialiased min-h-screen flex flex-col">
    <!-- Header -->
    <header class="fn-header">
      <div class="fn-header-inner">
        <a href="/" class="fn-logo" aria-label="ideaman's Notes">
          <img src="/notes-custom-light.svg" alt="ideaman's Notes" class="fn-logo-img" />
        </a>
        <nav class="fn-nav">
          <a href="/categories.html">目次・索引</a>
          <span class="sl">/</span>
          <a href="/feed.rss">RSS</a>
          <span class="sl">/</span>
          <a href="https://www.ideamans.com/" target="_blank" rel="noopener">
            アイデアマンズ →
          </a>
        </nav>
        <button
          class="fn-mobile-toggle"
          type="button"
          aria-label="メニューを開閉"
          @click="mobileOpen = !mobileOpen"
        >
          {{ mobileOpen ? '✕' : '≡' }}
        </button>
      </div>
      <div class="fn-mobile-menu" :class="{ 'is-open': mobileOpen }">
        <ul>
          <li><a href="/">ホーム</a></li>
          <li><a href="/categories.html">目次・索引</a></li>
          <li v-for="cat in visibleCategories" :key="cat.basename">
            <a :href="`/categories/${cat.basename}.html`">
              {{ cat.name }}
            </a>
          </li>
          <li><a href="/feed.rss">RSS Feed</a></li>
          <li>
            <a href="https://www.ideamans.com/" target="_blank" rel="noopener">
              アイデアマンズ株式会社 →
            </a>
          </li>
        </ul>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1">
      <Home v-if="frontmatter.index" />
      <CategoriesIndex v-else-if="frontmatter.categoriesIndex" />
      <TagsIndex v-else-if="frontmatter.tagsIndex" />
      <Tag v-else-if="frontmatter.tagPage" />
      <Monthly
        v-else-if="yearMonth"
        :year="yearMonth.year"
        :month="yearMonth.month"
      />
      <Category v-else-if="category" :category="category" />
      <OgpGallery v-else-if="frontmatter.pageType === 'ogps'" />
      <NotFound v-else-if="page.isNotFound" />
      <Article v-else />
    </main>

    <!-- Footer -->
    <footer class="fn-footer">
      <div class="fn-footer-inner">
        <span class="sig">— ideaman's Notes ✎</span>
        <span>
          Copyright © {{ Dayjs().year() }} —
          <a href="https://www.ideamans.com/" target="_blank" rel="noopener">
            ideaman's Inc.
          </a>
        </span>
      </div>
    </footer>
  </div>
</template>
