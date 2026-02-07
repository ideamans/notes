<script setup lang="ts">
import { computed } from 'vue'
import { loadDefaultJapaneseParser } from 'budoux'

const props = defineProps<{
  text?: string
}>()

const parser = loadDefaultJapaneseParser()

const segments = computed(() => {
  if (!props.text) return []
  return parser.parse(props.text)
})
</script>

<template>
  <span class="budoux-wrapper">
    <span v-for="(segment, index) in segments" :key="index" class="budoux-segment">{{
      segment
    }}</span>
  </span>
</template>

<style>
.budoux-segment {
  white-space: nowrap;
}
</style>
