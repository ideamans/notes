<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import Dayjs from 'dayjs'
import { data as posts } from './posts.data.js'
import { categories, getCategoryLabel } from '../../categories.js'

const { frontmatter } = useData()

const recentPosts = computed(() => posts.slice(0, 12))

const lastUpdate = computed(() => {
  const d = posts[0]?.date
  return d ? Dayjs(d).format('YYYY.MM.DD') : ''
})

const totalCount = computed(() => posts.length)

const visibleCategoryCount = computed(() =>
  categories.filter((c) => posts.some((p) => p.categories?.includes(c.basename))).length
)

const tagCount = computed(() => {
  const set = new Set<string>()
  posts.forEach((p) => p.tags?.forEach((t) => set.add(t)))
  return set.size
})

const currentYear = computed(() => Dayjs().format('YYYY'))
const currentMonth = computed(() => Dayjs().format('MM'))

function formatMonthDay(date: string) {
  const d = Dayjs(date)
  return `${d.format('M月D日')}`
}

function formatYear(date: string) {
  return Dayjs(date).format('YYYY')
}

function primaryCategoryLabel(p: { categories?: string[] }): string {
  const c = p.categories?.[0]
  return c ? getCategoryLabel(c) : ''
}
</script>

<template>
  <div class="nb-inner">
    <h1 class="cover-title">
      <span class="en">ideaman<span class="amp">&apos;</span>s Notes</span>
      <span class="sub"><span class="dash">— </span>アイデアマンズの研究ノート</span>
    </h1>
    <p class="cover-deck">
      Webパフォーマンス改善とAI開発の現場メモ。<br />
      読みかけ、走り書き、思いつきも、そのまま残しておく場所です。
    </p>

    <div class="cover-meta">
      <div><span class="lab">since </span><b>2024.05</b></div>
      <div><span class="lab">entries </span><b>{{ totalCount }}</b></div>
      <div v-if="lastUpdate"><span class="lab">last update </span><b>{{ lastUpdate }}</b></div>
    </div>

    <section>
      <div class="recent-h">
        <h2>最近書いたメモ</h2>
        <span class="en">— recent</span>
        <span class="meta" v-if="lastUpdate">last update · {{ lastUpdate }}</span>
      </div>

      <div class="post-list">
        <a
          v-for="post in recentPosts"
          :key="post.url"
          :href="post.url"
          class="post-row"
        >
          <div class="date">
            {{ formatMonthDay(post.date) }}
            <span class="y">{{ formatYear(post.date) }}</span>
          </div>
          <div class="body">
            <h3>{{ post.title }}</h3>
            <p v-if="post.excerpt" class="ex">{{ post.excerpt }}</p>
            <div class="tags">
              <span v-if="primaryCategoryLabel(post)" class="cat">
                {{ primaryCategoryLabel(post) }}
              </span>
              <span v-for="t in (post.tags || []).slice(0, 4)" :key="t" class="tg">
                {{ t }}
              </span>
            </div>
          </div>
          <div class="arr">→</div>
        </a>
      </div>
    </section>

  </div>
</template>
