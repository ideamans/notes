<script setup lang="ts">
import type { Post } from './posts.data.js'
import Dayjs from 'dayjs'

const props = defineProps<{ date: Post['date'] }>()

function getDateTime() {
  return new Date(props.date.time).toISOString()
}
</script>

<template>
  <dl>
    <dt class="sr-only">公開日:</dt>
    <dd class="text-base leading-6 font-medium text-gray-500 dark:text-gray-300">
      <time :datetime="getDateTime()">{{ Dayjs(date.time).format('YYYY-MM-DD HH:mm') }}</time>
    </dd>
  </dl>
</template>
