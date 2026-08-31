<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import { operationsService } from '@/services/operations.service'
import type { ApiRecord, ReportSection } from '@/types/operations'
import { getApiErrorMessage } from '@/utils/api-error'

interface ReportDefinition {
  key: string
  title: string
  icon: string
  path: string
  hasTop: boolean
}

const reports: ReportDefinition[] = [
  { key: 'sales', title: 'Ventas', icon: 'mdi-chart-line', path: '/reports/sales', hasTop: false },
  {
    key: 'inventory',
    title: 'Inventario',
    icon: 'mdi-warehouse',
    path: '/reports/inventory',
    hasTop: true,
  },
  { key: 'cash', title: 'Caja', icon: 'mdi-cash-register', path: '/reports/cash', hasTop: false },
  {
    key: 'customers',
    title: 'Clientes',
    icon: 'mdi-account-group-outline',
    path: '/reports/customers',
    hasTop: true,
  },
  {
    key: 'services',
    title: 'Servicios',
    icon: 'mdi-content-cut',
    path: '/reports/services',
    hasTop: true,
  },
]

function localDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

const activeReportKey = ref('sales')
const filters = reactive({
  startDate: localDate(firstDay),
  endDate: localDate(now),
  timezone: 'America/Bogota',
  topLimit: 10,
})
const payload = ref<ApiRecord | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const activeReport = computed(
  () => reports.find((report) => report.key === activeReportKey.value) ?? reports[0]!,
)

const sections = computed<ReportSection[]>(() => {
  if (!payload.value) return []
  return Object.entries(payload.value)
    .filter(([key]) => key !== 'metadata')
    .map(([key, value]) => ({
      key,
      title: key.replace(/_/g, ' '),
      value,
    }))
})

const reportLabels: Record<string, string> = {
  totals: 'Resumen',
  total_sales: 'Ventas totales',
  net_revenue: 'Ingresos netos',
  completed_sales_count: 'Ventas completadas',
  cancelled_sales_count: 'Ventas canceladas',
  cancelled_amount: 'Valor cancelado',
  gross_subtotal: 'Subtotal bruto',
  discount_amount: 'Descuentos',
  tax_amount: 'Impuestos',
  net_sales: 'Ventas netas',
  average_ticket: 'Ticket promedio',
  products_quantity: 'Cantidad de productos',
  services_quantity: 'Cantidad de servicios',
  payment_methods: 'Métodos de pago',
  daily: 'Detalle diario',
  date: 'Fecha',
  sales_count: 'Cantidad de ventas',
  payment_method: 'Método de pago',
  payments_count: 'Cantidad de pagos',
  amount: 'Valor',
  total_products: 'Total de productos',
  active_products: 'Productos activos',
  inactive_products: 'Productos inactivos',
  out_of_stock_products: 'Productos agotados',
  low_stock_products: 'Productos con bajo inventario',
  total_stock_units: 'Unidades en inventario',
  inventory_cost_value: 'Valor del inventario al costo',
  inventory_sale_value: 'Valor comercial del inventario',
  movements_count: 'Cantidad de movimientos',
  movements: 'Movimientos',
  movement_type: 'Tipo de movimiento',
  quantity: 'Cantidad',
  low_stock_items: 'Productos que requieren atención',
  product_id: 'UUID del producto',
  code: 'Código',
  name: 'Nombre',
  current_stock: 'Existencia actual',
  minimum_stock: 'Existencia mínima',
  shortage_quantity: 'Cantidad faltante',
  transactions_count: 'Cantidad de transacciones',
  total_income: 'Ingresos totales',
  total_expense: 'Egresos totales',
  net_cash_flow: 'Flujo neto de caja',
  sessions_opened: 'Sesiones abiertas',
  sessions_closed: 'Sesiones cerradas',
  opening_amount: 'Monto de apertura',
  closing_difference: 'Diferencia de cierre',
  sources: 'Movimientos por origen',
  source: 'Origen',
  income: 'Ingresos',
  expense: 'Egresos',
  net_amount: 'Valor neto',
  registers: 'Cajas',
  cash_register_id: 'UUID de la caja',
  total_customers: 'Total de clientes',
  active_customers: 'Clientes activos',
  inactive_customers: 'Clientes inactivos',
  new_customers: 'Clientes nuevos',
  customers_with_purchases: 'Clientes con compras',
  returning_customers: 'Clientes recurrentes',
  sales_without_customer: 'Ventas sin cliente',
  top_customers: 'Clientes destacados',
  customer_id: 'UUID del cliente',
  customer_name: 'Cliente',
  purchases_count: 'Cantidad de compras',
  total_spent: 'Total gastado',
  total_services: 'Total de servicios',
  active_services: 'Servicios activos',
  inactive_services: 'Servicios inactivos',
  services_sold: 'Servicios vendidos',
  services_without_sales: 'Servicios sin ventas',
  service_sales_count: 'Ventas de servicios',
  service_quantity: 'Cantidad de servicios vendidos',
  service_revenue: 'Ingresos por servicios',
  top_services: 'Servicios destacados',
  service_id: 'UUID del servicio',
  service_name: 'Servicio',
  revenue: 'Ingresos',
  average_unit_price: 'Precio unitario promedio',
}

