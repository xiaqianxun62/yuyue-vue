import type { Department } from '../utils/random'
import { DEPARTMENTS, randomInt, randomItem } from '../utils/random'

// ============ 功能卡片 ============
export interface FeatureItem {
  title: string
  desc: string
  iconType: 'court' | 'engine' | 'trophy' | 'chat'
}

export const FEATURES: FeatureItem[] = [
  {
    title: '发布 / 加入球局',
    desc: '一键发布球局或加入已有场次，群外球友也能匿名报名，到场就能打',
    iconType: 'court',
  },
  {
    title: '自动编排引擎',
    desc: '按男女人数构成自动过滤 6 套方案，单打 / 混双 / 男双 / 女双智能成局',
    iconType: 'engine',
  },
  {
    title: 'ELO 积分与战绩',
    desc: '每局对战记录 ELO 积分变化，沉淀个人战绩，找得到同水平对手',
    iconType: 'trophy',
  },
  {
    title: '实时头像墙与聊天室',
    desc: '在线球友一目了然，临时聊天室随时约球，关闭即消不保留',
    iconType: 'chat',
  },
]

// ============ 加入步骤 ============
export interface HowToStep {
  step: number
  title: string
  desc: string
  iconType: 'phone' | 'card' | 'racket'
}

export const HOW_TO_STEPS: HowToStep[] = [
  {
    step: 1,
    title: '微信打开小程序',
    desc: '搜索「羽约」或扫码进入，无需下载 App',
    iconType: 'phone',
  },
  {
    step: 2,
    title: '学号 + 姓名认证',
    desc: '校园认证加入，保证球友身份真实可靠',
    iconType: 'card',
  },
  {
    step: 3,
    title: '浏览球局报名开打',
    desc: '查看附近球局，一键报名，到场就有球打',
    iconType: 'racket',
  },
]

// ============ 三端覆盖 ============
export interface PlatformItem {
  name: string
  desc: string
  iconType: 'phone' | 'web' | 'app'
}

export const PLATFORMS: PlatformItem[] = [
  {
    name: '小程序',
    desc: '微信内即开即用，报名、编排、计分一站式完成',
    iconType: 'phone',
  },
  {
    name: 'PC 官网',
    desc: '发布约球活动与人员报名，查看积分榜与球局动态',
    iconType: 'web',
  },
  {
    name: 'APP',
    desc: '独立客户端，消息推送更及时，约球提醒不错过',
    iconType: 'app',
  },
]

// ============ 自动编排方案 ============
export interface ArrangeScheme {
  id: number
  name: string
  comp: string
  condition: string
}

export const ARRANGE_SCHEMES: ArrangeScheme[] = [
  { id: 1, name: '全单打', comp: '全部单打', condition: '报名人数 ≥ 4' },
  { id: 2, name: '全混双', comp: '全部混双（男女同数）', condition: '男数 = 女数' },
  { id: 3, name: '全男双', comp: '全部男双', condition: '女数 ≤ 1' },
  { id: 4, name: '全女双', comp: '全部女双', condition: '男数 ≤ 1' },
  {
    id: 5,
    name: '混搭 · 混双优先',
    comp: '混双为主；男多 1 时，至多 1 局男双 vs 混双，最弱男进男双队均衡实力',
    condition: '男数 ≥ 女数',
  },
  {
    id: 6,
    name: '混搭 · 同性别优先',
    comp: '男双 + 女双互不混合',
    condition: '男数 ≥ 2 且女数 ≥ 2',
  },
]

// ============ 匿名报名流程 ============
export interface SignupStep {
  step: number
  title: string
  desc: string
  iconType: 'megaphone' | 'user-plus' | 'bot'
}

export const SIGNUP_STEPS: SignupStep[] = [
  {
    step: 1,
    title: '官网发布约球活动',
    desc: '组织者在 PC 官网发布球局，开放人员报名，群外球友也能参与',
    iconType: 'megaphone',
  },
  {
    step: 2,
    title: '匿名填写报名信息',
    desc: '无需进群、无需加联系人，官网一键提交报名，隐私更省心',
    iconType: 'user-plus',
  },
  {
    step: 3,
    title: '机器人同步群接龙',
    desc: '机器人自动把官网报名信息同步到微信群接龙，组织者零维护',
    iconType: 'bot',
  },
]

// ============ ELO 规则 ============
export interface KFactorRule {
  games: string
  k: number
  strongWin: number
  weakWin: number
}

export const K_FACTOR_RULES: KFactorRule[] = [
  { games: '≤ 20 场', k: 40, strongWin: 9.6, weakWin: 30.4 },
  { games: '21 – 60 场', k: 24, strongWin: 5.8, weakWin: 18.2 },
  { games: '> 60 场', k: 16, strongWin: 3.8, weakWin: 12.2 },
]

export interface EloScenario {
  scene: string
  matchup: string
  expect: number
  winDelta: string
  lossDelta: string
  note: string
}

