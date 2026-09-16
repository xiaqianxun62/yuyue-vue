<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type:
    | 'logo'
    | 'court'
    | 'engine'
    | 'trophy'
    | 'chat'
    | 'phone'
    | 'card'
    | 'racket'
    | 'podium'
    | 'warning'
    | 'refresh'
    | 'web'
    | 'app'
    | 'megaphone'
    | 'user-plus'
    | 'bot'
    | 'shuffle'
    | 'chart'
    | 'menu'
    | 'close'
    | 'chevron'
    | 'logout'
    | 'person'
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
})

const iconPaths: Record<Props['type'], string> = {
  // Logo - 羽毛球
  logo: `<path d="M12 2C9 2 7 4 7 7c0 2 1 3.5 2.5 4.5L12 13l2.5-1.5C16 10.5 17 9 17 7c0-3-2-5-5-5z"/>
         <path d="M12 13v9"/>
         <path d="M8 20h8"/>
         <path d="M9 17h6"/>`,
  // 球场线
  court: `<rect x="3" y="4" width="18" height="16" rx="1"/>
          <line x1="12" y1="4" x2="12" y2="20"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <circle cx="12" cy="12" r="2.5"/>`,
  // 齿轮引擎
  engine: `<circle cx="12" cy="12" r="3"/>
           <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>`,
  // 奖杯
  trophy: `<path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/>
           <path d="M6 6H4a2 2 0 0 0 0 4h2"/>
           <path d="M18 6h2a2 2 0 0 1 0 4h-2"/>
           <path d="M9 15h6v2H9z"/>
           <path d="M10 17v3h4v-3"/>`,
  // 聊天
  chat: `<path d="M4 5h16v10H8l-4 4V5z"/>
         <circle cx="8" cy="10" r="1" fill="currentColor"/>
         <circle cx="12" cy="10" r="1" fill="currentColor"/>
         <circle cx="16" cy="10" r="1" fill="currentColor"/>`,
  // 手机
  phone: `<rect x="6" y="2" width="12" height="20" rx="2"/>
          <line x1="10" y1="18" x2="14" y2="18"/>`,
  // 学生证
  card: `<rect x="3" y="5" width="18" height="14" rx="2"/>
         <circle cx="8" cy="11" r="2"/>
         <path d="M13 9h6M13 13h6"/>`,
  // 球拍
  racket: `<ellipse cx="14" cy="10" rx="6" ry="7"/>
           <line x1="8" y1="14" x2="3" y2="19"/>
           <line x1="14" y1="3" x2="14" y2="17"/>`,
  // 领奖台（空态）
  podium: `<path d="M4 40V18h14V10h12v8h14v30z"/>
           <path d="M4 12v6M40 12v6"/>
           <circle cx="11" cy="22" r="1.5" fill="currentColor" stroke="none"/>
           <circle cx="25" cy="14" r="1.5" fill="currentColor" stroke="none"/>
           <circle cx="37" cy="22" r="1.5" fill="currentColor" stroke="none"/>`,
  // 警告（错误态）
  warning: `<path d="M24 8L44 40H4L24 8z"/>
            <path d="M24 20v10M24 34v2"/>`,
  // 刷新（重试）
  refresh: `<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/>
            <path d="M21 3v5h-5"/>`,
  // 浏览器（PC 官网）
  web: `<circle cx="12" cy="12" r="9"/>
        <path d="M3 12h18"/>
        <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>`,
  // 手机 App
  app: `<rect x="7" y="2" width="10" height="20" rx="2.5"/>
        <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/>
        <path d="M10 5h4"/>`,
  // 喇叭（发布活动）
  megaphone: `<path d="M3 10v4l9 4V6L3 10z"/>
              <path d="M12 8a4 4 0 0 1 0 8"/>
              <path d="M15 5a8 8 0 0 1 0 14"/>
              <path d="M6 14v4a2 2 0 0 0 4 0v-2"/>`,
  // 添加用户（报名）
  'user-plus': `<circle cx="10" cy="8" r="3.5"/>
                <path d="M4 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                <path d="M19 8v6M16 11h6"/>`,
  // 机器人（群同步）
  bot: `<rect x="5" y="8" width="14" height="11" rx="2.5"/>
        <path d="M12 8V4"/>
        <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none"/>
        <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/>
        <path d="M9 16.5h6"/>`,
  // 交叉编排（洗牌）
  shuffle: `<path d="M3 7h4l10 10h4"/>
            <path d="M3 17h4l3-3"/>
            <path d="M14 7h7"/>
            <path d="M18 4l3 3-3 3"/>
            <path d="M18 14l3 3-3 3"/>`,
  // 折线图（ELO 曲线）
  chart: `<path d="M4 20V4"/>
          <path d="M4 20h16"/>
          <path d="M6 16l4-4 3 2 5-6"/>`,
  // 汉堡菜单
  menu: `<line x1="3" y1="6" x2="21" y2="6"/>
         <line x1="3" y1="12" x2="21" y2="12"/>
         <line x1="3" y1="18" x2="21" y2="18"/>`,
  // 关闭
  close: `<line x1="6" y1="6" x2="18" y2="18"/>
          <line x1="18" y1="6" x2="6" y2="18"/>`,
  // 下拉箭头
  chevron: `<path d="M6 9l6 6 6-6"/>`,
  // 退出登录
  logout: `<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/>
           <path d="M10 8l-4 4 4 4"/>
           <path d="M6 12h9"/>`,
  // 个人资料 / 编辑
  person: `<circle cx="12" cy="8" r="4"/>
           <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>`,
}

const viewBox = computed(() => {
  if (props.type === 'podium' || props.type === 'warning') return '0 0 48 48'
  return '0 0 24 24'
})

const iconHtml = computed(() => iconPaths[props.type] || '')
</script>

<template>
  <svg
    :viewBox="viewBox"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    :width="size"
    :height="size"
    v-html="iconHtml"
  />
</template>
