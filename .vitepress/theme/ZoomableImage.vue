<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
  caption?: string
}>()
</script>

<template>
  <figure class="zoomable-image">
    <img :src="src" :alt="alt || ''" loading="lazy" data-zoomable class="cursor-pointer hover:opacity-80 transition-opacity" />
    <figcaption v-if="caption" class="text-center text-sm text-gray-500 mt-2">{{ caption }}</figcaption>
  </figure>
</template>
