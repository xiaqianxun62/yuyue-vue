<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  INITIAL_MESSAGES,
  AUTO_REPLIES,
  generateNickname,
  type ChatMessage,
} from '../data/mock'
import { AVATAR_COLORS, randomInt, randomItem, uid } from '../utils/random'

const messages = ref<ChatMessage[]>([...INITIAL_MESSAGES])
const inputValue = ref('')
const myNickname = ref(generateNickname())
const chatMessagesRef = ref<HTMLDivElement | null>(null)

let failTriggered = false
let randomChatTimer: number | null = null

// 计算属性
function avatarBg(colorIndex: number, isSelf: boolean) {
  return isSelf ? '#14665B' : AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]
}

// 计算属性
function avatarInitial(nickname: string, isSelf: boolean) {
  return isSelf ? '我' : nickname.charAt(0)
}

function scrollToBottom() {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

watch(
  () => messages.value.length,
  () => scrollToBottom()
)

function addMessage(msg: ChatMessage) {
  messages.value.push(msg)
}

function randomReplyUser() {
  return {
    nickname: generateNickname(),
    colorIndex: randomInt(1, AVATAR_COLORS.length - 1),
  }
}

function sendMessage(forceSuccess: boolean = false) {
  const text = inputValue.value.trim()
  if (!text) return

  const msgId = 'msg-' + uid()
  const willFail = !forceSuccess && !failTriggered && Math.random() < 0.08
  if (willFail) failTriggered = true

  addMessage({
    id: msgId,
    nickname: myNickname.value,
    content: text,
    isSelf: true,
    colorIndex: 0,
    failed: willFail,
  })
  inputValue.value = ''

  if (willFail) return

  const delay = randomInt(1000, 3000)
  setTimeout(() => {
    const user = randomReplyUser()
    addMessage({
      id: 'reply-' + uid(),
      nickname: user.nickname,
      content: randomItem(AUTO_REPLIES),
      isSelf: false,
      colorIndex: user.colorIndex,
    })
  }, delay)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage(false)
  }
}

function retryMessage(msgId: string) {
  const idx = messages.value.findIndex((m) => m.id === msgId)
  if (idx < 0) return
  const text = messages.value[idx].content
  messages.value.splice(idx, 1)

  failTriggered = true
  const newId = 'msg-' + uid()
  addMessage({
    id: newId,
    nickname: myNickname.value,
    content: text,
    isSelf: true,
    colorIndex: 0,
    failed: false,
  })

  const delay = randomInt(1000, 3000)
  setTimeout(() => {
    const user = randomReplyUser()
    addMessage({
      id: 'reply-' + uid(),
      nickname: user.nickname,
      content: randomItem(AUTO_REPLIES),
      isSelf: false,
      colorIndex: user.colorIndex,
    })
  }, delay)
}

function scheduleRandomChat() {
  const delay = randomInt(8000, 15000)
  randomChatTimer = window.setTimeout(() => {
    const user = randomReplyUser()
    addMessage({
      id: 'auto-' + uid(),
      nickname: user.nickname,
      content: randomItem(AUTO_REPLIES),
      isSelf: false,
      colorIndex: user.colorIndex,
    })
    scheduleRandomChat()
  }, delay)
}

onMounted(() => {
  scrollToBottom()
  scheduleRandomChat()
})

onBeforeUnmount(() => {
  if (randomChatTimer) clearTimeout(randomChatTimer)
})
</script>

<template>
  <section id="chatroom" class="section">
    <div class="container">
      <div class="wall-header">
        <div class="wall-title-row">
          <h2 class="wall-title">临时实时聊天室</h2>
          <span class="chat-badge">临时会话 · 不保存</span>
        </div>
        <div class="chat-nickname">
          你的匿名身份：<strong>{{ myNickname }}</strong>
        </div>
      </div>
      <div class="chat-window">
        <div class="chat-messages" ref="chatMessagesRef" aria-live="polite">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="chat-msg"
            :class="{ self: msg.isSelf, 'msg-failed': msg.failed }"
          >
            <!-- 头像：非自己在左 -->
            <div
              v-if="!msg.isSelf"
              class="msg-avatar"
              :style="{ background: avatarBg(msg.colorIndex, msg.isSelf) }"
            >
              {{ avatarInitial(msg.nickname, msg.isSelf) }}
            </div>

            <div class="msg-body">
              <span class="msg-name">{{ msg.nickname }}</span>
              <div class="msg-bubble">{{ msg.content }}</div>
              <div v-if="msg.failed" class="msg-failed-row">
                <span>发送失败</span>
                <button class="msg-retry-btn" type="button" @click="retryMessage(msg.id)">
                  重试
                </button>
              </div>
            </div>

            <!-- 头像：自己在右 -->
            <div
              v-if="msg.isSelf"
              class="msg-avatar"
              :style="{ background: avatarBg(msg.colorIndex, msg.isSelf) }"
            >
              {{ avatarInitial(msg.nickname, msg.isSelf) }}
            </div>
          </div>
        </div>
        <div class="chat-input-wrap">
          <form class="chat-input-row" @submit.prevent="sendMessage(false)">
            <input
              v-model="inputValue"
              type="text"
              class="chat-input"
              placeholder="说点什么..."
              maxlength="200"
              @keydown="handleKeydown"
              aria-label="聊天输入"
            />
            <button class="send-btn" type="submit">发送</button>
          </form>
        </div>
      </div>
      <p class="chat-footer-note">消息仅本次会话展示，关闭后不保留任何记录</p>
    </div>
  </section>
</template>
