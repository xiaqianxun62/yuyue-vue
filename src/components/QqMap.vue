<template>
  <div class="qq-map-wrap" :style="{ height: height }">
    <div ref="mapEl" class="qq-map-canvas"></div>
    <div v-if="loading" class="qqm-loading">地图加载中…</div>
    <div v-if="error" class="qqm-error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { wgs84ToGcj02 } from '../utils/coord'

const props = withDefaults(defineProps<{
  lat: number | null | undefined
  lng: number | null | undefined
  title?: string
  subtitle?: string
  height?: string
  zoom?: number
  showScale?: boolean
  showZoom?: boolean
}>(), {
  title: '',
  subtitle: '',
  height: '240px',
  zoom: 15,
  showScale: true,
  showZoom: true,
})

const mapEl = ref<HTMLDivElement>()
const loading = ref(false)
const error = ref<string | null>(null)

let map: any = null
let marker: any = null
let infoWin: any = null

type QMapGlobal = typeof window & { qq: any; __qqMapLoading?: Promise<any> }

/**
 * 懒加载腾讯地图 JS SDK v2.exp 经典版（全局只加载一次）
 * 用 JSONP callback 等待就绪，避免 onload 时序问题
 */
function loadQQMapSDK(): Promise<any> {
  const g = window as QMapGlobal
  if (g.qq && g.qq.maps) return Promise.resolve(g.qq.maps)
  if (g.__qqMapLoading) return g.__qqMapLoading
  const key = import.meta.env.VITE_TENCENT_MAP_KEY || ''
  if (!key) return Promise.reject(new Error('未配置 VITE_TENCENT_MAP_KEY'))
  const cbName = `__qqMapCb_${Date.now()}`
  const p = new Promise<any>((resolve, reject) => {
    ;(window as any)[cbName] = () => {
      delete (window as any)[cbName]
      const q = (window as QMapGlobal).qq
      if (q && q.maps) resolve(q.maps)
      else reject(new Error('腾讯地图 SDK 加载失败'))
    }
    const s = document.createElement('script')
    s.src = `https://map.qq.com/api/js?v=2.exp&key=${key}&callback=${cbName}`
    s.async = true
    s.onerror = () => {
      delete (window as any)[cbName]
      reject(new Error('腾讯地图 SDK 网络加载失败'))
    }
    document.head.appendChild(s)
  })
  g.__qqMapLoading = p
  return p
}

function render(maps: any) {
  if (!mapEl.value || !props.lat || !props.lng) return
  // court 表存 WGS84，腾讯地图需要 GCJ-02
  const [mgLng, mgLat] = wgs84ToGcj02(Number(props.lng), Number(props.lat))
  const center = new maps.LatLng(mgLat, mgLng)

  if (!map) {
    map = new maps.Map(mapEl.value, {
      center,
      zoom: props.zoom,
      draggable: true,
      scrollwheel: true,
      // 只保留普通街道矢量地图（有道路、绿地、水系），去掉卫星图选项
      mapTypeControlOptions: {
        mapTypeIds: [maps.MapTypeId.ROADMAP],
      },
    })
    if (props.showScale) {
      const ctrl = (window as QMapGlobal).qq.maps
      if (ctrl && ctrl.ScaleControl) map.controls![ctrl.ScaleControl.TOP_LEFT] = () => new ctrl.ScaleControl()
    }
    if (props.showZoom) {
      const ctrl = (window as QMapGlobal).qq.maps
      if (ctrl && ctrl.ZoomControl) map.controls![ctrl.ZoomControl.TOP_LEFT] = () => new ctrl.ZoomControl()
    }
  } else {
    map.setCenter(center)
    map.setZoom(props.zoom)
  }

  if (!marker) {
    marker = new maps.Marker({ position: center, map })
  } else {
    marker.setPosition(center)
  }

  if (props.title || props.subtitle) {
    const content = props.subtitle
      ? `<div style="padding:2px 4px"><div style="font-size:13px;font-weight:700;color:#1a2e2a;margin-bottom:3px">${props.title}</div><div style="font-size:11px;color:#6b7b78">${props.subtitle}</div></div>`
      : `<div style="padding:2px 4px;font-size:13px;font-weight:600;color:#1a2e2a">${props.title}</div>`
    if (!infoWin) infoWin = new maps.InfoWindow({ map })
    infoWin.setPosition(center)
    infoWin.setContent(content)
    infoWin.open()
    maps.event.addListener(marker, 'click', () => { infoWin!.open(); infoWin!.setPosition(center) })
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
    const maps = await loadQQMapSDK()
    requestAnimationFrame(() => render(maps))
  } catch (e: any) {
    error.value = e?.message || '地图初始化失败'
  } finally {
    loading.value = false
  }
}

onMounted(init)

watch(
  () => [props.lat, props.lng, props.title, props.subtitle],
  () => {
    const q = (window as QMapGlobal).qq
    if (map && q && q.maps && props.lat && props.lng) {
      render(q.maps)
    } else {
      map = null
      marker = null
      infoWin = null
      init()
    }
  },
)

onBeforeUnmount(() => { map = null; marker = null; infoWin = null })
</script>

<style scoped>
.qq-map-wrap { position: relative; width: 100%; border-radius: 8px; overflow: hidden; background: #eee; }
.qq-map-canvas { width: 100%; height: 100%; }
.qqm-loading, .qqm-error { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #888; background: rgba(255, 255, 255, 0.7); }
.qqm-error { color: #c00; }
</style>
