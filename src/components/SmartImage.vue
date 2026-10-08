<script setup lang="ts">
/**
 * SmartImage：缩略图 + 静默预加载高清图
 *
 * 渲染策略：
 *   1. 立即显示缩略图（从 src 按命名约定算出 _thumb.jpg 路径）
 *   2. 后台 new Image() 预加载高清原图
 *   3. 高清图加载完成 → 无感替换 src（带 fade 过渡）
 *   4. 缩略图 404（历史图片还没生成缩略图）→ 降级显示原图
 *
 * 后端约定：/uploads/avatar_xxx.jpeg → /uploads/avatar_xxx_thumb.jpg
 * 跨域/第三方 URL（http 开头的）不走缩略图逻辑，直接显示原图。
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { resolveUrl, thumbUrl } from '../api/http'

const props = defineProps<{
  /** 原图 URL（后端返回的相对路径 /uploads/xxx，或完整 http(s) URL） */
  src: string | null | undefined
  /** alt 文本 */
  alt?: string
  /** 原生 img width/height，可选 */
  width?: string | number
  height?: string | number
}>()

const displaySrc = ref('')
const fading = ref(false)
let hdLoader: HTMLImageElement | null = null

// 后端路径补全（/uploads/xxx → /api/uploads/xxx）
const fullSrc = computed(() => resolveUrl(props.src))
// 缩略图完整 URL
const fullThumb = computed(() => {
  if (!props.src || /^https?:\/\//.test(props.src)) return fullSrc.value
  return resolveUrl(thumbUrl(props.src))
})

/** 停止正在进行的高清图预加载（组件卸载或 src 变化时） */
function cancelHdPreload() {
  if (hdLoader) {
    hdLoader.onload = null
    hdLoader.onerror = null
    hdLoader.src = ''
    hdLoader = null
  }
}

/** 静默预加载高清图，完成后平滑替换 displaySrc */
function preloadHd() {
  cancelHdPreload()
  if (!fullSrc.value) return
  hdLoader = new Image()
  hdLoader.onload = () => {
    // 只有还在盯着同一个 src 才替换
    if (hdLoader && hdLoader.src === fullSrc.value) {
      fading.value = true
      displaySrc.value = fullSrc.value
      // 让浏览器渲染一次过渡
      requestAnimationFrame(() => {
        setTimeout(() => { fading.value = false }, 250)
      })
    }
  }
  hdLoader.onerror = () => {
    // 高清图也加载不上？不管，已经有缩略图兜底了
  }
  hdLoader.src = fullSrc.value
}

/** 图片加载失败 → 如果是缩略图，降级到原图 */
function onError() {
  if (displaySrc.value === fullThumb.value && fullThumb.value !== fullSrc.value) {
    // 缩略图不存在（老历史图片），直接用原图
    displaySrc.value = fullSrc.value
  } else if (displaySrc.value !== fullSrc.value) {
    // 原图也挂了，也有这个情况，兜底：保留原图尝试，不做更多处理
    displaySrc.value = fullSrc.value
  }
}

/** src 变化：重置显示缩略图 → 预加载高清 */
watch(
  () => props.src,
  () => {
    displaySrc.value = fullThumb.value
    preloadHd()
  },
  { immediate: true },
)

onBeforeUnmount(cancelHdPreload)
</script>

<template>
  <img
    class="smart-img"
    :class="{ fading }"
    :src="displaySrc"
    :alt="alt || ''"
    :width="width"
    :height="height"
    @error="onError"
  />
</template>

<style scoped>
.smart-img {
  /* 基础：透明淡入，给缩略图切高清图做过渡 */
  transition: opacity 0.25s ease;
  opacity: 1;
  display: block;
}
.smart-img.fading {
  opacity: 0.85;
}
</style>
