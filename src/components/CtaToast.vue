<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const CTA_LINK = 'https://yuyue.example.com/mini'

const copyText = ref('复制链接')
const retryText = ref('重试跳转')

function handleClose() {
  emit('close')
}

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.top = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
  } catch (e) {
    /* ignore */
  }
  document.body.removeChild(ta)
}

function handleCopy() {
  let ok = false
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(CTA_LINK).then(() => {
      ok = true
    }).catch(() => {
      /* ignore */
    })
  }
  setTimeout(() => {
    if (!ok) fallbackCopy(CTA_LINK)
    copyText.value = '已复制 ✓'
    setTimeout(() => {
      copyText.value = '复制链接'
    }, 1500)
  }, 50)
}

function handleRetry() {
  retryText.value = '跳转中...'
  setTimeout(() => {
    retryText.value = '重试跳转'
  }, 800)
}
</script>

<template>
  <Transition name="toast-fade">
    <div
      v-if="visible"
      class="cta-toast show"
      role="dialog"
      aria-live="polite"
      aria-label="小程序跳转失败提示"
    >
      <button class="cta-toast-close" type="button" aria-label="关闭" @click="handleClose">
        &times;
      </button>
      <div class="cta-toast-title">小程序跳转失败</div>
      <div class="cta-toast-desc">
        请复制下方链接，在微信中打开小程序完成认证与约球。
      </div>
      <div class="cta-toast-link">
        <code>{{ CTA_LINK }}</code>
      </div>
      <div class="cta-toast-actions">
        <button class="cta-toast-btn" type="button" @click="handleCopy">
          {{ copyText }}
        </button>
        <button class="cta-toast-btn primary" type="button" @click="handleRetry">
          {{ retryText }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
