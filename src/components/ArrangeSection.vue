<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'
import { ARRANGE_SCHEMES } from '../data/mock'
</script>

<template>
  <section id="arrange" class="section section-alt">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">自动编排</h2>
        <p class="section-desc">引擎按报名人员构成自动过滤，选出唯一适用的编排方案</p>
      </div>

      <div class="arrange-table-wrap">
        <table class="arrange-table" aria-label="自动编排方案列表">
          <thead>
            <tr>
              <th class="col-scheme" scope="col">方案</th>
              <th scope="col">局型构成</th>
              <th class="col-condition" scope="col">适用条件（自动过滤依据）</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="scheme in ARRANGE_SCHEMES" :key="scheme.id">
              <td class="col-scheme">
                <span class="scheme-id">{{ scheme.id }}</span>
                <strong>{{ scheme.name }}</strong>
              </td>
              <td class="col-comp">{{ scheme.comp }}</td>
              <td class="col-condition">{{ scheme.condition }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="arrange-highlights">
        <div class="arrange-highlight">
          <SvgIcon type="shuffle" :size="18" />
          <span>按男女比例自动过滤，无需人工挑边分组</span>
        </div>
        <div class="arrange-highlight">
          <SvgIcon type="user-plus" :size="18" />
          <span>报名满 4 人即可成局，人数构成决定局型</span>
        </div>
      </div>
    </div>
  </section>
</template>
