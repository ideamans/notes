<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import Dayjs from 'dayjs'
import { data as posts } from './posts.data.js'
import { categories, getCategoryLabel, slugifyTag } from '../../categories.js'

const { frontmatter } = useData()
const route = useRoute()

const currentIndex = computed(() => posts.findIndex((p) => p.url === route.path))
const current = computed(() => posts[currentIndex.value])

// 配列は新しい順なので、index-1 が新しい記事、index+1 が古い記事
const newerPost = computed(() =>
  currentIndex.value > 0 ? posts[currentIndex.value - 1] : null
)
const olderPost = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < posts.length - 1
    ? posts[currentIndex.value + 1]
    : null
)

const date = computed(() => current.value?.date ?? frontmatter.value.date ?? '')
const dateFormatted = computed(() =>
  date.value ? Dayjs(date.value).format('YYYY.MM.DD') : ''
)
const dateCrumb = computed(() =>
  date.value ? Dayjs(date.value).format('YYYY.MM.DD (ddd)') : ''
)

const primaryCategory = computed(() => {
  const cats = frontmatter.value.categories
  if (Array.isArray(cats) && cats.length > 0) return cats[0]
  return ''
})

const primaryCategoryLabel = computed(() =>
  primaryCategory.value ? getCategoryLabel(primaryCategory.value) : ''
)

const allTags = computed(() => {
  const t = frontmatter.value.tags
  return Array.isArray(t) ? t : []
})

const allCategories = computed(() => {
  const c = frontmatter.value.categories
  return Array.isArray(c) ? c : []
})

// 関連記事（同じプライマリカテゴリの新しい順、最新3件）
const relatedPosts = computed(() => {
  const cat = primaryCategory.value
  if (!cat) return []
  return posts
    .filter((p) => p.url !== route.path && p.categories?.includes(cat))
    .slice(0, 3)
})

const pageNumber = computed(() => {
  const idx = currentIndex.value
  if (idx < 0) return '00'
  const n = posts.length - idx
  return String(n).padStart(2, '0')
})

const readMinutes = computed(() => {
  const ex = current.value?.excerpt ?? ''
  const len = ex.length
  if (!len) return null
  return Math.max(3, Math.round(len / 30))
})
</script>

<template>
  <div class="nb-inner">
    <header class="art-head">
      <div class="crumb">
        <a href="/">ideaman's Notes</a>
        <span class="sl">/</span>
        <template v-if="primaryCategory">
          <a :href="`/categories/${primaryCategory}.html`">{{
            primaryCategoryLabel
          }}</a>
          <span class="sl">/</span>
        </template>
        <span>{{ dateFormatted }}</span>
      </div>
      <h1 class="art-title">{{ frontmatter.title }}</h1>
      <p v-if="frontmatter.description" class="art-deck">
        {{ frontmatter.description }}
      </p>
    </header>

    <div class="art-meta">
      <span><span class="lab">writer </span><b>K. Miyanaga</b></span>
      <span v-if="dateCrumb"><span class="lab">date </span><b>{{ dateCrumb }}</b></span>
      <span v-if="readMinutes !== null">
        <span class="lab">read </span><b>{{ readMinutes }}分</b>
      </span>
      <span v-if="allCategories.length > 0">
        <span class="lab">cat </span>
        <a
          v-for="(c, i) in allCategories"
          :key="c"
          :href="`/categories/${c}.html`"
          ><b>{{ getCategoryLabel(c) }}</b><span v-if="i < allCategories.length - 1">, </span></a
        >
      </span>
      <span v-if="allTags.length > 0">
        <span class="lab">tags </span>
        <a
          v-for="(t, i) in allTags"
          :key="t"
          :href="`/tags/${slugifyTag(t)}.html`"
          ><b>#{{ t }}</b><span v-if="i < allTags.length - 1">&nbsp;</span></a
        >
      </span>
    </div>

    <article class="art-body">
      <Content />
    </article>

    <!-- 関連記事 -->
    <section v-if="relatedPosts.length > 0" class="related">
      <div class="lbl">— see also</div>
      <div class="grid">
        <a
          v-for="rp in relatedPosts"
          :key="rp.url"
          :href="rp.url"
          class="it"
        >
          <div class="d">{{ Dayjs(rp.date).format('YYYY.MM.DD') }}</div>
          <h5>{{ rp.title }}</h5>
        </a>
      </div>
    </section>

    <!-- 前後ナビ -->
    <nav v-if="olderPost || newerPost" class="prev-next">
      <a v-if="olderPost" :href="olderPost.url">
        <span class="lab">← older</span>
        <span>{{ olderPost.title }}</span>
      </a>
      <span v-else></span>
      <a v-if="newerPost" :href="newerPost.url" class="next">
        <span class="lab">newer →</span>
        <span>{{ newerPost.title }}</span>
      </a>
      <span v-else></span>
    </nav>

  </div>
</template>
