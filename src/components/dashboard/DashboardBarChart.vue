<script setup lang="ts">
import { computed } from 'vue'

import type { ChartBar } from '@/types/dashboard'
import { formatNumber } from '@/utils/dashboard-formatters'

const props = defineProps<{
  items: ChartBar[]
  valueSuffix?: string
}>()

const maxValue = computed(() => Math.max(...props.items.map((item) => Math.abs(item.value)), 1))

function getWidth(value: number): string {
  return `${Math.max((Math.abs(value) / maxValue.value) * 100, value === 0 ? 0 : 3)}%`
}
</script>

<template>
  <div v-if="items.length" class="bar-chart">
    <div v-for="item in items" :key="item.label" class="bar-chart__row">
      <div class="bar-chart__label">
        <span>{{ item.label }}</span>
        <strong> {{ formatNumber(item.value) }}{{ valueSuffix ?? '' }} </strong>
      </div>
      <div class="bar-chart__track">
        <div
          class="bar-chart__value"
          :style="{
            width: getWidth(item.value),
            backgroundColor: item.color ?? '#2f918c',
          }"
        />
      </div>
    </div>
  </div>

  <div v-else class="chart-empty">
    <VIcon icon="mdi-chart-bar" size="36" />
    <p>No hay movimientos para mostrar.</p>
  </div>
</template>

<style scoped>
.bar-chart {
  display: grid;
  gap: 18px;
  min-height: 230px;
  align-content: center;
}

.bar-chart__label {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 7px;
  color: #637583;
  font-size: 0.85rem;
}

.bar-chart__label strong {
  color: #0c3153;
}

.bar-chart__track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #edf2f5;
}

.bar-chart__value {
  height: 100%;
  border-radius: inherit;
  transition: width 280ms ease;
}

.chart-empty {
  min-height: 230px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 10px;
  color: #788895;
  text-align: center;
}

.chart-empty p {
  margin: 0;
}
</style>
