<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'
import { FEATURES } from '../data/mock'
</script>

<template>
  <section id="features" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">核心功能亮点</h2>
        <p class="section-desc">从约球到战绩，一套全搞定</p>
      </div>
      <div class="features-grid">
        <div v-for="item in FEATURES" :key="item.title" class="feature-card">
          <div class="feature-icon">
            <SvgIcon :type="item.iconType" :size="28" />
          </div>
          <h3 class="feature-title">{{ item.title }}</h3>
          <p class="feature-desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
