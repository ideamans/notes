<script setup lang="ts">
import { data as categories } from './categories.data.js'

const props = defineProps<{
  categories: string[]
}>()

const byBasename = new Map(categories.map((c) => [c.basename, c]))
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <a
      v-for="category of props.categories"
      :key="category"
      class="badge badge-outline hover:link"
      :href="`/categories/${category}.html`"
      >{{ byBasename.get(category)?.name ?? category }}</a
    >
  </div>
</template>
