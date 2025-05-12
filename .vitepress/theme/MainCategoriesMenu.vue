<script setup lang="ts">
import { data as categories } from './categories.data.js'

const categoriesByBasename = new Map(categories.map((c) => [c.basename, c]))
const mainCategories = [
  'pagespeed-insights',
  'lightfile',
  'cloud-cost',
  'webp',
  'ranklet'
]
  .map((basename) => categoriesByBasename.get(basename))
  .filter(Boolean)
</script>

<template>
  <ul
    class="menu bg-base-200 menu-horizontal rounded-box menu-sm md:menu-md"
    v-if="mainCategories.length > 0"
  >
    <li v-for="category of mainCategories">
      <a :href="`/${category.basename}/index.html`">{{ category.name }}</a>
    </li>
  </ul>
</template>