export const ELO_SCENARIOS: EloScenario[] = [
  {
    scene: '势均力敌',
    matchup: '1200 vs 1200',
    expect: 0.5,
    winDelta: '+20',
    lossDelta: '−20',
    note: '五五开，胜负波动最大',
  },
  {
    scene: '强打弱',
    matchup: '1400 vs 1200',
    expect: 0.76,
    winDelta: '+9.6',
    lossDelta: '−30.4',
    note: '强胜弱加分少，强负弱扣分多',
  },
  {
    scene: '弱胜强',
    matchup: '1200 vs 1400',
    expect: 0.24,
    winDelta: '+30.4',
    lossDelta: '−9.6',
    note: '爆冷奖励大',
  },
  {
    scene: '双打示例',
    matchup: '均值 1300 vs 1100',
    expect: 0.76,
    winDelta: '各 +9.6',
    lossDelta: '各 −30.4',
    note: 'A 队 (1400, 1200) vs B 队 (1200, 1000)',
  },
]

// ============ ELO 积分榜 ============
export interface RankingItem {
  name: string
  dept: string
  rating: number
  win: number
  loss: number
}

export const RANKING_DATA: RankingItem[] = [
  { name: '陈**', dept: '计算机学院', rating: 1648, win: 20, loss: 5 },
  { name: '林**', dept: '体育学院', rating: 1612, win: 18, loss: 4 },
  { name: '李**', dept: '电子工程学院', rating: 1589, win: 17, loss: 6 },
  { name: '王**', dept: '机械工程学院', rating: 1553, win: 15, loss: 5 },
  { name: '杨**', dept: '生命学院', rating: 1530, win: 14, loss: 7 },
  { name: '赵**', dept: '经管学院', rating: 1504, win: 16, loss: 9 },
  { name: '周**', dept: '数学学院', rating: 1482, win: 13, loss: 6 },
  { name: '吴**', dept: '物理学院', rating: 1461, win: 12, loss: 7 },
  { name: '郑**', dept: '外国语学院', rating: 1437, win: 11, loss: 8 },
  { name: '孙**', dept: '建筑学院', rating: 1410, win: 10, loss: 7 },
  { name: '何**', dept: '新闻学院', rating: 1388, win: 9, loss: 8 },
  { name: '高**', dept: '材料学院', rating: 1365, win: 10, loss: 9 },
  { name: '徐**', dept: '法学院', rating: 1332, win: 8, loss: 9 },
  { name: '韩**', dept: '化学学院', rating: 1301, win: 7, loss: 10 },
  { name: '罗**', dept: '人文学院', rating: 1278, win: 6, loss: 11 },
  { name: '冯**', dept: '计算机学院', rating: 1240, win: 5, loss: 12 },
]

export const RANK_TOP_N = 10

// ============ 头像墙 ============
export interface AvatarUser {
  id: string
  nickname: string
  dept: Department
  colorIndex: number
}

const NICK_POOL = [
  '小飞侠',
  '羽毛球迷',
  '球场老炮',
  '网前高手',
  '后场杀手',
  '步法王',
  '接发怪',
  '吊球精',
  '杀球狂',
  '平抽挡',
]

export function generateAvatarUsers(count: number): AvatarUser[] {
  const users: AvatarUser[] = []
  const usedIds = new Set<string>()
  while (users.length < count) {
    const id = 'u' + Math.random().toString(36).slice(2, 8)
    if (usedIds.has(id)) continue
    usedIds.add(id)
    users.push({
      id,
      nickname: randomItem(NICK_POOL) + '#' + randomInt(100, 999),
      dept: randomItem(DEPARTMENTS as unknown as Department[]),
      colorIndex: randomInt(0, 7),
    })
  }
  return users
}

// ============ 聊天室 ============
export interface ChatMessage {
  id: string
  nickname: string
  content: string
  isSelf: boolean
  colorIndex: number
  failed?: boolean
}

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init-1',
    nickname: '系统消息',
    content: '欢迎来到临时聊天室，消息仅本次会话展示，关闭后不保留。',
    isSelf: false,
    colorIndex: 1,
  },
  {
    id: 'init-2',
    nickname: '杀球王#233',
    content: '今晚球馆有人来吗',
    isSelf: false,
    colorIndex: 2,
  },
  {
    id: 'init-3',
    nickname: '网前雨刮器#456',
    content: '我 7 点到',
    isSelf: false,
    colorIndex: 4,
  },
]

export const AUTO_REPLIES = [
  '今晚球馆有人来吗',
  '我 7 点到',
  '有人双打吗',
  '今天场地空吗',
  '新人求带',
  '有人一起练高远球吗',
  '刚打完，累瘫了',
  '明天约球呀',
  '球馆几点关门',
  '有没带拍的朋友吗',
  '下次约混双',
  '谁知道新球馆怎么去',
]

// 生成匿名昵称
const NICK_PREFIXES = [
  '杀球王',
  '网前雨刮器',
  '反手拧拉',
  '高远球',
  '劈吊小王子',
  '步法飘逸',
  '平抽挡',
  '接发狂魔',
  '后场重炮',
  '鱼跃救球',
]

export function generateNickname(): string {
  const prefix = randomItem(NICK_PREFIXES)
  const num = randomInt(100, 999)
  return `${prefix}#${num}`
}
