<script setup lang="ts">
import { computed } from 'vue'
import Dayjs from 'dayjs'
import { data as posts } from './posts.data.js'
import { categories } from '../../categories.js'

const visibleCategories = computed(() =>
  categories
    .map((c) => ({
      ...c,
      count: posts.filter((p) => p.categories?.includes(c.basename)).length
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
)

// 月別アーカイブのエントリを生成
const monthlyArchive = computed(() => {
  const map = new Map<string, number>()
  posts.forEach((p) => {
    if (!p.date) return
    const key = Dayjs(p.date).format('YYYY-MM')
    map.set(key, (map.get(key) || 0) + 1)
  })
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, count]) => {
      const [y, m] = key.split('-')
      return { year: y, month: m, count }
    })
})

const tagCount = computed(() => {
  const set = new Set<string>()
  posts.forEach((p) => p.tags?.forEach((t) => set.add(t)))
  return set.size
})
</script>

<template>
  <div class="nb-inner">
    <h1 class="idx-title">
      目次・索引<span class="en">— Index</span>
    </h1>
    <p class="idx-sub">
      これまで書きためた研究メモを、カテゴリーと月別に整理しました。
    </p>

    <div class="idx-stats">
      <div class="s r"><span class="v">{{ posts.length }}</span>本のメモ</div>
      <div class="s"><span class="v">{{ visibleCategories.length }}</span>カテゴリ</div>
    </div>

    <section class="chap">
      <div class="chap-h">
        <span class="no">ch.</span>
        <h3>カテゴリーで探す</h3>
        <span class="cnt">— by category</span>
      </div>
      <div class="cat-grid">
        <a
          v-for="cat in visibleCategories"
          :key="cat.basename"
          :href="`/categories/${cat.basename}.html`"
        >
          <span class="name">{{ cat.name }}</span>
          <span class="cnt">{{ cat.count }} entries</span>
        </a>
      </div>
    </section>

    <section class="chap" v-if="monthlyArchive.length > 0">
      <div class="chap-h">
        <span class="no">log</span>
        <h3>月別に振り返る</h3>
        <span class="cnt">— by month</span>
      </div>
      <ul class="chap-list">
        <li v-for="m in monthlyArchive" :key="`${m.year}-${m.month}`">
          <span class="b">—</span>
          <span class="t">
            <a :href="`/monthly/${m.year}-${m.month}.html`">
              {{ m.year }}年{{ Number(m.month) }}月のメモ
            </a>
          </span>
          <span class="d">{{ m.count }}本</span>
        </li>
      </ul>
    </section>

  </div>
</template>
