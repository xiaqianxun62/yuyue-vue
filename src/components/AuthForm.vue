<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { ApiError } from '../api/http'
import { fetchCaptcha } from '../api/auth'
import { useAuth } from '../composables/useAuth'

/** 登录 / 注册表单。弹窗（AuthModal）与独立页面（AuthPage）共用同一份逻辑 */
const props = withDefaults(
  defineProps<{
    initialTab?: 'login' | 'register'
  }>(),
  { initialTab: 'login' },
)

const emit = defineEmits<{
  /** 登录或注册成功（用户信息已进入全局状态） */
  success: []
}>()

const { submitting, login, register } = useAuth()

type Tab = 'login' | 'register'

const tab = ref<Tab>(props.initialTab)
const error = ref('')

const loginForm = ref({ account: '', password: '' })
const registerForm = ref({
  account: '',
  name: '',
  gender: 1,
  password: '',
})

// 图形验证码
const captchaLoading = ref(false)
const captchaUuid = ref('')
const captchaImage = ref('')
const captchaInput = ref('')

async function loadCaptcha(): Promise<void> {
  captchaLoading.value = true
  error.value = ''
  try {
    const res = await fetchCaptcha()
    captchaUuid.value = res.uuid
    captchaImage.value = res.image
    captchaInput.value = ''
  } catch (e) {
    error.value = e instanceof ApiError ? `验证码加载失败：${e.message}` : '验证码加载失败'
  } finally {
    captchaLoading.value = false
  }
}

function messageOf(e: unknown, fallback: string): string {
  return e instanceof ApiError ? e.message : fallback
}

async function submitLogin(): Promise<void> {
  error.value = ''
  const account = loginForm.value.account.trim()
  if (!account || !loginForm.value.password) {
    error.value = '请填写账号和密码'
    return
  }
  if (!captchaInput.value.trim()) {
    error.value = '请填写图形验证码'
    return
  }
  try {
    await login({
      account,
      password: loginForm.value.password,
      captchaUuid: captchaUuid.value,
      captchaCode: captchaInput.value.trim(),
    })
    loginForm.value.password = ''
    captchaInput.value = ''
    emit('success')
  } catch (e) {
    error.value = messageOf(e, '登录失败，请稍后重试')
    await loadCaptcha() // 失败强制换一张
  }
}

async function submitRegister(): Promise<void> {
  error.value = ''
  const account = registerForm.value.account.trim()
  const name = registerForm.value.name.trim()
  const password = registerForm.value.password
  if (!account || !name || !password) {
    error.value = '账号、姓名、密码均为必填'
    return
  }
  if (password.length < 6) {
    error.value = '密码至少 6 位'
    return
  }
  try {
    await register({
      account,
      name,
      gender: registerForm.value.gender,
      password,
      captchaUuid: captchaUuid.value,
      captchaCode: captchaInput.value.trim(),
    })
    registerForm.value.password = ''
    captchaInput.value = ''
    emit('success')
  } catch (e) {
    error.value = messageOf(e, '注册失败，请稍后重试')
    await loadCaptcha() // 失败强制换一张
  }
}

function switchTab(next: Tab): void {
  tab.value = next
  error.value = ''
  void loadCaptcha()
}

onMounted(() => {
  void loadCaptcha()
})

// 组件被动态切换时也补一张（AuthModal 场景）
watch(() => props.initialTab, (val) => {
  tab.value = val
  void loadCaptcha()
})
</script>

