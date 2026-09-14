<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SvgIcon from './SvgIcon.vue'
import { RANKING_DATA, RANK_TOP_N, K_FACTOR_RULES, ELO_SCENARIOS } from '../data/mock'

const showAll = ref(false)
const showRules = ref(false)
const rankState = ref<'loading' | 'data' | 'empty' | 'error'>('loading')

const displayList = computed(() =>
  showAll.value ? RANKING_DATA : RANKING_DATA.slice(0, RANK_TOP_N)
)

const countText = computed(() =>
  showAll.value ? `全部 ${RANKING_DATA.length} 人` : `Top ${RANK_TOP_N}`
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

function loadRanking() {
  rankState.value = 'loading'
  setTimeout(() => {
    const forceFail = /[?&]rankfail=1/.test(location.search)
    if (forceFail) {
      rankState.value = 'error'
    } else if (RANKING_DATA.length === 0) {
      rankState.value = 'empty'
    } else {
      rankState.value = 'data'
    }
  }, 300)
}

function handleRetry() {
  rankState.value = 'loading'
  setTimeout(() => {
    rankState.value = 'data'
  }, 400)
}

onMounted(loadRanking)
</script>

<template>
  <section id="ranking" class="section">
    <div class="container">
      <div class="wall-header">
        <div class="wall-title-row">
          <h2 class="wall-title">ELO 积分榜</h2>
          <span class="demo-badge">演示数据 · 与小程序积分榜同源</span>
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
            <tr v-for="(p, i) in displayList" :key="p.name + p.dept" :class="{ 'rank-top': i < 3 }">
              <td class="col-rank">
                <span v-if="i < 3" :class="`rank-medal rank-${i + 1}`">{{ i + 1 }}</span>
                <span v-else class="rank-num">{{ i + 1 }}</span>
              </td>
              <td class="col-name">{{ p.name }}</td>
              <td class="col-dept">{{ p.dept }}</td>
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
          网络好像有点小问题<br />点击下方按钮重新加载
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
        <p class="elo-principle">
          ELO 浮动制：<strong>赢强的多加分、赢弱的少加分、输给弱的扣分多</strong>
        </p>

        <h3 class="elo-subtitle">对局场景（K=40，≤20 场）</h3>
        <div class="elo-scenario-list">
          <div v-for="s in ELO_SCENARIOS" :key="s.scene" class="elo-scenario-card">
            <div class="elo-scenario-head">
              <span class="elo-scene">{{ s.scene }}</span>
              <span class="elo-matchup">{{ s.matchup }}</span>
            </div>
            <div class="elo-scenario-body">
              <span class="elo-delta win">{{ s.winDelta }}</span>
              <span class="elo-delta loss">{{ s.lossDelta }}</span>
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="rule in K_FACTOR_RULES" :key="rule.k">
                <td>{{ rule.games }}</td>
                <td class="elo-k-value"><strong>K={{ rule.k }}</strong></td>
                <td class="rec-win">+{{ rule.strongWin }}</td>
                <td class="rec-win">+{{ rule.weakWin }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="elo-doubles">
          <h3 class="elo-subtitle">双打细节</h3>
          <ul class="elo-doubles-list">
            <li>同队两人使用同一个组合期望 E，但各自按自己的 K（各自历史场次）更新积分</li>
            <li>ELO 自带防刷：同一组合反复刷分，积分差拉开后强方几乎不得分</li>
          </ul>
        </div>

        <p class="elo-rules-note">积分榜同步展示于官网与小程序，当前为演示规则说明</p>
      </div>

      <p class="ranking-note">榜单与小程序积分榜同源，当前为演示数据，非真实排名</p>
    </div>
  </section>
</template>
