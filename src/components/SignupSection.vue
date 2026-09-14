<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'
import { SIGNUP_STEPS } from '../data/mock'
</script>

<template>
  <section id="signup" class="section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">匿名报名</h2>
        <p class="section-desc">不在群里也能加入球局，机器人自动同步报名信息</p>
      </div>
      <div class="steps">
        <div v-for="item in SIGNUP_STEPS" :key="item.step" class="step">
          <div class="step-icon-wrap">
            <SvgIcon :type="item.iconType" :size="24" />
            <span class="step-num">{{ item.step }}</span>
          </div>
          <h3 class="step-title">{{ item.title }}</h3>
          <p class="step-desc">{{ item.desc }}</p>
        </div>
      </div>
      <div class="signup-flow" aria-label="匿名报名信息流向">
        <span class="flow-node">PC 官网报名</span>
        <span class="flow-arrow" aria-hidden="true"></span>
        <span class="flow-node flow-node-bot">机器人 clawbot</span>
        <span class="flow-arrow" aria-hidden="true"></span>
        <span class="flow-node">微信群接龙</span>
      </div>
      <p class="signup-note">
        群外球友无需入群、无需单独联络，官网提交报名后由机器人自动同步进群接龙，隐私更省心
      </p>
    </div>
  </section>
</template>
