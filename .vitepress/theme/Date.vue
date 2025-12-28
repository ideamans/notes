<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from './posts.data.js'
import Dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

Dayjs.extend(utc)
Dayjs.extend(timezone)

const props = defineProps<{ date: Post['date'] }>()

const formattedDate = computed(() => {
  // frontmatterの日付は日本時間（JST）として扱う
  return Dayjs.tz(props.date, 'Asia/Tokyo').format('YYYY-MM-DD')
})
</script>

<template>
  <dl>
    <dt class="sr-only">公開日:</dt>
    <dd
      class="text-base leading-6 font-medium text-gray-500 dark:text-gray-400"
    >
      <time :datetime="date">{{ formattedDate }}</time>
    </dd>
  </dl>
</template>
