<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { simulateElo, type SimulateResult } from '../api/elo'
import { ApiError } from '../api/http'

/**
 * ELO 试算：输入男女人数与各自积分，调用后端真实编排引擎 + ELO 计算器，
 * 输出命中的编排方案和每场对局的积分变化（不落库，可随意调参验证）。
 */
const DEFAULT_RATING = 1200

const maleCount = ref(2)
const femaleCount = ref(2)
const gamesPlayed = ref(5)
/** 空 = 自动过滤；1-8 = 指定方案 */
const schemeId = ref<number | ''>('')
/** 赛制：单轮 / 循环赛 */
const roundRobin = ref(false)
const ratings = ref<number[]>([1300, 1250, 1200, 1150])
const winners = ref<number[]>([])

const result = ref<SimulateResult | null>(null)
const state = ref<'idle' | 'loading' | 'error'>('idle')
const error = ref('')

const total = computed(() => maleCount.value + femaleCount.value)

const ratingFields = computed(() => {
  const fields: { key: string; label: string; index: number }[] = []
  for (let i = 0; i < maleCount.value; i++) {
    fields.push({ key: 'm' + i, label: `男${i + 1}`, index: i })
  }
  for (let j = 0; j < femaleCount.value; j++) {
    fields.push({ key: 'f' + j, label: `女${j + 1}`, index: maleCount.value + j })
  }
  return fields
})

// 人数变化时补齐 / 截断积分输入
watch([maleCount, femaleCount], () => {
  const n = Math.max(total.value, 0)
  const next = ratings.value.slice(0, n)
  while (next.length < n) next.push(DEFAULT_RATING)
  ratings.value = next
})

// 已经算过一次后再换方案 / 赛制，直接重算，省一次点击
watch([schemeId, roundRobin], () => {
  if (result.value) run()
})

async function run(): Promise<void> {
  state.value = 'loading'
  error.value = ''
  try {
    result.value = await simulateElo({
      maleCount: maleCount.value,
      femaleCount: femaleCount.value,
      ratings: ratings.value,
      gamesPlayed: gamesPlayed.value,
      schemeId: schemeId.value === '' ? undefined : schemeId.value,
      roundRobin: roundRobin.value,
      winners: winners.value,
    })
    // 用后端返回的胜方回填，保证场次与开关一致
    winners.value = result.value.matches.map((m) => m.winner)
    state.value = 'idle'
  } catch (e) {
    result.value = null
    winners.value = []
    error.value = e instanceof ApiError ? e.message : '试算失败，请确认后端已启动'
    state.value = 'error'
  }
}

/** 切换某场的胜方并立即重算 */
async function setWinner(index: number, winner: number): Promise<void> {
  winners.value[index] = winner
  await run()
}

function deltaText(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta)
}

function percent(value: number): string {
  return (value * 100).toFixed(1) + '%'
}
</script>

