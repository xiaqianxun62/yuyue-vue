<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SvgIcon from './SvgIcon.vue'
import { SIGNUP_STEPS } from '../data/mock'
import { listGames, registerGame, type Game } from '../api/game'
import { ApiError } from '../api/http'
import { useAuth } from '../composables/useAuth'

/** 球局状态（后端 Constants）：0 报名中 1 已编排 */
const STATUS_TEXT: Record<number, string> = { 0: '报名中', 1: '已编排' }

const { isLoggedIn } = useAuth()

const games = ref<Game[]>([])
const state = ref<'loading' | 'data' | 'empty' | 'error'>('loading')
/** 失败原因：直接展示后端/网络层的原文，便于区分「后端没起」「跨域被拦」「接口报错」 */
const errMsg = ref('')
const pendingId = ref<number | null>(null)
const tip = ref<{ text: string; ok: boolean } | null>(null)

async function load(): Promise<void> {
  state.value = 'loading'
  errMsg.value = ''
  try {
    games.value = await listGames()
    state.value = games.value.length ? 'data' : 'empty'
  } catch (e) {
    games.value = []
    errMsg.value = e instanceof ApiError ? e.message : '球局加载失败，请稍后重试'
    state.value = 'error'
  }
}

async function handleRegister(game: Game): Promise<void> {
  if (!isLoggedIn.value) {
    window.location.hash = '#/login'
    return
  }
  pendingId.value = game.id
  tip.value = null
  try {
    const updated = await registerGame(game.id)
    const idx = games.value.findIndex((g) => g.id === updated.id)
    if (idx >= 0) games.value[idx] = updated
    tip.value = { text: '报名成功，已同步微信群接龙', ok: true }
  } catch (e) {
    tip.value = {
      text: e instanceof ApiError ? e.message : '报名失败，请稍后重试',
      ok: false,
    }
  } finally {
    pendingId.value = null
  }
}

function isFull(game: Game): boolean {
  return game.registeredCount >= game.maxPlayers
}

function statusText(game: Game): string {
  if (game.status !== 0) return STATUS_TEXT[game.status] ?? '已编排'
  return isFull(game) ? '已满员' : '报名中'
}

function timeText(game: Game): string {
  const start = game.startTime ? game.startTime.slice(0, 5) : ''
  const end = game.endTime ? game.endTime.slice(0, 5) : ''
  const span = start && end ? `${start}-${end}` : start || end
  return span ? `${game.playDate} ${span}` : game.playDate
}

function btnText(game: Game): string {
  if (pendingId.value === game.id) return '报名中...'
  if (game.status !== 0) return STATUS_TEXT[game.status] ?? '已编排'
  if (isFull(game)) return '已满员'
  return isLoggedIn.value ? '报名' : '登录并报名'
}

onMounted(load)
</script>

<template>
  <section id="signup" class="section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">匿名报名</h2>
        <p class="section-desc">不在群里也能加入球局，机器人自动同步报名信息</p>
      </div>
      <div class="steps">
        <div v-for="item in SIGNUP_STEPS" :key="item.step" class="step">
          <div class="step-icon-wrap">
            <SvgIcon :type="item.iconType" :size="24" />
            <span class="step-num">{{ item.step }}</span>
          </div>
          <h3 class="step-title">{{ item.title }}</h3>
          <p class="step-desc">{{ item.desc }}</p>
        </div>
      </div>
      <div class="signup-flow" aria-label="匿名报名信息流向">
        <span class="flow-node">PC 官网报名</span>
        <span class="flow-arrow" aria-hidden="true"></span>
        <span class="flow-node flow-node-bot">机器人 clawbot</span>
        <span class="flow-arrow" aria-hidden="true"></span>
        <span class="flow-node">微信群接龙</span>
      </div>
      <p class="signup-note">
        群外球友无需入群、无需单独联络，官网提交报名后由机器人自动同步进群接龙，隐私更省心
      </p>

      <!-- 真实球局列表：来自后端 /games -->
      <div class="games-block">
        <div class="games-head">
          <h3 class="games-title">近期球局</h3>
          <button class="rank-toggle" type="button" @click="load">刷新</button>
        </div>

        <div v-if="state === 'loading'" class="wall-state">正在加载球局...</div>

        <div v-else-if="state === 'error'" class="wall-state" role="alert">
          {{ errMsg }}
          <button class="ranking-retry-btn" type="button" @click="load">重新加载</button>
        </div>

        <div v-else-if="state === 'empty'" class="wall-state" role="status">
          还没有球局，登录后即可发布第一个球局
        </div>

        <template v-else>
          <ul class="game-list">
            <li v-for="game in games" :key="game.id" class="game-card">
              <div class="game-main">
                <div class="game-title">{{ game.title }}</div>
                <div class="game-meta">
                  {{ timeText(game) }}
                  <span v-if="game.location"> · {{ game.location }}</span>
                  <span class="game-status" :class="{ done: game.status !== 0 }">
                    {{ statusText(game) }}
                  </span>
                </div>
              </div>
              <div class="game-side">
                <span class="game-count">{{ game.registeredCount }}/{{ game.maxPlayers }}</span>
                <button
                  class="game-btn"
                  type="button"
                  :disabled="game.status !== 0 || isFull(game) || pendingId === game.id"
                  @click="handleRegister(game)"
                >
                  {{ btnText(game) }}
                </button>
              </div>
            </li>
          </ul>
          <p v-if="tip" class="game-tip" :class="{ err: !tip.ok }" role="status">{{ tip.text }}</p>
        </template>
      </div>
    </div>
  </section>
</template>
