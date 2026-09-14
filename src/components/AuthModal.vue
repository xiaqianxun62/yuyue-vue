<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ApiError } from '../api/http'
import { useAuth } from '../composables/useAuth'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  /** 已登录后点击「在微信小程序中打开」 */
  openMini: []
}>()

const { user, submitting, login, register, logout } = useAuth()

type Tab = 'login' | 'register'

const tab = ref<Tab>('login')
const error = ref('')

const loginForm = ref({ studentNo: '', password: '' })
const registerForm = ref({
  studentNo: '',
  name: '',
  gender: 1,
  college: '',
  password: '',
})

function messageOf(e: unknown, fallback: string): string {
  return e instanceof ApiError ? e.message : fallback
}

async function submitLogin(): Promise<void> {
  error.value = ''
  const studentNo = loginForm.value.studentNo.trim()
  if (!studentNo || !loginForm.value.password) {
    error.value = '请填写学号和密码'
    return
  }
  try {
    await login({ studentNo, password: loginForm.value.password })
    loginForm.value.password = ''
  } catch (e) {
    error.value = messageOf(e, '登录失败，请稍后重试')
  }
}

async function submitRegister(): Promise<void> {
  error.value = ''
  const studentNo = registerForm.value.studentNo.trim()
  const name = registerForm.value.name.trim()
  const password = registerForm.value.password
  if (!studentNo || !name || !password) {
    error.value = '学号、姓名、密码均为必填'
    return
  }
  if (password.length < 6) {
    error.value = '密码至少 6 位'
    return
  }
  try {
    await register({
      studentNo,
      name,
      gender: registerForm.value.gender,
      college: registerForm.value.college.trim() || undefined,
      password,
    })
    registerForm.value.password = ''
  } catch (e) {
    error.value = messageOf(e, '注册失败，请稍后重试')
  }
}

async function handleLogout(): Promise<void> {
  await logout()
  error.value = ''
  tab.value = 'login'
}

