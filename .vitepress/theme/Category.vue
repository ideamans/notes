<script setup lang="ts">
import { computed } from 'vue'
import Dayjs from 'dayjs'
import { Category, categories } from '../../categories.js'
import { data as allPosts } from './posts.data.js'

const props = defineProps<{
  category: Category
}>()

const posts = computed(() =>
  allPosts.filter((p) => p.categories?.includes(props.category.basename))
)

const visibleCategories = computed(() =>
  categories.filter((c) =>
    allPosts.some((p) => p.categories?.includes(c.basename))
  )
)

const allCount = computed(() => allPosts.length)

function categoryCount(basename: string) {
  return allPosts.filter((p) => p.categories?.includes(basename)).length
}

function dot(date: string) {
  return Dayjs(date).format('MM.DD')
}
</script>

<template>
  <div class="nb-inner">
    <h1 class="idx-title">
      {{ category.name }}<span class="en">— {{ category.basename }}</span>
    </h1>
    <p class="idx-sub">
      「{{ category.name }}」カテゴリの研究メモ一覧です。
    </p>

    <div class="idx-stats">
      <div class="s r">
        <span class="v">{{ posts.length }}</span>本
      </div>
      <div class="s">
        <span class="v">{{ allCount }}</span>全件
      </div>
    </div>

    <nav class="idx-tabs">
      <a class="idx-tab" href="/categories.html">
        すべて<span class="c">{{ allCount }}</span>
      </a>
      <a
        v-for="cat in visibleCategories"
        :key="cat.basename"
        class="idx-tab"
        :class="{ active: cat.basename === category.basename }"
        :href="`/categories/${cat.basename}.html`"
      >
        {{ cat.name }}<span class="c">{{ categoryCount(cat.basename) }}</span>
      </a>
    </nav>

    <section class="chap">
      <div class="chap-h">
        <h3>{{ category.name }}</h3>
        <span class="cnt">— {{ posts.length }} entries</span>
      </div>
      <ul class="chap-list">
        <li v-for="p in posts" :key="p.url">
          <span class="b">—</span>
          <span class="t">
            <a :href="p.url">{{ p.title }}</a>
          </span>
          <span class="d">{{ dot(p.date) }}</span>
          <span v-if="p.excerpt" class="ex">{{ p.excerpt }}</span>
        </li>
        <li v-if="posts.length === 0" style="grid-template-columns: 1fr">
          <span style="color: var(--ink-mute); text-align: center; padding: 16px 0">
            このカテゴリにはまだ記事がありません。
          </span>
        </li>
      </ul>
    </section>

  </div>
</template>
