<script setup lang="ts">
// 連載の記事一覧を描くだけのコンポーネント。どの連載かは知らない。
// 公開済みならリンク、これからなら「（M月D日公開予定）」を添えたただのテキストにする。
import { computed } from 'vue'

export interface SeriesLinkItem {
  title: string
  url: string
  /** 'YYYY-MM-DD HH:mm'（日本時間） */
  date: string
  published: boolean
  current: boolean
}

const props = defineProps<{
  heading: string
  description?: string
  items: SeriesLinkItem[]
}>()

const scheduledLabel = (date: string): string => {
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ''
  return `${Number(m[2])}月${Number(m[3])}日公開予定`
}

const list = computed(() =>
  props.items.map((item) => ({ ...item, scheduled: scheduledLabel(item.date) }))
)
</script>

<template>
  <div class="custom-block info series-links">
    <p class="custom-block-title">{{ heading }}</p>
    <p v-if="description">{{ description }}</p>
    <ol>
      <li v-for="item in list" :key="item.url">
        <template v-if="item.current">
          <strong>{{ item.title }}</strong>（本記事）
        </template>
        <a v-else-if="item.published" :href="item.url">{{ item.title }}</a>
        <template v-else>
          <span class="series-links-pending">{{ item.title }}</span>
          <span class="series-links-schedule">（{{ item.scheduled }}）</span>
        </template>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.series-links-pending {
  color: var(--vp-c-text-2, #64748b);
}

.series-links-schedule {
  color: var(--vp-c-text-3, #94a3b8);
  font-size: 0.9em;
  white-space: nowrap;
}
</style>