<template>
  <section id="elo-lab" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">ELO 试算</h2>
        <p class="section-desc">
          输入男女人数与积分，用后端真实编排引擎和 ELO 计算器模拟一遍，看方案与积分怎么变
        </p>
      </div>

      <div class="lab-form">
        <div class="lab-row">
          <label class="lab-field">
            <span class="lab-label">男生人数</span>
            <input v-model.number="maleCount" class="lab-input" type="number" min="0" max="40" />
          </label>
          <label class="lab-field">
            <span class="lab-label">女生人数</span>
            <input v-model.number="femaleCount" class="lab-input" type="number" min="0" max="40" />
          </label>
          <label class="lab-field">
            <span class="lab-label">历史场次（决定 K）</span>
            <input v-model.number="gamesPlayed" class="lab-input" type="number" min="0" />
          </label>
          <label class="lab-field lab-field-wide">
            <span class="lab-label">编排方案</span>
            <select v-model="schemeId" class="lab-input">
              <option value="">自动（按性别构成过滤）</option>
              <option :value="1">① 全单打</option>
              <option :value="2">② 全混双</option>
              <option :value="3">③ 全男双</option>
              <option :value="4">④ 全女双</option>
              <option :value="5">⑤ 混搭·混双优先</option>
              <option :value="6">⑥ 混搭·同性别优先</option>
              <option :value="7">⑦ 混双·纯随机</option>
              <option :value="8">⑧ 全随机（不分性别）</option>
            </select>
          </label>
          <label class="lab-field lab-field-wide">
            <span class="lab-label">赛制</span>
            <select v-model="roundRobin" class="lab-input">
              <option :value="false">单轮（每人一场）</option>
              <option :value="true">循环赛（队伍两两互打）</option>
            </select>
          </label>
        </div>

        <div class="lab-ratings">
          <span class="lab-label">每人初始积分（先男后女）</span>
          <div class="lab-rating-grid">
            <label v-for="f in ratingFields" :key="f.key" class="lab-rating">
              <span class="lab-rating-name">{{ f.label }}</span>
              <input v-model.number="ratings[f.index]" class="lab-input" type="number" min="0" />
            </label>
          </div>
        </div>

        <div class="lab-actions">
          <button class="lab-run" type="button" :disabled="state === 'loading'" @click="run">
            {{ state === 'loading' ? '试算中...' : '开始试算' }}
          </button>
          <span class="lab-hint">共 {{ total }} 人，少于 4 人无法编排</span>
        </div>

        <p v-if="error" class="lab-error" role="alert">{{ error }}</p>
      </div>

      <div v-if="result" class="lab-result">
        <div class="lab-scheme">
          <span class="lab-scheme-id">方案{{ result.schemeId }}</span>
          <strong>{{ result.schemeName }}</strong>
          <span class="lab-scheme-count">共 {{ result.matches.length }} 局</span>
          <span class="lab-scheme-k">K={{ result.players[0]?.kFactor ?? '-' }}</span>
        </div>

        <div v-if="result.players.length" class="lab-final">
          <span class="lab-final-title">最终积分</span>
          <div class="lab-final-list">
            <span v-for="p in result.players" :key="p.id" class="lab-final-item">
              {{ p.label }}
              <span class="lab-final-from">{{ p.rating }}</span>
              →
              <strong>{{ p.finalRating ?? p.rating }}</strong>
            </span>
          </div>
        </div>

        <div v-if="result.matches.length === 0" class="lab-empty">当前人数构成没有生成对阵</div>

        <div v-for="(m, i) in result.matches" v-else :key="i" class="lab-match">
          <div class="lm-head">
            <span class="lm-format">{{ m.formatName }}</span>
            <span class="lm-exp">A 队期望 {{ percent(m.expectedA) }} · B 队 {{ percent(m.expectedB) }}</span>
            <div class="lm-winner">
              <button
                class="lm-win-btn"
                :class="{ active: m.winner === 1 }"
                type="button"
                @click="setWinner(i, 1)"
              >
                A 队胜
              </button>
              <button
                class="lm-win-btn"
                :class="{ active: m.winner === 2 }"
                type="button"
                @click="setWinner(i, 2)"
              >
                B 队胜
              </button>
            </div>
          </div>
          <div class="lm-body">
            <div class="lm-team">
              <div v-for="p in m.teamA" :key="p.id" class="lm-player">
                <span class="lm-name">{{ p.label }}</span>
                <span class="lm-score">{{ p.ratingBefore }} → {{ p.ratingAfter }}</span>
                <span class="lm-delta" :class="{ up: p.delta > 0, down: p.delta < 0 }">
                  {{ deltaText(p.delta) }}
                </span>
              </div>
            </div>
            <div class="lm-vs">VS</div>
            <div class="lm-team">
              <div v-for="p in m.teamB" :key="p.id" class="lm-player">
                <span class="lm-name">{{ p.label }}</span>
                <span class="lm-score">{{ p.ratingBefore }} → {{ p.ratingAfter }}</span>
                <span class="lm-delta" :class="{ up: p.delta > 0, down: p.delta < 0 }">
                  {{ deltaText(p.delta) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lab-form {
  padding: 20px;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--card);
}
.lab-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
.lab-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 140px;
}
.lab-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}
.lab-field-wide {
  min-width: 210px;
}
.lab-input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}
.lab-input:focus {
  border-color: var(--primary);
  background: var(--card);
}

.lab-ratings {
  margin-top: 18px;
}
.lab-rating-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 10px;
  margin-top: 8px;
}
.lab-rating {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lab-rating-name {
  font-size: 12px;
  color: var(--text-muted);
}
.lab-rating .lab-input {
  height: 36px;
  width: 100%;
}

.lab-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}
.lab-run {
  height: 42px;
  padding: 0 22px;
  border: none;
  border-radius: 12px;
  background: var(--accent);
  color: var(--text);
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.lab-run:hover:not(:disabled) {
  background: var(--accent-dark);
}
.lab-run:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.lab-hint {
  font-size: 12px;
  color: var(--text-muted);
}
.lab-error {
  margin-top: 14px;
  padding: 9px 12px;
  border-radius: 10px;
  background: rgba(160, 82, 45, 0.1);
  color: #a0522d;
  font-size: 13px;
}

.lab-result {
  margin-top: 24px;
}
.lab-scheme {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.lab-scheme-id {
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--primary);
  color: var(--bg);
  font-size: 12px;
  font-weight: 700;
}
.lab-scheme strong {
  font-size: 16px;
  color: var(--text);
}
.lab-scheme-count,
.lab-scheme-k {
  font-size: 13px;
  color: var(--text-muted);
}

.lab-final {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.lab-final-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
}
.lab-final-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lab-final-item {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--card);
  border: 1px solid var(--border-light);
  font-size: 12px;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.lab-final-from {
  color: var(--text-muted);
}

.lab-empty {
  padding: 28px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.lab-match {
  padding: 16px 18px;
  margin-bottom: 12px;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  background: var(--card);
}
.lm-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.lm-format {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--success-bg);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}
.lm-exp {
  font-size: 12px;
  color: var(--text-muted);
}
.lm-winner {
  display: flex;
  gap: 6px;
  margin-left: auto;
}
.lm-win-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--card);
  color: var(--text-muted);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.lm-win-btn.active {
  border-color: var(--primary);
  background: var(--success-bg);
  color: var(--primary);
}

.lm-body {
  display: flex;
  align-items: stretch;
  gap: 12px;
}
.lm-team {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lm-player {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--bg);
}
.lm-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.lm-score {
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.lm-delta {
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.lm-delta.up {
  color: var(--primary);
}
.lm-delta.down {
  color: #a0522d;
}
.lm-vs {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .lm-body {
    flex-direction: column;
  }
  .lm-vs {
    justify-content: center;
  }
  .lm-winner {
    margin-left: 0;
  }
}
</style>
