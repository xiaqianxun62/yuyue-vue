import { randomInt, randomItem } from '../utils/random'
import type { EloKRule, EloRuleScenario, EloRules } from '../api/elo'

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
// 结构与后端 /elo/rules 一致，仅在后端不可用（未启动/报错）时作为兜底展示
export const K_FACTOR_RULES: EloKRule[] = [
  { games: '≤ 20 场', k: 40, strongWin: 9.6, strongLoss: -30.4, weakWin: 30.4, weakLoss: -9.6 },
  { games: '21 – 60 场', k: 24, strongWin: 5.8, strongLoss: -18.2, weakWin: 18.2, weakLoss: -5.8 },
  { games: '> 60 场', k: 16, strongWin: 3.8, strongLoss: -12.2, weakWin: 12.2, weakLoss: -3.8 },
]

export const ELO_SCENARIOS: EloRuleScenario[] = [
  {
    scene: '势均力敌',
    matchup: '1200 vs 1200',
    expect: 0.5,
    winDelta: 20,
    lossDelta: -20,
    perPlayer: false,
    note: '五五开，胜负波动最大',
  },
  {
    scene: '强打弱',
    matchup: '1400 vs 1200',
    expect: 0.76,
    winDelta: 10,
    lossDelta: -30,
    perPlayer: false,
    note: '强胜弱加分少，强负弱扣分多',
  },
  {
    scene: '弱胜强',
    matchup: '1200 vs 1400',
    expect: 0.24,
    winDelta: 30,
    lossDelta: -10,
    perPlayer: false,
    note: '爆冷奖励大',
  },
  {
    scene: '双打示例',
    matchup: '均值 1300 vs 1100',
    expect: 0.76,
    winDelta: 10,
    lossDelta: -30,
    perPlayer: true,
    note: 'A 队 (1400, 1200) vs B 队 (1200, 1000)',
  },
]

/** 规则面板兜底：后端 /elo/rules 不通时使用 */
export const FALLBACK_ELO_RULES: EloRules = {
  defaultRating: 1200,
  principle: 'ELO 浮动制：赢强的多加分、赢弱的少加分、输给弱的扣分多',
  formula: 'E = 1 / (1 + 10^((对手分 − 己方分) / 400))，Δ = K × (S − E)',
  kRules: K_FACTOR_RULES,
  scenarios: ELO_SCENARIOS,
  notes: [
    'K 表为理论值保留一位小数，真实结算按四舍五入取整（如 9.6 → +10）',
    '初始积分 1200 分，历史场次按已结算对局数累计',
  ],
  doublesNotes: [
    '同队两人使用同一个组合期望 E（按队伍平均分计算），但各自按自己的 K（各自历史场次）更新积分',
    'ELO 自带防刷：同一组合反复刷分，积分差拉开后强方几乎不得分',
  ],
}

// 积分榜数据来自后端 /ranking，头像墙数据来自后端 /games 的报名列表，均不再使用本地假数据

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