function switchTab(next: Tab): void {
  tab.value = next
  error.value = ''
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

watch(
  () => props.visible,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      error.value = ''
      tab.value = 'login'
    }
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Transition name="auth-fade">
    <div v-if="visible" class="auth-mask" @click.self="emit('close')">
      <div class="auth-card" role="dialog" aria-modal="true" aria-label="登录或注册">
        <button class="auth-close" type="button" aria-label="关闭" @click="emit('close')">
          &times;
        </button>

        <!-- 已登录：个人信息 -->
        <template v-if="user">
          <div class="profile-head">
            <div class="profile-avatar">{{ user.name.charAt(0) }}</div>
            <div class="profile-name">{{ user.name }}</div>
            <div class="profile-meta">{{ user.college || '未填写学院' }}</div>
          </div>
          <div class="profile-stats">
            <div class="stat">
              <strong>{{ user.rating }}</strong>
              <span>ELO 积分</span>
            </div>
            <div class="stat">
              <strong>{{ user.gamesPlayed }}</strong>
              <span>历史场次</span>
            </div>
          </div>
          <div class="auth-actions">
            <button class="auth-submit" type="button" @click="emit('openMini')">
              在微信小程序中打开
            </button>
            <button class="auth-ghost" type="button" @click="handleLogout">退出登录</button>
          </div>
        </template>

        <!-- 未登录：登录 / 注册 -->
        <template v-else>
          <h2 class="auth-title">加入球局</h2>
          <p class="auth-desc">学号认证，登录后即可报名球局、查看积分</p>

          <div class="auth-tabs" role="tablist">
            <button
              class="auth-tab"
              :class="{ active: tab === 'login' }"
              type="button"
              role="tab"
              :aria-selected="tab === 'login'"
              @click="switchTab('login')"
            >
              登录
            </button>
            <button
              class="auth-tab"
              :class="{ active: tab === 'register' }"
              type="button"
              role="tab"
              :aria-selected="tab === 'register'"
              @click="switchTab('register')"
            >
              注册
            </button>
          </div>

          <p v-if="error" class="auth-error" role="alert">{{ error }}</p>

          <form v-if="tab === 'login'" @submit.prevent="submitLogin">
            <div class="auth-field">
              <label class="auth-label" for="login-student-no">学号</label>
              <input
                id="login-student-no"
                v-model="loginForm.studentNo"
                class="auth-input"
                type="text"
                autocomplete="username"
                placeholder="请输入学号"
              />
            </div>
            <div class="auth-field">
              <label class="auth-label" for="login-password">密码</label>
              <input
                id="login-password"
                v-model="loginForm.password"
                class="auth-input"
                type="password"
                autocomplete="current-password"
                placeholder="请输入密码"
              />
            </div>
            <button class="auth-submit" type="submit" :disabled="submitting">
              {{ submitting ? '登录中...' : '登录' }}
            </button>
          </form>

          <form v-else @submit.prevent="submitRegister">
            <div class="auth-field">
              <label class="auth-label" for="register-student-no">学号</label>
              <input
                id="register-student-no"
                v-model="registerForm.studentNo"
                class="auth-input"
                type="text"
                autocomplete="username"
                placeholder="请输入学号"
              />
            </div>
            <div class="auth-field">
              <label class="auth-label" for="register-name">姓名</label>
              <input
                id="register-name"
                v-model="registerForm.name"
                class="auth-input"
                type="text"
                autocomplete="name"
                placeholder="请输入真实姓名"
              />
            </div>
            <div class="auth-field">
              <span class="auth-label">性别</span>
              <div class="gender-row">
                <button
                  class="gender-btn"
                  :class="{ active: registerForm.gender === 1 }"
                  type="button"
                  @click="registerForm.gender = 1"
                >
                  男
                </button>
                <button
                  class="gender-btn"
                  :class="{ active: registerForm.gender === 2 }"
                  type="button"
                  @click="registerForm.gender = 2"
                >
                  女
                </button>
              </div>
            </div>
            <div class="auth-field">
              <label class="auth-label" for="register-college">学院（选填）</label>
              <input
                id="register-college"
                v-model="registerForm.college"
                class="auth-input"
                type="text"
                placeholder="如：计算机学院"
              />
            </div>
            <div class="auth-field">
              <label class="auth-label" for="register-password">密码</label>
              <input
                id="register-password"
                v-model="registerForm.password"
                class="auth-input"
                type="password"
                autocomplete="new-password"
                placeholder="6-64 位"
              />
            </div>
            <button class="auth-submit" type="submit" :disabled="submitting">
              {{ submitting ? '注册中...' : '注册并登录' }}
            </button>
          </form>

          <p class="auth-foot">
            {{ tab === 'login' ? '还没有账号？' : '已有账号？' }}
            <button
              class="auth-link"
              type="button"
              @click="switchTab(tab === 'login' ? 'register' : 'login')"
            >
              {{ tab === 'login' ? '立即注册' : '去登录' }}
            </button>
          </p>
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: opacity 0.25s ease;
}
.auth-fade-enter-from,
.auth-fade-leave-to {
  opacity: 0;
}
.auth-fade-enter-active .auth-card,
.auth-fade-leave-active .auth-card {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.auth-fade-enter-from .auth-card,
.auth-fade-leave-to .auth-card {
  transform: translateY(12px) scale(0.98);
}

.auth-mask {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(11, 58, 51, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 26px 22px 22px;
  background: var(--card);
  border-radius: 18px;
  box-shadow: 0 18px 48px rgba(11, 58, 51, 0.28);
}

.auth-close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.auth-close:hover {
  background: var(--bg);
  color: var(--text);
}

.auth-title {
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}
.auth-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 18px;
}

.auth-tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  margin-bottom: 18px;
  background: var(--bg);
  border-radius: 12px;
}
.auth-tab {
  flex: 1;
  height: 34px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.auth-tab.active {
  background: var(--card);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.auth-error {
  padding: 9px 12px;
  margin-bottom: 14px;
  border-radius: 10px;
  background: rgba(160, 82, 45, 0.1);
  color: #a0522d;
  font-size: 13px;
  line-height: 1.5;
}

.auth-field {
  margin-bottom: 14px;
}
.auth-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}
.auth-input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}
.auth-input:focus,
.auth-input:focus-visible {
  border-color: var(--primary);
  background: var(--card);
  outline: none;
}
.auth-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.gender-row {
  display: flex;
  gap: 8px;
}
.gender-btn {
  flex: 1;
  height: 42px;
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
  font-weight: 600;
}

.auth-submit {
  width: 100%;
  height: 46px;
  margin-top: 6px;
  border: none;
  border-radius: 12px;
  background: var(--accent);
  color: var(--text);
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.auth-submit:hover:not(:disabled) {
  background: var(--accent-dark);
}
.auth-submit:active:not(:disabled) {
  transform: scale(0.98);
}
.auth-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
.auth-ghost {
  width: 100%;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  color: var(--text-muted);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.auth-ghost:hover {
  background: var(--bg);
  color: var(--text);
}

.auth-foot {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}
.auth-link {
  border: none;
  background: transparent;
  color: var(--primary);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0 2px;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.profile-head {
  text-align: center;
  padding-top: 8px;
}
.profile-avatar {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: var(--bg);
  font-size: 26px;
  font-weight: 700;
}
.profile-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
}
.profile-meta {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}
.profile-stats {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.stat {
  flex: 1;
  padding: 14px 10px;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  background: var(--bg);
  text-align: center;
}
.stat strong {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}
.stat span {
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 375px) {
  .auth-card {
    padding: 22px 16px 18px;
  }
}
</style>
