<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import DashboardBarChart from '@/components/dashboard/DashboardBarChart.vue'
import DashboardDonutChart from '@/components/dashboard/DashboardDonutChart.vue'
import DashboardFilters from '@/components/dashboard/DashboardFilters.vue'
import DashboardHighlights from '@/components/dashboard/DashboardHighlights.vue'
import DashboardLineChart from '@/components/dashboard/DashboardLineChart.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import { useDashboardStore } from '@/stores/dashboard'
import type { ChartBar, ChartPoint, DashboardKpis } from '@/types/dashboard'
import {
  decimalToNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatInteger,
  formatNumber,
  formatPercentage,
  getAppointmentStatusLabel,
  getMovementLabel,
} from '@/utils/dashboard-formatters'

const dashboardStore = useDashboardStore()
const { dashboard, filters, isLoading, errorMessage } = storeToRefs(dashboardStore)

const appointmentColors = {
  scheduled: '#78909c',
  confirmed: '#2196f3',
  in_progress: '#ffb300',
  completed: '#43a047',
  cancelled: '#e53935',
  no_show: '#8e24aa',
} as const

interface KpiDefinition {
  title: string
  value: string
  subtitle: string
  icon: string
  color: string
}

function buildKpiCards(kpis: DashboardKpis): KpiDefinition[] {
  return [
    {
      title: 'Ventas netas',
      value: formatCurrency(kpis.net_sales),
      subtitle: `${formatInteger(kpis.completed_sales_count)} ventas completadas`,
      icon: 'mdi-cash-multiple',
      color: 'primary',
    },
    {
      title: 'Flujo neto de caja',
      value: formatCurrency(kpis.net_cash_flow),
      subtitle: `${formatCurrency(kpis.total_income)} en ingresos`,
      icon: 'mdi-cash-register',
      color: 'secondary',
    },
    {
      title: 'Ticket promedio',
      value: formatCurrency(kpis.average_ticket),
      subtitle: `${formatPercentage(kpis.sales_cancellation_rate)} de cancelación`,
      icon: 'mdi-receipt-text-outline',
      color: 'info',
    },
    {
      title: 'Citas',
      value: formatInteger(kpis.appointments_count),
      subtitle: `${formatPercentage(kpis.appointment_completion_rate)} completadas`,
      icon: 'mdi-calendar-check-outline',
      color: 'success',
    },
    {
      title: 'Clientes activos',
      value: formatInteger(kpis.active_customers),
      subtitle: `${formatInteger(kpis.new_customers)} nuevos en el período`,
      icon: 'mdi-account-group-outline',
      color: 'primary',
    },
    {
      title: 'Servicios vendidos',
      value: formatInteger(kpis.services_sold),
      subtitle: `${formatCurrency(kpis.service_revenue)} facturados`,
      icon: 'mdi-content-cut',
      color: 'secondary',
    },
    {
      title: 'Unidades en inventario',
      value: formatNumber(kpis.total_stock_units),
      subtitle: `${formatInteger(kpis.out_of_stock_products)} productos agotados`,
      icon: 'mdi-package-variant',
      color: 'info',
    },
    {
      title: 'Stock bajo',
      value: formatInteger(kpis.low_stock_products),
      subtitle: 'Productos que requieren atención',
      icon: 'mdi-alert-outline',
      color: kpis.low_stock_products > 0 ? 'warning' : 'success',
    },
  ]
}

const kpiCards = computed(() => (dashboard.value ? buildKpiCards(dashboard.value.kpis) : []))

const dailySalesPoints = computed<ChartPoint[]>(() =>
  (dashboard.value?.charts.daily_sales ?? []).map((metric) => ({
    label: formatDate(metric.date),
    value: decimalToNumber(metric.net_sales),
  })),
)

const cashFlowBars = computed<ChartBar[]>(() =>
  (dashboard.value?.charts.daily_cash_flow ?? []).map((metric) => ({
    label: formatDate(metric.date),
    value: decimalToNumber(metric.net_amount),
    color: decimalToNumber(metric.net_amount) >= 0 ? '#1f7a75' : '#d84a4a',
  })),
)

const appointmentStatusItems = computed<ChartBar[]>(() =>
  (dashboard.value?.charts.appointments_by_status ?? []).map((metric) => ({
    label: getAppointmentStatusLabel(metric.status),
    value: metric.appointments_count,
    color: appointmentColors[metric.status],
  })),
)

const inventoryMovementBars = computed<ChartBar[]>(() =>
  (dashboard.value?.charts.inventory_movements ?? []).map((metric) => ({
    label: getMovementLabel(metric.movement_type),
    value: decimalToNumber(metric.quantity),
    color: metric.movement_type.includes('exit') ? '#e67e45' : '#1f7a75',
  })),
)

onMounted(() => dashboardStore.loadDashboard())
</script>