function label(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_')
  const translated = reportLabels[normalized]

  if (translated) return translated

  const fallback = value.replace(/_/g, ' ')
  return fallback.charAt(0).toUpperCase() + fallback.slice(1)
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Sin dato'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'

  const numeric = Number(value)
  if (
    Number.isFinite(numeric) &&
    /(amount|total|revenue|income|expense|flow|value|price|cost|sales)/i.test(key)
  ) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(numeric)
  }

  return String(value)
}

function objectEntries(value: unknown): [string, unknown][] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return []
  return Object.entries(value as ApiRecord)
}

function arrayRows(value: unknown): ApiRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is ApiRecord =>
          typeof item === 'object' && item !== null && !Array.isArray(item),
      )
    : []
}

function arrayColumns(value: unknown): string[] {
  const rows = arrayRows(value)
  return [...new Set(rows.flatMap((row) => Object.keys(row)))].slice(0, 8)
}

async function loadReport(): Promise<void> {
  if (filters.startDate > filters.endDate) {
    errorMessage.value = 'La fecha inicial no puede ser posterior a la fecha final.'
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    payload.value = await operationsService.report(activeReport.value.path, {
      start_date: filters.startDate,
      end_date: filters.endDate,
      timezone: filters.timezone,
      ...(activeReport.value.hasTop ? { top_limit: filters.topLimit } : {}),
    })
  } catch (error: unknown) {
    payload.value = null
    errorMessage.value = getApiErrorMessage(error, 'No fue posible generar el reporte')
  } finally {
    isLoading.value = false
  }
}

