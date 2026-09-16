<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SvgIcon from './SvgIcon.vue'
import { FALLBACK_ELO_RULES } from '../data/mock'
import { fetchRanking, type RankingItem } from '../api/ranking'
import { fetchEloRules, type EloRules } from '../api/elo'
import { ApiError } from '../api/http'

/** 一次取回的条目数，前端再切 Top 10 / 全部 */
const RANK_FETCH_SIZE = 50
const RANK_TOP_N = 10

const ranking = ref<RankingItem[]>([])
const showAll = ref(false)
const showRules = ref(false)
const rankState = ref<'loading' | 'data' | 'empty' | 'error'>('loading')
/** 失败原因：直接展示后端/网络层的原文，便于区分「后端没起」「跨域被拦」「接口报错」 */
const rankError = ref('')
/** 规则说明：初始用本地兜底，/elo/rules 成功后覆盖 */
const rules = ref<EloRules>(FALLBACK_ELO_RULES)

const displayList = computed(() =>
  showAll.value ? ranking.value : ranking.value.slice(0, RANK_TOP_N)
)

const countText = computed(() =>
  showAll.value
    ? `全部 ${ranking.value.length} 人`
    : `Top ${Math.min(RANK_TOP_N, ranking.value.length)}`
)

const toggleText = computed(() => (showAll.value ? '只看 Top 10' : '查看全部'))
const rulesText = computed(() => (showRules.value ? '收起规则' : 'ELO 规则'))

function toggleView() {
  if (rankState.value !== 'data') return
  showAll.value = !showAll.value
}

function toggleRules() {
  showRules.value = !showRules.value
}

async function loadRanking(): Promise<void> {
  rankState.value = 'loading'
  rankError.value = ''
  try {
    ranking.value = await fetchRanking(RANK_FETCH_SIZE)
    rankState.value = ranking.value.length === 0 ? 'empty' : 'data'
  } catch (e) {
    ranking.value = []
    rankError.value = e instanceof ApiError ? e.message : '榜单加载失败，请稍后重试'
    rankState.value = 'error'
  }
}

function handleRetry(): void {
  loadRanking()
}

/** ELO 规则：由后端 EloCalculator 实时算出，拿不到时退回本地兜底常量 */
async function loadRules(): Promise<void> {
  try {
    rules.value = await fetchEloRules()
  } catch {
    rules.value = FALLBACK_ELO_RULES
  }
}

/** 积分变化文案：+20 / −20 / 各 +10 */
function deltaText(value: number, perPlayer: boolean): string {
  const sign = value > 0 ? '+' : '−'
  return (perPlayer ? '各 ' : '') + sign + Math.abs(value)
}

onMounted(() => {
  loadRanking()
  loadRules()
})
</script>

