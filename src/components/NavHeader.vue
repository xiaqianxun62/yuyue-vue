<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SvgIcon from './SvgIcon.vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits<{
  ctaClick: []
}>()

const { isLoggedIn, user } = useAuth()

const NAV_ITEMS = [
  { id: 'hero', label: '首页' },
  { id: 'arrange', label: '自动编排' },
  { id: 'signup', label: '匿名报名' },
  { id: 'ranking', label: '积分榜' },
  { id: 'avatar-wall', label: '在线头像墙' },
  { id: 'chatroom', label: '临时聊天室' },
] as const

const activeId = ref<string>('hero')

function updateActive() {
  const scrollY = window.scrollY + 100
  let active = 'hero'
  for (const item of NAV_ITEMS) {
    const el = document.getElementById(item.id)
    if (el && el.offsetTop <= scrollY) active = item.id
  }
  activeId.value = active
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleCta(e: MouseEvent) {
  e.preventDefault()
  emit('ctaClick')
}

onMounted(() => {
  window.addEventListener('scroll', updateActive, { passive: true })
  updateActive()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateActive)
})
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <a href="#hero" class="logo" @click.prevent="scrollTo('hero')">
        <SvgIcon type="logo" :size="24" class="logo-icon" />
        <span>数羽 SHUYU</span>
      </a>
      <nav class="nav" aria-label="主导航">
        <a
          v-for="item in NAV_ITEMS"
          :key="item.id"
          :href="'#' + item.id"
          class="nav-link"
          :class="{ active: activeId === item.id }"
          @click.prevent="scrollTo(item.id)"
        >
          {{ item.label }}
        </a>
      </nav>
      <a v-if="!isLoggedIn" href="#hero" class="cta-btn" @click="handleCta">
        <span>加入球局</span>
      </a>
      <button v-else class="user-chip" type="button" @click="handleCta">
        <span class="user-chip-avatar">{{ (user?.name ?? '球').charAt(0) }}</span>
        <span class="user-chip-name">{{ user?.name }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 140px;
  height: 36px;
  padding: 0 12px 0 6px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--card);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.user-chip:hover {
  border-color: var(--primary-light);
  background: var(--success-bg);
  color: var(--primary);
}
.user-chip-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--bg);
  font-size: 12px;
  font-weight: 700;
}
.user-chip-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 375px) {
  .user-chip {
    max-width: 108px;
    height: 32px;
    padding: 0 10px 0 4px;
    font-size: 13px;
  }
  .user-chip-avatar {
    width: 21px;
    height: 21px;
    font-size: 11px;
  }
}
</style>