<template>
  <VContainer fluid class="dashboard pa-4 pa-md-8" data-testid="dashboard-view">
    <header class="dashboard__header">
      <div>
        <p class="dashboard__eyebrow">Inteligencia operacional</p>
        <h1>Panel de control</h1>
        <p>Consulta el desempeño comercial, financiero y operativo de la peluquería.</p>
      </div>

      <VChip
        v-if="dashboard"
        color="success"
        variant="tonal"
        prepend-icon="mdi-database-check-outline"
      >
        Datos actualizados
      </VChip>
    </header>

    <DashboardFilters
      v-model="filters"
      :loading="isLoading"
      class="mb-6"
      @submit="dashboardStore.loadDashboard"
    />

    <VProgressLinear v-if="isLoading" color="secondary" indeterminate rounded class="mb-4" />

    <VAlert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      closable
      class="mb-6"
      title="No pudimos actualizar el dashboard"
      @click:close="dashboardStore.errorMessage = null"
    >
      <div class="alert-content">
        <span>{{ errorMessage }}</span>
        <VBtn variant="text" color="error" size="small" @click="dashboardStore.loadDashboard">
          Reintentar
        </VBtn>
      </div>
    </VAlert>

    <template v-if="dashboard">
      <div class="period-summary mb-5">
        <div>
          <VIcon icon="mdi-calendar-range" color="secondary" />
          <span>
            {{ formatDate(dashboard.metadata.start_date) }} –
            {{ formatDate(dashboard.metadata.end_date) }}
          </span>
        </div>
        <small>
          Generado {{ formatDateTime(dashboard.metadata.generated_at) }} ·
          {{ dashboard.metadata.timezone }}
        </small>
      </div>

      <VRow class="mb-2" data-testid="dashboard-kpis">
        <VCol v-for="card in kpiCards" :key="card.title" cols="12" sm="6" lg="3">
          <KpiCard v-bind="card" />
        </VCol>
      </VRow>

      <div class="section-heading">
        <div>
          <p class="dashboard__eyebrow">Comportamiento</p>
          <h2>Indicadores visuales</h2>
        </div>
      </div>

      <VRow data-testid="dashboard-charts">
        <VCol cols="12" xl="6">
          <VCard class="chart-card" elevation="0">
            <VCardTitle>
              <VIcon icon="mdi-chart-line" color="secondary" />
              Ventas diarias
            </VCardTitle>
            <VCardSubtitle>Ingresos netos de ventas completadas</VCardSubtitle>
            <VCardText>
              <DashboardLineChart :points="dailySalesPoints" />
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" xl="6">
          <VCard class="chart-card" elevation="0">
            <VCardTitle>
              <VIcon icon="mdi-finance" color="secondary" />
              Flujo de caja diario
            </VCardTitle>
            <VCardSubtitle>Balance neto de ingresos y egresos</VCardSubtitle>
            <VCardText>
              <DashboardBarChart :items="cashFlowBars" />
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" xl="6">
          <VCard class="chart-card" elevation="0">
            <VCardTitle>
              <VIcon icon="mdi-calendar-multiselect" color="secondary" />
              Estado de las citas
            </VCardTitle>
            <VCardSubtitle>Distribución del ciclo de atención</VCardSubtitle>
            <VCardText>
              <DashboardDonutChart :items="appointmentStatusItems" />
            </VCardText>
          </VCard>
        </VCol>

        <VCol cols="12" xl="6">
          <VCard class="chart-card" elevation="0">
            <VCardTitle>
              <VIcon icon="mdi-swap-horizontal-bold" color="secondary" />
              Movimientos de inventario
            </VCardTitle>
            <VCardSubtitle>Unidades movilizadas durante el período</VCardSubtitle>
            <VCardText>
              <DashboardBarChart :items="inventoryMovementBars" value-suffix=" uds." />
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <div class="section-heading mt-7">
        <div>
          <p class="dashboard__eyebrow">Clasificación</p>
          <h2>Destacados del período</h2>
        </div>
        <VChip color="primary" variant="tonal" size="small"> Top {{ dashboard.top_limit }} </VChip>
      </div>

      <DashboardHighlights
        :products="dashboard.highlights.products"
        :services="dashboard.highlights.services"
        :customers="dashboard.highlights.customers"
        data-testid="dashboard-highlights"
      />
    </template>

    <VRow v-else-if="isLoading">
      <VCol v-for="index in 8" :key="index" cols="12" sm="6" lg="3">
        <VSkeletonLoader type="card" />
      </VCol>
    </VRow>

    <VCard v-else-if="!errorMessage" class="empty-dashboard" elevation="0">
      <VIcon icon="mdi-view-dashboard-outline" size="52" color="secondary" />
      <h2>Aún no hay información cargada</h2>
      <p>Selecciona un período y actualiza el dashboard.</p>
    </VCard>
  </VContainer>
</template>

<style scoped>
.dashboard {
  min-height: 100%;
  background: #f4f7f9;
}

.dashboard__header,
.section-heading,
.period-summary,
.alert-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.dashboard__header {
  margin-bottom: 24px;
}

.dashboard__header h1,
.section-heading h2,
.empty-dashboard h2 {
  margin: 0;
  color: #0c3153;
}

.dashboard__header h1 {
  font-size: clamp(2rem, 4vw, 2.8rem);
}

.dashboard__header p:not(.dashboard__eyebrow) {
  margin: 8px 0 0;
  color: #647684;
}

.dashboard__eyebrow {
  margin: 0 0 8px;
  color: #238d89;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.period-summary {
  color: #5f7180;
}

.period-summary div {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 650;
}

.period-summary small {
  text-align: right;
}

.section-heading {
  margin: 24px 0 14px;
}

.section-heading h2 {
  font-size: 1.35rem;
}

.chart-card {
  height: 100%;
  border: 1px solid #dde5ea;
  border-radius: 18px;
}

.chart-card :deep(.v-card-title) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 4px;
  color: #0c3153;
  font-size: 1rem;
  font-weight: 750;
}

.chart-card :deep(.v-card-subtitle) {
  padding: 0 20px;
}

.chart-card :deep(.v-card-text) {
  padding: 14px 20px 20px;
}

.empty-dashboard {
  min-height: 330px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 12px;
  border: 1px dashed #bdcbd3;
  border-radius: 18px;
  background: white;
  text-align: center;
}

.empty-dashboard p {
  margin: 0;
  color: #637381;
}

@media (max-width: 700px) {
  .dashboard__header,
  .period-summary,
  .alert-content {
    align-items: flex-start;
    flex-direction: column;
  }

  .period-summary small {
    text-align: left;
  }
}
</style>
