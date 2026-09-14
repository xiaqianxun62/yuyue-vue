<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { generateAvatarUsers, type AvatarUser } from '../data/mock'
import { AVATAR_COLORS, randomInt } from '../utils/random'

const onlineCount = ref(24)
const avatars = ref<AvatarUser[]>(generateAvatarUsers(24))
const noticeText = ref('欢迎来到头像墙，实时演示中...')
const noticeType = ref<'enter' | 'leave'>('enter')

let countTimer: number | null = null
let avatarTimer: number | null = null

function startCountFluctuation() {
  countTimer = window.setInterval(() => {
    const delta = randomInt(-1, 1)
    const next = onlineCount.value + delta
    if (next >= 18 && next <= 32) onlineCount.value = next
  }, 2500)
}

function startAvatarAnimation() {
  const tick = () => {
    const isEnter = Math.random() > 0.45
    if (isEnter && avatars.value.length < 32) {
      const newUser = generateAvatarUsers(1)[0]
      avatars.value.push(newUser)
      showNotice(newUser, 'enter')
    } else if (!isEnter && avatars.value.length > 18) {
      const idx = randomInt(0, avatars.value.length - 1)
      const removed = avatars.value[idx]
      avatars.value.splice(idx, 1)
      showNotice(removed, 'leave')
    }
    avatarTimer = window.setTimeout(tick, randomInt(2000, 4000))
  }
  avatarTimer = window.setTimeout(tick, randomInt(2000, 4000))
}

function showNotice(user: AvatarUser, type: 'enter' | 'leave') {
  noticeText.value = `${user.nickname} · ${user.dept} ${type === 'enter' ? '进场了' : '离场了'}`
  noticeType.value = type
}

function avatarBg(colorIndex: number) {
  return AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]
}

function avatarInitial(nickname: string) {
  return nickname.charAt(0)
}

onMounted(() => {
  startCountFluctuation()
  startAvatarAnimation()
})

onBeforeUnmount(() => {
  if (countTimer) clearInterval(countTimer)
  if (avatarTimer) clearTimeout(avatarTimer)
})
</script>

<template>
  <section id="avatar-wall" class="section section-alt">
    <div class="container">
      <div class="wall-header">
        <div class="wall-title-row">
          <h2 class="wall-title">在线头像墙</h2>
          <span class="demo-badge">演示数据 · 前端模拟</span>
        </div>
        <div class="live-dot">
          <span>当前在线 <strong>{{ onlineCount }}</strong> 人</span>
        </div>
      </div>
      <div class="notice-bar" aria-live="polite">
        <div class="notice-item" :class="`notice-${noticeType}`">
          <span class="notice-dot"></span>
          <span>{{ noticeText }}</span>
        </div>
      </div>
      <div class="avatar-grid">
        <div
          v-for="user in avatars"
          :key="user.id"
          class="avatar-item"
          :title="user.nickname + ' · ' + user.dept"
        >
          <div class="avatar-inner" :style="{ background: avatarBg(user.colorIndex) }">
            {{ avatarInitial(user.nickname) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
