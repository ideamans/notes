<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { services } from '../../services.js'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const props = defineProps<{
  id: string
  lead?: string
}>()

const route = useRoute()

const service = computed(() => services.find((s) => s.id === props.id))

const leadText = computed(() => props.lead || service.value?.defaultLead || '')

const getSlug = (path: string): string => {
  const match = path.match(/\/([^/]+)\.html$/)
  return match ? match[1] : 'unknown'
}

const trackedUrl = computed(() => {
  if (!service.value) return '#'
  const url = new URL(service.value.url)
  url.searchParams.set('utm_source', 'notes.ideamans.com')
  url.searchParams.set('utm_medium', 'owned_media')
  url.searchParams.set('utm_campaign', 'banner')
  url.searchParams.set('utm_content', getSlug(route.path))
  return url.toString()
})

const iconUrl = computed(() => `https://alogorithm2.ideamans.com/v2/icon.svg?seed=${props.id}&width=128`)

const trackClick = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'service_ad_click', {
      service_id: props.id,
      service_name: service.value?.name,
      service_url: service.value?.url,
      source_page: route.path,
    })
  }
}
</script>

<template>
  <div v-if="service" class="not-prose my-6">
    <a
      :href="trackedUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="block border border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors group"
      @click="trackClick"
    >
      <div class="flex justify-between items-center mb-3">
        <span class="text-xs text-gray-500">PR</span>
        <span class="text-xs text-gray-500">アイデアマンズ株式会社</span>
      </div>
      <div class="flex items-start gap-4">
        <img :src="iconUrl" :alt="service.name" class="w-16 h-16 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <div class="text-lg font-bold dark:text-white group-hover:text-emerald-400 transition-colors">
            {{ service.name }}
          </div>
          <p class="text-base dark:text-gray-200 text-gray-700 mt-1 leading-relaxed">{{ leadText }}</p>
        </div>
      </div>
    </a>
  </div>
</template>
