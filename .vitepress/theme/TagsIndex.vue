<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from './posts.data.js'
import { slugifyTag } from '../../categories.js'

const tagsByCount = computed(() => {
  const map = new Map<string, number>()
  posts.forEach((p) => p.tags?.forEach((t) => map.set(t, (map.get(t) || 0) + 1)))
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
})

const maxCount = computed(() => tagsByCount.value[0]?.count ?? 1)

function tagSize(count: number): string {
  const ratio = count / maxCount.value
  const px = 13 + Math.round(ratio * 12)
  return `${px}px`
}
</script>

<template>
  <div class="nb-inner">
    <h1 class="idx-title">
      タグ一覧<span class="en">— Tags</span>
    </h1>
    <p class="idx-sub">
      よく使われているタグを大きく表示しています。
    </p>

    <div class="idx-stats">
      <div class="s r"><span class="v">{{ tagsByCount.length }}</span>個のタグ</div>
      <div class="s"><span class="v">{{ posts.length }}</span>本のメモ</div>
    </div>

    <div class="tag-cloud">
      <a
        v-for="t in tagsByCount"
        :key="t.tag"
        :href="`/tags/${slugifyTag(t.tag)}.html`"
        :style="{ fontSize: tagSize(t.count) }"
      >
        {{ t.tag }}<span class="cnt">({{ t.count }})</span>
      </a>
      <p
        v-if="tagsByCount.length === 0"
        style="color: var(--ink-mute); padding: 24px 0; font-family: var(--sans)"
      >
        まだタグはありません。
      </p>
    </div>

  </div>
</template>
