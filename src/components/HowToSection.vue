<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'
import { HOW_TO_STEPS } from '../data/mock'
</script>

<template>
  <section id="howto" class="section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">如何加入</h2>
        <p class="section-desc">三步开启你的校园羽毛球之旅</p>
      </div>
      <div class="steps">
        <div v-for="item in HOW_TO_STEPS" :key="item.step" class="step">
          <div class="step-icon-wrap">
            <SvgIcon :type="item.iconType" :size="24" />
            <span class="step-num">{{ item.step }}</span>
          </div>
          <h3 class="step-title">{{ item.title }}</h3>
          <p class="step-desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
