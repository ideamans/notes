<script setup lang="ts">
// 本文中から連載の別記事を指すときに使う。まだ公開していなければリンクにしない。
import { computed } from 'vue'
import { isPublished } from './seriesState.js'

const props = defineProps<{ url: string }>()

const linked = computed(() => isPublished(props.url))
</script>

<template>
  <a v-if="linked" :href="url"><slot /></a>
  <span v-else class="series-ref-pending"><slot /></span>
</template>

<style scoped>
.series-ref-pending {
  color: var(--vp-c-text-2, #64748b);
}
</style>
