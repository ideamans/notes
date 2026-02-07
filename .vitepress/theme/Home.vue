<script setup lang="ts">
import Date from './Date.vue'
import BudouX from './BudouX.vue'
import { data as posts } from './posts.data.js'
import { useData } from 'vitepress'
import CategoryTags from './CategoryTags.vue'
import MainCategoriesMenu from './MainCategoriesMenu.vue'
import AllCategoriesWidget from './AllCategoriesWidget.vue'
import Ranklet4Widget from './Ranklet4Widget.vue'

const { frontmatter } = useData()
</script>

<template>
  <div class="divide-y divide-gray-200 dark:divide-slate-200/5">
    <div class="pt-6 pb-8 space-y-2 md:space-y-5">
      <h1
        class="text-3xl leading-9 font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl sm:leading-10 md:text-6xl md:leading-14"
      >
        {{ frontmatter.title }}
      </h1>
      <p class="text-lg leading-7 text-gray-500 dark:text-white">
        {{ frontmatter.subtext }}
      </p>
      <MainCategoriesMenu />
    </div>
    <div
      class="divide-y xl:divide-y-0 divide-gray-200 dark:divide-slate-200/5 xl:grid xl:grid-cols-4 xl:gap-x-10 pb-16 xl:pb-20"
      style="grid-template-rows: auto 1fr"
    >
      <div
        class="divide-y divide-gray-200 dark:divide-slate-200/5 xl:pb-0 xl:col-span-3 xl:col-start-1 xl:row-span-2"
      >
        <div class="py-12">
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <li v-for="post of posts.slice(0, 100)" :key="post.url" class="group">
              <a :href="post.url" class="block">
                <div class="overflow-hidden rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                  <img
                    v-if="post.ogp"
                    :src="post.ogp"
                    :alt="post.title"
                    class="w-full aspect-[1200/630] object-cover"
                    loading="lazy"
                  />
                  <div
                    v-else
                    class="w-full aspect-[1200/630] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center p-6"
                  >
                    <span class="text-xl font-bold text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                      <BudouX :text="post.title" />
                    </span>
                  </div>
                </div>
                <div class="mt-3 space-y-1">
                  <h2
                    class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  >
                    <BudouX :text="post.title" />
                  </h2>
                  <div class="flex items-center gap-3 flex-wrap">
                    <Date :date="post.date" />
                    <CategoryTags :categories="post.categories || []" />
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <footer
        class="text-sm font-medium leading-5 divide-y divide-gray-200 dark:divide-slate-200/5 xl:col-start-4 xl:row-start-2"
      >
        <AllCategoriesWidget />
        <Ranklet4Widget />
      </footer>
    </div>
  </div>
</template>
