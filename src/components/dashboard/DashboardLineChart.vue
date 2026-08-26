<script setup lang="ts">
import { computed } from 'vue'

import type { ChartPoint } from '@/types/dashboard'
import { formatCurrency } from '@/utils/dashboard-formatters'

const props = defineProps<{
  points: ChartPoint[]
  color?: string
}>()

const width = 680
const height = 230
const padding = 28

const maxValue = computed(() => {
  const values = props.points.map((point) => Math.max(0, point.value))

  return Math.max(...values, 1)
})

const coordinates = computed(() =>
  props.points.map((point, index) => {
    const usableWidth = width - padding * 2
    const usableHeight = height - padding * 2
    const divisor = Math.max(props.points.length - 1, 1)
    const x = padding + (index / divisor) * usableWidth
    const y = height - padding - (Math.max(0, point.value) / maxValue.value) * usableHeight

    return { ...point, x, y }
  }),
)

const linePath = computed(() =>
  coordinates.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' '),
)

const areaPath = computed(() => {
  if (coordinates.value.length === 0) return ''

  const firstPoint = coordinates.value[0]
  const lastPoint = coordinates.value[coordinates.value.length - 1]

  if (!firstPoint || !lastPoint) return ''

  return `${linePath.value} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`
})
</script>

<template>
  <div v-if="points.length" class="line-chart">
    <svg :viewBox="`0 0 ${width} ${height}`" role="img" aria-label="Tendencia de ventas diarias">
      <line
        v-for="line in 4"
        :key="line"
        :x1="padding"
        :x2="width - padding"
        :y1="padding + ((line - 1) * (height - padding * 2)) / 3"
        :y2="padding + ((line - 1) * (height - padding * 2)) / 3"
        class="line-chart__grid"
      />
      <path :d="areaPath" :fill="color ?? '#2f918c'" fill-opacity="0.11" />
      <path :d="linePath" :stroke="color ?? '#2f918c'" class="line-chart__line" />
      <circle
        v-for="point in coordinates"
        :key="`${point.label}-${point.x}`"
        :cx="point.x"
        :cy="point.y"
        r="4"
        :fill="color ?? '#2f918c'"
      >
        <title>{{ point.label }}: {{ formatCurrency(point.value) }}</title>
      </circle>
    </svg>

    <div class="line-chart__labels">
      <span>{{ points[0]?.label }}</span>
      <strong>{{ formatCurrency(maxValue) }}</strong>
      <span>{{ points[points.length - 1]?.label }}</span>
    </div>
  </div>

  <div v-else class="chart-empty">
    <VIcon icon="mdi-chart-line-variant" size="36" />
    <p>No hay ventas completadas en el período.</p>
  </div>
</template>

<style scoped>
.line-chart svg {
  display: block;
  width: 100%;
  min-height: 220px;
}

.line-chart__grid {
  stroke: #e8eef2;
  stroke-width: 1;
}

.line-chart__line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}

.line-chart__labels {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #71808d;
  font-size: 0.78rem;
}

.line-chart__labels strong {
  color: #0c3153;
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
