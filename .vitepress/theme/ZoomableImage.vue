<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  src: string
  alt?: string
  caption?: string
}>()

const isOpen = ref(false)

function open() {
  isOpen.value = true
  document.body.style.overflow = 'hidden'
}

function close() {
  isOpen.value = false
  document.body.style.overflow = ''
}
</script>

<template>
  <figure class="zoomable-image">
    <img :src="src" :alt="alt || ''" loading="lazy" @click="open" class="cursor-pointer hover:opacity-80 transition-opacity" />
    <figcaption v-if="caption" class="text-center text-sm text-gray-500 mt-2">{{ caption }}</figcaption>
  </figure>

  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="close">
      <div class="absolute inset-0 bg-black/80" @click="close"></div>
      <div class="relative z-10 max-h-[90vh] max-w-[95vw] overflow-auto">
        <button @click="close" class="sticky top-2 left-[calc(100%-3rem)] z-20 w-10 h-10 rounded-full bg-black/60 text-white text-xl flex items-center justify-center hover:bg-black/80 transition-colors">&times;</button>
        <img :src="src" :alt="alt || ''" class="block" style="max-width: none;" />
      </div>
    </div>
  </Teleport>
</template>
