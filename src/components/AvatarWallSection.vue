<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { listGames, type Game } from '../api/game'
import { AVATAR_COLORS } from '../utils/random'

/** 头像墙：展示近期球局已报名的球友（真实数据，对外匿名） */
interface WallUser {
  userId: number
  name: string
  rating: number
  gameTitle: string
}

const users = ref<WallUser[]>([])
const gameCount = ref(0)
const state = ref<'loading' | 'data' | 'empty' | 'error'>('loading')
const latestText = ref('正在获取报名动态...')

let refreshTimer: number | null = null

function colorOf(userId: number): string {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length]
}

async function load(): Promise<void> {
  state.value = 'loading'
  try {
    const games: Game[] = await listGames()
    gameCount.value = games.length

    const byUser = new Map<number, WallUser>()
    const timeline: { name: string; title: string }[] = []
    for (const g of games) {
      for (const r of g.registrations ?? []) {
        byUser.set(r.userId, {
          userId: r.userId,
          name: r.anonymousName,
          rating: r.rating,
          gameTitle: g.title,
        })
        timeline.push({ name: r.anonymousName, title: g.title })
      }
    }
    users.value = [...byUser.values()]

    const latest = timeline.length ? timeline[timeline.length - 1] : null
    latestText.value = latest
      ? `${latest.name} 报名了《${latest.title}》`
      : '暂无报名动态，快去下方球局抢第一个位置'

    state.value = users.value.length === 0 ? 'empty' : 'data'
  } catch {
    users.value = []
    state.value = 'error'
  }
}

onMounted(() => {
  load()
  // 报名是异步的，定时刷新保持与实际报名一致
  refreshTimer = window.setInterval(load, 30000)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <section id="avatar-wall" class="section section-alt">
    <div class="container">
      <div class="wall-header">
        <div class="wall-title-row">
          <h2 class="wall-title">报名头像墙</h2>
          <span class="live-badge">实时数据 · 来自球局报名</span>
        </div>
        <div class="live-dot">
          <span>已报名 <strong>{{ users.length }}</strong> 人 · {{ gameCount }} 个球局</span>
        </div>
      </div>

      <div class="notice-bar" aria-live="polite">
        <div class="notice-item notice-enter">
          <span class="notice-dot"></span>
          <span>{{ latestText }}</span>
        </div>
      </div>

      <div v-if="state === 'loading'" class="wall-state">正在加载报名信息...</div>

      <div v-else-if="state === 'error'" class="wall-state" role="alert">
        报名信息加载失败，请确认后端已启动
        <button class="ranking-retry-btn" type="button" @click="load">重新加载</button>
      </div>

      <div v-else-if="state === 'empty'" class="wall-state" role="status">
        还没有人报名，去下方球局列表抢占第一个位置
      </div>

      <div v-else class="avatar-grid">
        <div
          v-for="u in users"
          :key="u.userId"
          class="avatar-item"
          :title="`${u.name} · ${u.rating} 分 · ${u.gameTitle}`"
        >
          <div class="avatar-inner" :style="{ background: colorOf(u.userId) }">
            {{ u.name.charAt(0) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
