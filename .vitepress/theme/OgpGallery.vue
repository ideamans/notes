<script setup lang="ts">
import { data as allPosts } from './posts.data.js'
import Date from './Date.vue'
import CategoryTags from './CategoryTags.vue'

const posts = allPosts.filter((post) => !!post.ogp)
</script>

<template>
  <div class="divide-y divide-gray-200 dark:divide-slate-200/5">
    <div class="pt-6 pb-8 space-y-2 md:space-y-5">
      <h1
        class="text-2xl leading-9 font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-3xl sm:leading-10 md:text-5xl md:leading-14"
      >
        OGP画像一覧
      </h1>
      <p class="text-lg leading-7 text-gray-500 dark:text-gray-300">
        記事に設定されたOGP画像の一覧（{{ posts.length }}件）
      </p>
    </div>
    <div class="py-12">
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <li v-for="post of posts" :key="post.url" class="group">
          <a :href="post.url" class="block">
            <div class="overflow-hidden rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
              <img
                :src="post.ogp"
                :alt="post.title"
                class="w-full aspect-[1200/630] object-cover"
                loading="lazy"
              />
            </div>
            <div class="mt-3 space-y-1">
              <h2
                class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                {{ post.title }}
              </h2>
              <div class="flex items-center gap-3">
                <Date :date="post.date" />
                <CategoryTags :categories="post.categories || []" />
              </div>
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
