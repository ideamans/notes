<script setup lang="ts">
import { computed } from 'vue'
import Dayjs from 'dayjs'
import { data as allPosts } from './posts.data.js'

const props = defineProps<{
  year: number
  month: number
}>()

const startsWith = computed(() =>
  Dayjs(new Date(props.year, props.month - 1, 1)).format('YYYY-MM')
)

const posts = computed(() =>
  allPosts.filter((p) => (p.date || '').startsWith(startsWith.value))
)

function dot(date: string) {
  return Dayjs(date).format('MM.DD')
}
</script>

<template>
  <div class="nb-inner">
    <h1 class="idx-title">
      {{ year }}年{{ month }}月のメモ
      <span class="en">— monthly</span>
    </h1>
    <p class="idx-sub">{{ year }}年{{ month }}月に書きためた研究メモの一覧です。</p>

    <div class="idx-stats">
      <div class="s r">
        <span class="v">{{ posts.length }}</span>本
      </div>
      <div class="s">
        <span class="v">{{ String(month).padStart(2, '0') }}</span>月の更新
      </div>
    </div>

    <section class="chap">
      <div class="chap-h">
        <span class="no">{{ year }}.{{ String(month).padStart(2, '0') }}</span>
        <h3>{{ year }}年{{ month }}月</h3>
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
            この月には記事がありません。
          </span>
        </li>
      </ul>
    </section>

  </div>
</template>
