<script setup lang="ts">
import { data as categories } from './categories.data.js'
</script>

<template>
  <div class="py-8 space-y-2">
    <h2 class="text-xs tracking-wide uppercase text-gray-500 dark:text-white">
      すべてのカテゴリー
    </h2>
    <div class="flex flex-wrap gap-2">
      <a
        v-for="category in categories"
        class="link"
        :href="`/categories/${category.basename}.html`"
        >{{ category.name }}</a
      >
    </div>
  </div>
</template>