<template>
  <section id="ranking" class="section">
    <div class="container">
      <div class="wall-header">
        <div class="wall-title-row">
          <h2 class="wall-title">ELO 积分榜</h2>
          <span class="live-badge">实时数据 · 与小程序积分榜同源</span>
        </div>
        <div class="ranking-switch">
          <button class="rank-toggle" type="button" @click="toggleView">
            {{ toggleText }}
          </button>
          <span class="rank-count">{{ countText }}</span>
        </div>
      </div>

      <!-- 表格 -->
      <div
        class="ranking-table-wrap"
        v-show="rankState === 'data' || rankState === 'loading'"
      >
        <table class="ranking-table" aria-label="ELO积分榜单">
          <thead>
            <tr>
              <th class="col-rank" scope="col">排名</th>
              <th scope="col">球友</th>
              <th scope="col">学院</th>
              <th class="col-rating" scope="col">积分</th>
              <th class="col-record" scope="col">胜 / 负</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in displayList" :key="p.userId" :class="{ 'rank-top': i < 3 }">
              <td class="col-rank">
                <span v-if="i < 3" :class="`rank-medal rank-${i + 1}`">{{ i + 1 }}</span>
                <span v-else class="rank-num">{{ i + 1 }}</span>
              </td>
              <td class="col-name">{{ p.anonymousName }}</td>
              <td class="col-dept">{{ p.college || '未填写' }}</td>
              <td class="col-rating"><strong>{{ p.rating }}</strong></td>
              <td class="col-record">
                <span class="rec-win">{{ p.win }}</span> /
                <span class="rec-loss">{{ p.loss }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空态 -->
      <div v-if="rankState === 'empty'" class="ranking-state" role="status">
        <SvgIcon type="podium" :size="56" class="ranking-state-icon" />
        <div class="ranking-state-title">暂无战绩</div>
        <div class="ranking-state-desc">
          所有球友还未产生对局记录<br />打一局就会上榜哦
        </div>
      </div>

      <!-- 错误态 -->
      <div v-if="rankState === 'error'" class="ranking-state" role="alert">
        <SvgIcon type="warning" :size="56" class="ranking-state-icon" />
        <div class="ranking-state-title">榜单加载失败</div>
        <div class="ranking-state-desc">
          {{ rankError }}<br />点击下方按钮重新加载
        </div>
        <button class="ranking-retry-btn" type="button" @click="handleRetry">
          <SvgIcon type="refresh" :size="14" />
          重新加载
        </button>
      </div>

      <!-- ELO 规则面板 -->
      <div class="elo-rules-toggle-row">
        <button
          class="rank-toggle elo-rules-toggle"
          type="button"
          :aria-expanded="showRules"
          @click="toggleRules"
        >
          <SvgIcon type="chart" :size="14" />
          {{ rulesText }}
        </button>
      </div>

      <div v-show="showRules" class="elo-rules-panel">
        <p class="elo-principle">{{ rules.principle }}</p>
        <p v-if="rules.formula" class="elo-formula">{{ rules.formula }}</p>

        <h3 class="elo-subtitle">
          对局场景（K={{ rules.kRules[0]?.k ?? '-' }}，{{ rules.kRules[0]?.games ?? '-' }}）
        </h3>
        <div class="elo-scenario-list">
          <div v-for="s in rules.scenarios" :key="s.scene" class="elo-scenario-card">
            <div class="elo-scenario-head">
              <span class="elo-scene">{{ s.scene }}</span>
              <span class="elo-matchup">{{ s.matchup }}</span>
              <span class="elo-expect">期望 {{ (s.expect * 100).toFixed(0) }}%</span>
            </div>
            <div class="elo-scenario-body">
              <span class="elo-delta win">{{ deltaText(s.winDelta, s.perPlayer) }}</span>
              <span class="elo-delta loss">{{ deltaText(s.lossDelta, s.perPlayer) }}</span>
              <span class="elo-note">{{ s.note }}</span>
            </div>
          </div>
        </div>

        <h3 class="elo-subtitle">K 因子（新手波动大、老手稳定）</h3>
        <div class="elo-k-wrap">
          <table class="elo-k-table" aria-label="K 因子对照表">
            <thead>
              <tr>
                <th scope="col">历史场次</th>
                <th scope="col">K 值</th>
                <th scope="col">强胜弱 (Δ)</th>
                <th scope="col">弱胜强 (Δ)</th>
                <th scope="col">强负弱 (Δ)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rule in rules.kRules" :key="rule.k">
                <td>{{ rule.games }}</td>
                <td class="elo-k-value"><strong>K={{ rule.k }}</strong></td>
                <td class="rec-win">+{{ rule.strongWin }}</td>
                <td class="rec-win">+{{ rule.weakWin }}</td>
                <td class="rec-loss">{{ rule.strongLoss }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul v-if="rules.notes.length" class="elo-notes">
          <li v-for="n in rules.notes" :key="n">{{ n }}</li>
        </ul>

        <div class="elo-doubles">
          <h3 class="elo-subtitle">双打细节</h3>
          <ul class="elo-doubles-list">
            <li v-for="n in rules.doublesNotes" :key="n">{{ n }}</li>
          </ul>
        </div>

        <p class="elo-rules-note">规则来自后端 /elo/rules，由 EloCalculator 实时算出，与小程序同源</p>
      </div>

      <p class="ranking-note">榜单来自后端 /ranking（Redis ZSet），与小程序积分榜同源</p>
    </div>
  </section>
</template>
