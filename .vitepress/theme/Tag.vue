<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import Dayjs from 'dayjs'
import { data as allPosts } from './posts.data.js'
import { slugifyTag } from '../../categories.js'

const { params } = useData()

const tagSlug = computed(() => (params.value?.tag as string) ?? '')
const tagLabel = computed(
  () => (params.value?.tagLabel as string) ?? tagSlug.value
)

const posts = computed(() =>
  allPosts.filter((p) =>
    (p.tags ?? []).some((t) => slugifyTag(t) === tagSlug.value)
  )
)

function dot(date: string) {
  return Dayjs(date).format('MM.DD')
}
</script>

<template>
  <div class="nb-inner">
    <h1 class="idx-title">
      #{{ tagLabel }}<span class="en">— tag</span>
    </h1>
    <p class="idx-sub">
      「{{ tagLabel }}」タグが付いた研究メモの一覧です。
    </p>

    <div class="idx-stats">
      <div class="s r"><span class="v">{{ posts.length }}</span>本</div>
    </div>

    <section class="chap">
      <div class="chap-h">
        <span class="no">tag</span>
        <h3>#{{ tagLabel }}</h3>
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
            このタグの記事はありません。
          </span>
        </li>
      </ul>
    </section>

  </div>
</template>
