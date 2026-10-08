<template>
  <div class="tianditu-wrap" :style="{ height: height }">
    <div ref="mapEl" class="tianditu-canvas"></div>
    <div v-if="loading" class="tdt-loading">地图加载中…</div>
    <div v-if="error" class="tdt-error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  /** 纬度（WGS84） */
  lat: number | null | undefined
  /** 经度（WGS84） */
  lng: number | null | undefined
  /** 标记点标题 */
  title?: string
  /** 容器高度 */
  height?: string
  /** 缩放级别，默认 15（街区级） */
  zoom?: number
}>(), {
  title: '',
  height: '240px',
  zoom: 15,
})

const mapEl = ref<HTMLDivElement>()
const loading = ref(false)
const error = ref<string | null>(null)

let map: any = null
let marker: any = null

/**
 * 懒加载天地图 JS SDK（全局只加载一次，多个组件实例共享）
 */
type TDTGlobal = typeof window & { T: any }

function loadTiandituSDK(): Promise<any> {
  const g = window as TDTGlobal
  if (g.T) return Promise.resolve(g.T)
  if ((g as any).__tdtLoading) return (g as any).__tdtLoading

  const key = import.meta.env.VITE_TIANDITU_KEY || 'YOUR_TIANDITU_KEY_PLACEHOLDER'
  const promise = new Promise<any>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${key}`
    s.async = true
    s.onload = () => resolve((window as TDTGlobal).T)
    s.onerror = () => reject(new Error('天地图 SDK 加载失败'))
    document.head.appendChild(s)
  })
  ;(g as any).__tdtLoading = promise
  return promise
}

function render(T: any) {
  if (!mapEl.value || !props.lat || !props.lng) return

  if (!map) {
    map = new T.Map(mapEl.value)
    map.centerAndZoom(new T.LngLat(props.lng, props.lat), props.zoom)

    marker = new T.Marker(new T.LngLat(props.lng, props.lat))
    map.addOverLay(marker)

    if (props.title) {
      const infoWin = new T.InfoWindow(props.title, { offset: new T.Point(0, -30) })
      map.openInfoWindow(infoWin, new T.LngLat(props.lng, props.lat))
    }
  } else {
    map.centerAndZoom(new T.LngLat(props.lng, props.lat), props.zoom)
    if (marker) marker.setLngLat(new T.LngLat(props.lng, props.lat))
  }
}

async function init() {
  if (!props.lat || !props.lng) {
    error.value = '该球场暂无经纬度'
    return
  }
  try {
    loading.value = true
    error.value = null
    const T = await loadTiandituSDK()
    // 等待容器 DOM 布局完成
    requestAnimationFrame(() => render(T))
  } catch (e: any) {
    error.value = e?.message || '地图初始化失败'
  } finally {
    loading.value = false
  }
}

onMounted(init)

// 坐标变化时重新定位
watch(
  () => [props.lat, props.lng, props.title],
  () => {
    if (map && (props.lat && props.lng)) {
      const T = (window as TDTGlobal).T
      render(T)
    } else {
      // 初次或坐标缺失
      map = null
      marker = null
      init()
    }
  },
)

onBeforeUnmount(() => {
  if (map) {
    map.clearOverLays()
    map = null
  }
})
</script>

<style scoped>
.tianditu-wrap {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #eee;
}
.tianditu-canvas {
  width: 100%;
  height: 100%;
}
.tdt-loading,
.tdt-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #888;
  background: rgba(255, 255, 255, 0.7);
}
.tdt-error {
  color: #c00;
}
</style>
