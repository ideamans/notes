<script setup lang="ts">
import type { Post } from './posts.data.js'
import Date from './Date.vue'
import CategoryTags from './CategoryTags.vue'
import AllCategoriesWidget from './AllCategoriesWidget.vue'
import Ranklet4Widget from './Ranklet4Widget.vue'

const props = defineProps<{
  posts: Post[]
}>()
</script>

<template>
  <div
    class="divide-y xl:divide-y-0 divide-gray-200 dark:divide-slate-200/5 xl:grid xl:grid-cols-4 xl:gap-x-10 pb-16 xl:pb-20"
    style="grid-template-rows: auto 1fr"
  >
    <div
      class="divide-y divide-gray-200 dark:divide-slate-200/5 xl:pb-0 xl:col-span-3 xl:col-start-1 xl:row-span-2"
    >
      <ul class="divide-y divide-gray-200 dark:divide-slate-200/5">
        <li
          class="py-12"
          v-for="{ title, url, date, excerpt, categories } of posts"
        >
          <article
            class="space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline"
          >
            <div class="space-y-5 xl:col-span-4">
              <div class="space-y-6">
                <div class="flex flex-col gap-2">
                  <Date :date="date" />
                  <h2 class="text-2xl leading-8 font-bold tracking-tight">
                    <a class="text-gray-900 dark:text-white" :href="url">{{
                      title
                    }}</a>
                  </h2>
                  <CategoryTags :categories="categories || []" />
                </div>
                <div
                  v-if="excerpt"
                  class="prose dark:prose-invert max-w-none text-gray-500 dark:text-gray-300"
                  v-html="excerpt"
                ></div>
              </div>
              <div class="text-base leading-6 font-medium">
                <a class="link" aria-label="read more" :href="url"
                  >続きを読む →</a
                >
              </div>
            </div>
          </article>
        </li>
      </ul>
    </div>

    <footer
      class="text-sm font-medium leading-5 divide-y divide-gray-200 dark:divide-slate-200/5 xl:col-start-4 xl:row-start-2"
    >
      <AllCategoriesWidget />
      <Ranklet4Widget />
    </footer>
  </div>
</template>