<template>
  <div class="auth-form">
    <h2 class="af-title">登陆</h2>
    <p class="af-desc">注册账号后即可报名球局、查看积分</p>

    <div class="af-tabs" role="tablist">
      <button
        class="af-tab"
        :class="{ active: tab === 'login' }"
        type="button"
        role="tab"
        :aria-selected="tab === 'login'"
        @click="switchTab('login')"
      >
        登录
      </button>
      <button
        class="af-tab"
        :class="{ active: tab === 'register' }"
        type="button"
        role="tab"
        :aria-selected="tab === 'register'"
        @click="switchTab('register')"
      >
        注册
      </button>
    </div>

    <p v-if="error" class="af-error" role="alert">{{ error }}</p>

    <form v-if="tab === 'login'" @submit.prevent="submitLogin">
      <div class="af-field">
        <label class="af-label" for="login-account">账号</label>
        <input
          id="login-account"
          v-model="loginForm.account"
          class="af-input"
          type="text"
          autocomplete="username"
          placeholder="请输入账号"
        />
      </div>
      <div class="af-field">
        <label class="af-label" for="login-password">密码</label>
        <input
          id="login-password"
          v-model="loginForm.password"
          class="af-input"
          type="password"
          autocomplete="current-password"
          placeholder="请输入密码"
        />
      </div>
      <div class="af-field">
        <label class="af-label" for="login-captcha">图形验证码</label>
        <div class="af-captcha-row">
          <input
            id="login-captcha"
            v-model="captchaInput"
            class="af-input"
            type="text"
            maxlength="6"
            autocomplete="off"
            placeholder="不区分大小写"
          />
          <button
            type="button"
            class="af-captcha-img"
            :disabled="captchaLoading"
            :title="captchaLoading ? '加载中...' : '点击换一张'"
            @click="loadCaptcha"
          >
            <img
              v-if="captchaImage"
              :src="captchaImage"
              alt="验证码"
              draggable="false"
            />
          </button>
        </div>
      </div>
      <button class="af-submit" type="submit" :disabled="submitting">
        {{ submitting ? '登录中...' : '登录' }}
      </button>
    </form>

    <form v-else @submit.prevent="submitRegister">
      <div class="af-field">
        <label class="af-label" for="register-account">账号</label>
        <input
          id="register-account"
          v-model="registerForm.account"
          class="af-input"
          type="text"
          autocomplete="username"
          placeholder="请输入账号"
        />
      </div>
      <div class="af-field">
        <label class="af-label" for="register-name">姓名</label>
        <input
          id="register-name"
          v-model="registerForm.name"
          class="af-input"
          type="text"
          autocomplete="name"
          placeholder="请输入真实姓名"
        />
      </div>
      <div class="af-field">
        <span class="af-label">性别</span>
        <div class="af-gender-row">
          <button
            class="af-gender-btn"
            :class="{ active: registerForm.gender === 1 }"
            type="button"
            @click="registerForm.gender = 1"
          >
            男
          </button>
          <button
            class="af-gender-btn"
            :class="{ active: registerForm.gender === 2 }"
            type="button"
            @click="registerForm.gender = 2"
          >
            女
          </button>
        </div>
      </div>
      <div class="af-field">
        <label class="af-label" for="register-password">密码</label>
        <input
          id="register-password"
          v-model="registerForm.password"
          class="af-input"
          type="password"
          autocomplete="new-password"
          placeholder="6-64 位"
        />
      </div>
      <div class="af-field">
        <label class="af-label" for="register-captcha">图形验证码</label>
        <div class="af-captcha-row">
          <input
            id="register-captcha"
            v-model="captchaInput"
            class="af-input"
            type="text"
            maxlength="6"
            autocomplete="off"
            placeholder="不区分大小写"
          />
          <button
            type="button"
            class="af-captcha-img"
            :disabled="captchaLoading"
            :title="captchaLoading ? '加载中...' : '点击换一张'"
            @click="loadCaptcha"
          >
            <img
              v-if="captchaImage"
              :src="captchaImage"
              alt="验证码"
              draggable="false"
            />
          </button>
        </div>
      </div>
      <button class="af-submit" type="submit" :disabled="submitting">
        {{ submitting ? '注册中...' : '注册并登录' }}
      </button>
    </form>

    <p class="af-foot">
      {{ tab === 'login' ? '还没有账号？' : '已有账号？' }}
      <button class="af-link" type="button" @click="switchTab(tab === 'login' ? 'register' : 'login')">
        {{ tab === 'login' ? '立即注册' : '去登录' }}
      </button>
    </p>
  </div>
</template>

<style scoped>
.af-title {
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}
.af-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 18px;
}

.af-tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  margin-bottom: 18px;
  background: var(--bg);
  border-radius: 12px;
}
.af-tab {
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
.af-tab.active {
  background: var(--card);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.af-error {
  padding: 9px 12px;
  margin-bottom: 14px;
  border-radius: 10px;
  background: rgba(160, 82, 45, 0.1);
  color: #a0522d;
  font-size: 13px;
  line-height: 1.5;
}

.af-field {
  margin-bottom: 14px;
}
.af-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}
.af-input {
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
  box-sizing: border-box;
}
.af-input:focus,
.af-input:focus-visible {
  border-color: var(--primary);
  background: var(--card);
  outline: none;
}
.af-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

/* 验证码 */
.af-captcha-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
}
.af-captcha-row .af-input {
  flex: 1;
  letter-spacing: 2px;
}
.af-captcha-img {
  flex: 0 0 120px;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
  line-height: 1;
}
.af-captcha-img:hover:not(:disabled) {
  border-color: var(--primary);
}
.af-captcha-img:disabled {
  cursor: progress;
  opacity: 0.7;
}
.af-captcha-img img {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
.af-captcha-placeholder {
  font-size: 12px;
  color: var(--text-muted);
}

.af-gender-row {
  display: flex;
  gap: 8px;
}
.af-gender-btn {
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
.af-gender-btn.active {
  border-color: var(--primary);
  background: var(--success-bg);
  color: var(--primary);
  font-weight: 600;
}

.af-submit {
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
.af-submit:hover:not(:disabled) {
  background: var(--accent-dark);
}
.af-submit:active:not(:disabled) {
  transform: scale(0.98);
}
.af-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.af-foot {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}
.af-link {
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
</style>
