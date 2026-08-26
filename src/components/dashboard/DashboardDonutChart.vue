<script setup lang="ts">
import { computed } from 'vue'

import type { ChartBar } from '@/types/dashboard'
import { formatInteger } from '@/utils/dashboard-formatters'

const props = defineProps<{
  items: ChartBar[]
}>()

const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0))

const donutStyle = computed(() => {
  if (total.value <= 0) {
    return { background: '#e8eef2' }
  }

  let accumulatedPercentage = 0
  const segments = props.items
    .filter((item) => item.value > 0)
    .map((item) => {
      const start = accumulatedPercentage
      accumulatedPercentage += (item.value / total.value) * 100

      return `${item.color ?? '#2f918c'} ${start}% ${accumulatedPercentage}%`
    })

  return { background: `conic-gradient(${segments.join(', ')})` }
})
</script>

<template>
  <div class="donut-chart">
    <div class="donut-chart__graphic" :style="donutStyle">
      <div class="donut-chart__center">
        <strong>{{ formatInteger(total) }}</strong>
        <span>Citas</span>
      </div>
    </div>

    <div class="donut-chart__legend">
      <div v-for="item in items" :key="item.label" class="legend-item">
        <span class="legend-item__color" :style="{ backgroundColor: item.color ?? '#2f918c' }" />
        <span>{{ item.label }}</span>
        <strong>{{ formatInteger(item.value) }}</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.donut-chart {
  min-height: 230px;
  display: grid;
  grid-template-columns: minmax(145px, 190px) 1fr;
  align-items: center;
  gap: 28px;
}

.donut-chart__graphic {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.donut-chart__center {
  width: 62%;
  aspect-ratio: 1;
  display: grid;
  place-content: center;
  border-radius: 50%;
  background: white;
  text-align: center;
}

.donut-chart__center strong {
  color: #0c3153;
  font-size: 1.65rem;
}

.donut-chart__center span {
  color: #71808d;
  font-size: 0.75rem;
}

.donut-chart__legend {
  display: grid;
  gap: 10px;
}

.legend-item {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 9px;
  color: #5f7180;
  font-size: 0.8rem;
}

.legend-item__color {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.legend-item strong {
  color: #0c3153;
}

@media (max-width: 560px) {
  .donut-chart {
    grid-template-columns: 1fr;
  }

  .donut-chart__graphic {
    width: 170px;
    margin: 0 auto;
  }
}
</style>
