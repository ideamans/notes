<script setup lang="ts">
import { computed } from 'vue'
import { useData } from './profiles'
import { data as authors } from './authors.data.js'
import type { Author } from '../../authors.js'

const { frontmatter } = useData()

const author = authors.find((a) => a.username === frontmatter.value.author)
</script>

<template>
  <dl>
    <dt class="sr-only">Authors</dt>
    <dd>
      <ul
        class="flex items-start md:items-center justify-center xl:block space-x-8 sm:space-x-12 xl:space-x-0 xl:space-y-8 gap-8"
      >
        <li class="flex items-center space-x-2">
          <img
            v-if="author?.image"
            :src="`https://notes.ideamans.com${author.image}`"
            alt="author image"
            class="w-10 h-10 rounded-full"
          />
          <dl class="text-sm font-medium leading-5 whitespace-nowrap">
            <dt class="sr-only">Name</dt>
            <dd class="text-gray-900 dark:text-white">{{ author?.name }}</dd>
          </dl>
        </li>
        <!-- <li class="flex flex-col gap-4">
          <p>{{ author?.bio }}</p>
        </li> -->
      </ul>
    </dd>
  </dl>
</template>