function csvEscape(value: unknown): string {
  const text =
    typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function exportCsv(): void {
  if (!payload.value) return

  const rows: string[][] = [['seccion', 'campo', 'valor']]
  for (const [section, value] of Object.entries(payload.value)) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => rows.push([section, String(index + 1), JSON.stringify(item)]))
    } else if (typeof value === 'object' && value !== null) {
      Object.entries(value as ApiRecord).forEach(([key, item]) =>
        rows.push([section, key, JSON.stringify(item)]),
      )
    } else {
      rows.push(['resumen', section, String(value ?? '')])
    }
  }

  const csv = `\uFEFF${rows.map((row) => row.map(csvEscape).join(';')).join('\n')}`
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `reporte-${activeReport.value.key}-${filters.startDate}-${filters.endDate}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

onMounted(() => void loadReport())
</script>

<template>
  <VContainer fluid class="reports-page pa-4 pa-md-7">
    <header class="reports-header">
      <div>
        <p>ANÁLISIS OPERACIONAL</p>
        <h1>Reportes</h1>
        <span>Ventas, inventario, caja, clientes y servicios con filtros empresariales.</span>
      </div>
      <VAvatar color="secondary" variant="tonal" size="56"
        ><VIcon icon="mdi-chart-box-outline" size="30"
      /></VAvatar>
    </header>

    <VAlert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="errorMessage = null"
    >
      {{ errorMessage }}
    </VAlert>

    <VCard rounded="xl" border elevation="0" class="mb-5">
      <VTabs v-model="activeReportKey" color="secondary" @update:model-value="loadReport">
        <VTab v-for="report in reports" :key="report.key" :value="report.key">
          <VIcon :icon="report.icon" start />{{ report.title }}
        </VTab>
      </VTabs>
      <VDivider />
      <VCardText>
        <VRow align="center">
          <VCol cols="12" sm="6" md="3"
            ><VTextField v-model="filters.startDate" label="Fecha inicial" type="date"
          /></VCol>
          <VCol cols="12" sm="6" md="3"
            ><VTextField v-model="filters.endDate" label="Fecha final" type="date"
          /></VCol>
          <VCol cols="12" sm="6" md="3"
            ><VTextField v-model="filters.timezone" label="Zona horaria"
          /></VCol>
          <VCol v-if="activeReport.hasTop" cols="12" sm="6" md="2"
            ><VTextField
              v-model.number="filters.topLimit"
              label="Top"
              type="number"
              min="1"
              max="50"
          /></VCol>
          <VCol cols="12" md="auto" class="filters-actions">
            <VBtn
              color="secondary"
              prepend-icon="mdi-filter-check"
              :loading="isLoading"
              @click="loadReport"
              >Generar</VBtn
            >
            <VBtn
              variant="tonal"
              prepend-icon="mdi-file-delimited-outline"
              :disabled="!payload"
              @click="exportCsv"
              >CSV</VBtn
            >
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VProgressLinear v-if="isLoading" indeterminate color="secondary" class="mb-4" />

    <div v-if="payload" class="report-grid">
      <VCard v-for="section in sections" :key="section.key" rounded="xl" border elevation="0">
        <VCardTitle>{{ label(section.title) }}</VCardTitle>
        <VCardText>
          <VTable v-if="Array.isArray(section.value)" density="compact">
            <thead>
              <tr>
                <th v-for="column in arrayColumns(section.value)" :key="column">
                  {{ label(column) }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in arrayRows(section.value)" :key="index">
                <td v-for="column in arrayColumns(section.value)" :key="column">
                  {{ formatValue(column, row[column]) }}
                </td>
              </tr>
            </tbody>
          </VTable>
          <dl v-else-if="objectEntries(section.value).length" class="metric-list">
            <template v-for="[key, value] in objectEntries(section.value)" :key="key">
              <dt>{{ label(key) }}</dt>
              <dd>{{ formatValue(key, value) }}</dd>
            </template>
          </dl>
          <strong v-else class="single-value">{{ formatValue(section.key, section.value) }}</strong>
        </VCardText>
      </VCard>
    </div>
  </VContainer>
</template>

<style scoped>
.reports-page {
  max-width: 1600px;
}
.reports-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.reports-header p {
  margin: 0;
  color: #1f7a75;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.reports-header h1 {
  margin: 4px 0;
  color: #17324d;
  font-size: clamp(2rem, 4vw, 3rem);
}
.reports-header span {
  color: #637381;
}
.filters-actions {
  display: flex;
  gap: 8px;
}
.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr));
  gap: 18px;
}
.metric-list {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) 1fr;
  margin: 0;
}
.metric-list dt,
.metric-list dd {
  margin: 0;
  padding: 9px 10px;
  border-bottom: 1px solid #e3e8eb;
}
.metric-list dt {
  color: #637381;
}
.metric-list dd {
  color: #17324d;
  font-weight: 700;
  text-align: right;
}
.single-value {
  color: #17324d;
  font-size: 1.5rem;
}
@media (max-width: 700px) {
  .filters-actions {
    flex-direction: column;
  }
}
</style>
