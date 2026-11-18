<script setup lang="ts">
// 本文中のリンクを目立たせるカード。MPA なので JS は使わず、SSR で描いた HTML と CSS だけで出す。
// 外部の OGP を取りに行かない（ビルドが外部に依存せず、閲覧者のブラウザも外部へ行かない）。
import { computed } from 'vue'

const props = defineProps<{
  href: string
  title: string
  description?: string
}>()

const host = computed(() => {
  try {
    return new URL(props.href).host
  } catch {
    return ''
  }
})

const isGitHub = computed(() => host.value === 'github.com')
</script>

<template>
  <a class="link-card not-prose" :href="href" target="_blank" rel="noopener">
    <span class="link-card-icon" aria-hidden="true">
      <svg v-if="isGitHub" viewBox="0 0 16 16" width="32" height="32">
        <path
          fill="currentColor"
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="28" height="28">
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        />
      </svg>
    </span>
    <span class="link-card-body">
      <span class="link-card-title">{{ title }}</span>
      <span v-if="description" class="link-card-description">{{ description }}</span>
      <span v-if="host" class="link-card-host">{{ host }}</span>
    </span>
  </a>
</template>

<style scoped>
.link-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1rem 1.25rem;
  border: 1px solid #d0d7de;
  border-radius: 0.75rem;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.link-card:hover {
  border-color: #8c959f;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.08);
}

.link-card-icon {
  flex: none;
  display: flex;
  color: #24292f;
}

.link-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.link-card-title {
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.link-card-description {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #57606a;
}

.link-card-host {
  font-size: 0.8rem;
  color: #8c959f;
}
</style>
