<script setup lang="ts">
import { onMounted, ref } from 'vue'
import NavHeader from './components/NavHeader.vue'
import HeroSection from './components/HeroSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import HowToSection from './components/HowToSection.vue'
import PlatformsSection from './components/PlatformsSection.vue'
import SignupSection from './components/SignupSection.vue'
import ArrangeSection from './components/ArrangeSection.vue'
import RankingSection from './components/RankingSection.vue'
import AvatarWallSection from './components/AvatarWallSection.vue'
import ChatRoomSection from './components/ChatRoomSection.vue'
import CtaToast from './components/CtaToast.vue'
import AuthModal from './components/AuthModal.vue'
import FooterSection from './components/FooterSection.vue'
import { useAuth } from './composables/useAuth'

const showCtaToast = ref(false)
const showAuthModal = ref(false)

const { restore } = useAuth()

/** 导航栏 CTA：打开登录/注册弹窗（已登录时展示个人信息面板） */
function handleCtaClick() {
  showAuthModal.value = true
}

function closeAuthModal() {
  showAuthModal.value = false
}

function closeCtaToast() {
  showCtaToast.value = false
}

/** 登录后引导前往微信小程序继续约球 */
function handleOpenMini() {
  showAuthModal.value = false
  showCtaToast.value = true
}

// 带着本地 token 刷新页面时，先向后端确认身份是否仍然有效
onMounted(() => {
  restore()
})
</script>

<template>
  <div class="app">
    <NavHeader @cta-click="handleCtaClick" />
    <main>
      <HeroSection />
      <FeaturesSection />
      <HowToSection />
      <PlatformsSection />
      <SignupSection />
      <ArrangeSection />
      <RankingSection />
      <AvatarWallSection />
      <ChatRoomSection />
    </main>
    <FooterSection />
    <CtaToast :visible="showCtaToast" @close="closeCtaToast" />
    <AuthModal :visible="showAuthModal" @close="closeAuthModal" @open-mini="handleOpenMini" />
  </div>
</template>
