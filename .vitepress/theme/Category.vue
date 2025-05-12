<script setup lang="ts">
import { Category } from '../../categories.js'
import { data as allPosts } from './posts.data.js'
import ArticleList from './ArticleList.vue'
import MainCategoriesMenu from './MainCategoriesMenu.vue'
const props = defineProps<{
  category: Category
}>()

const posts = allPosts.filter((post) => {
  return post.categories?.includes(props.category.basename)
})
</script>

<template>
  <div class="divide-y divide-gray-200 dark:divide-slate-200/5">
    <div class="pt-6 pb-8 space-y-2 md:space-y-5">
      <h1
        class="text-2xl leading-9 font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-3xl sm:leading-10 md:text-5xl md:leading-14"
      >
        <small class="text-slate-500">カテゴリー</small> {{ category.name }}
      </h1>
      <MainCategoriesMenu />
    </div>
    <ArticleList :posts="posts" />
  </div>
</template>
