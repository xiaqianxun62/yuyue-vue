<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import SvgIcon from '../components/SvgIcon.vue'
import * as authApi from '../api/auth'
import type { AuthResult } from '../api/auth'
import { useAuth } from '../composables/useAuth'

/** 独立「编辑个人信息」页：#/profile */
const emit = defineEmits<{
  back: []
}>()

const { user, isLoggedIn, applyProfile, restore } = useAuth()

const COLLEGES = [
  '计算机学院',
  '体育学院',
  '电子信息学院',
  '机械学院',
  '经济管理学院',
  '外国语学院',
  '艺术学院',
  '其他',
]

interface ProfileForm {
  name: string
  gender: number
  college: string
  studentNo: string
}

const form = reactive<ProfileForm>({ name: '', gender: 0, college: COLLEGES[0], studentNo: '' })
const saving = ref(false)
const error = ref('')
const success = ref('')

function fill(): void {
  if (!user.value) return
  form.name = user.value.name ?? ''
  form.gender = user.value.gender ?? 0
  form.college = user.value.college || COLLEGES[0]
  form.studentNo = user.value.studentNo ?? ''
}

onMounted(async () => {
  if (!user.value) {
    await restore()
  }
  fill()
})

watch(user, fill)

async function handleSave(): Promise<void> {
  error.value = ''
  success.value = ''
  const name = form.name.trim()
  if (!name) {
    error.value = '请填写姓名'
    return
  }
  saving.value = true
  try {
    const updated: AuthResult = await authApi.updateProfile({
      name,
      gender: Number(form.gender),
      college: form.college,
      studentNo: form.studentNo.trim(),
    })
    applyProfile(updated)
    success.value = '资料已保存'
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败，请稍后重试'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <header class="page-bar">
      <a class="brand" href="#hero" @click.prevent="emit('back')">
        <SvgIcon type="logo" :size="22" class="brand-icon" />
        <span>数羽 SHUYU</span>
      </a>
      <a class="back-link" href="#hero" @click.prevent="emit('back')">返回官网</a>
    </header>

    <main class="page-main">
      <section class="panel">
        <div class="panel-card">
          <template v-if="isLoggedIn">
            <h1 class="title">编辑个人信息</h1>
            <p class="subtitle">修改后会立即生效，群接龙里的称呼也会同步更新</p>

            <label class="field">
              <span class="label">姓名</span>
              <input v-model="form.name" class="input" type="text" placeholder="填写真实姓名" />
            </label>

            <div class="field">
              <span class="label">性别</span>
              <div class="gender">
                <button
                  type="button"
                  class="gender-btn"
                  :class="{ active: form.gender === 1 }"
                  @click="form.gender = 1"
                >
                  男
                </button>
                <button
                  type="button"
                  class="gender-btn"
                  :class="{ active: form.gender === 2 }"
                  @click="form.gender = 2"
                >
                  女
                </button>
              </div>
            </div>

            <label class="field">
              <span class="label">学院</span>
              <select v-model="form.college" class="input">
                <option v-for="c in COLLEGES" :key="c" :value="c">{{ c }}</option>
              </select>
            </label>

            <label class="field">
              <span class="label">学号</span>
              <input
                v-model="form.studentNo"
                class="input"
                type="text"
                placeholder="校园认证用，可留空"
              />
              <span class="hint">绑定学号后可用「学号 + 密码」登录；留空表示不修改</span>
            </label>

            <p v-if="error" class="msg error">{{ error }}</p>
            <p v-if="success" class="msg success">{{ success }}</p>

            <div class="actions">
              <button class="primary-btn" type="button" :disabled="saving" @click="handleSave">
                {{ saving ? '保存中…' : '保存' }}
              </button>
              <button class="ghost-btn" type="button" @click="emit('back')">返回</button>
            </div>
          </template>

          <template v-else>
            <h1 class="title">还没有登录</h1>
            <p class="subtitle">登录后即可编辑个人信息、发布球局、查看 ELO 积分</p>
            <button class="primary-btn" type="button" @click="emit('back')">去登录</button>
          </template>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg);
}
.page-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background: var(--card);
  border-bottom: 1px solid var(--border-light);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  font-weight: 800;
  text-decoration: none;
}
.back-link {
  color: var(--text-muted);
  font-size: 14px;
  text-decoration: none;
}
.back-link:hover {
  color: var(--primary);
}
.page-main {
  display: flex;
  justify-content: center;
  padding: 40px 20px 60px;
}
.panel {
  width: 100%;
  max-width: 420px;
}
.panel-card {
  padding: 24px;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--card);
  box-shadow: var(--shadow-md);
}
.title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}
.subtitle {
  margin: 6px 0 18px;
  font-size: 13px;
  color: var(--text-muted);
}
.field {
  display: block;
  margin-bottom: 14px;
}
.label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}
.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--card);
}
.hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}
.gender {
  display: flex;
  gap: 10px;
}
.gender-btn {
  flex: 1;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text-muted);
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.gender-btn.active {
  border-color: var(--primary);
  background: var(--success-bg);
  color: var(--primary);
  font-weight: 700;
}
.msg {
  margin: 0 0 12px;
  font-size: 13px;
}
.msg.error {
  color: #a0522d;
}
.msg.success {
  color: var(--primary);
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}
.primary-btn,
.ghost-btn {
  flex: 1;
  height: 42px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.primary-btn {
  border: none;
  background: var(--primary);
  color: var(--bg);
}
.primary-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.ghost-btn {
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text-muted);
}
.ghost-btn:hover {
  border-color: var(--primary-light);
  color: var(--primary);
}
</style>
