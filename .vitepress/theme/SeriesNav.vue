<script setup lang="ts">
// 連載を id で指定すると、series.ts の定義から一覧を描く。
// いま読んでいる記事はURLで見分けるので、記事側では id だけ渡せばよい。
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import { series } from '../../series.js'
import { isPublished } from './seriesState.js'
import SeriesLinks from './SeriesLinks.vue'

const props = defineProps<{ id: string }>()

const route = useRoute()

const found = computed(() => series.find((s) => s.id === props.id))

const items = computed(() =>
  (found.value?.posts ?? []).map((post) => ({
    title: post.title,
    url: post.url,
    date: post.date,
    current: route.path === post.url,
    published: isPublished(post.url)
  }))
)
</script>

<template>
  <SeriesLinks
    v-if="found"
    :heading="found.title"
    :description="found.description"
    :items="items"
  />
</template>
