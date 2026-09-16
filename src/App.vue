<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import NavHeader from './components/NavHeader.vue'
import HeroSection from './components/HeroSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import HowToSection from './components/HowToSection.vue'
import PlatformsSection from './components/PlatformsSection.vue'
import SignupSection from './components/SignupSection.vue'
import ArrangeSection from './components/ArrangeSection.vue'
import RankingSection from './components/RankingSection.vue'
import EloLabSection from './components/EloLabSection.vue'
import AvatarWallSection from './components/AvatarWallSection.vue'
import ChatRoomSection from './components/ChatRoomSection.vue'
import CtaToast from './components/CtaToast.vue'
import FooterSection from './components/FooterSection.vue'
import AuthPage from './views/AuthPage.vue'
import ProfilePage from './views/ProfilePage.vue'
import { useAuth } from './composables/useAuth'

/**
 * 极简 hash 路由：官网用 #hero 等锚点做滚动，登录页用 #/login、#/register 区分。
 * 不引入 vue-router，保持零依赖。
 */
type Route = 'home' | 'login' | 'register' | 'profile'

const showCtaToast = ref(false)
const route = ref<Route>(currentRoute())

const { restore } = useAuth()

const authTab = computed<'login' | 'register'>(() =>
  route.value === 'register' ? 'register' : 'login',
)

function currentRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash === 'login' || hash === 'register' || hash === 'profile' ? hash : 'home'
}

function syncRoute(): void {
  route.value = currentRoute()
}

/** 导航栏「加入球局」/ 用户头像：进入独立登录页 */
function handleCtaClick(): void {
  window.location.hash = '#/login'
}

/** 用户菜单「编辑个人信息」 */
function handleProfileClick(): void {
  window.location.hash = '#/profile'
}

/** 从登录页返回官网（回到首页锚点，hash 变化会自动切回官网视图） */
function handleBack(): void {
  if (window.location.hash.startsWith('#/')) {
    window.location.hash = '#hero'
  } else {
    route.value = 'home'
  }
}

function closeCtaToast(): void {
  showCtaToast.value = false
}

/** 登录后引导前往微信小程序继续约球 */
function handleOpenMini(): void {
  handleBack()
  showCtaToast.value = true
}

// 带着本地 token 刷新页面时，先向后端确认身份是否仍然有效
onMounted(() => {
  restore()
  window.addEventListener('hashchange', syncRoute)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncRoute)
})
</script>

<template>
  <div class="app">
    <ProfilePage v-if="route === 'profile'" @back="handleBack" />
    <AuthPage
      v-else-if="route !== 'home'"
      :tab="authTab"
      @back="handleBack"
      @open-mini="handleOpenMini"
    />
    <template v-else>
      <NavHeader @cta-click="handleCtaClick" @profile-click="handleProfileClick" />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowToSection />
        <PlatformsSection />
        <SignupSection />
        <ArrangeSection />
        <RankingSection />
        <EloLabSection />
        <AvatarWallSection />
        <ChatRoomSection />
      </main>
      <FooterSection />
    </template>
    <CtaToast :visible="showCtaToast" @close="closeCtaToast" />
  </div>
</template>
