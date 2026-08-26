import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { dashboardService } from '@/services/dashboard.service'
import type { DashboardFilters, DashboardQuery, DashboardResponse } from '@/types/dashboard'
import { getApiErrorMessage } from '@/utils/api-error'

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function createDefaultFilters(): DashboardFilters {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

  return {
    startDate: toIsoDate(firstDay),
    endDate: toIsoDate(today),
    timezone: 'America/Bogota',
    topLimit: 5,
  }
}

export const useDashboardStore = defineStore('dashboard', () => {
  const dashboard = ref<DashboardResponse | null>(null)
  const filters = ref<DashboardFilters>(createDefaultFilters())
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  const hasDashboard = computed(() => dashboard.value !== null)

  function setFilters(nextFilters: DashboardFilters): void {
    filters.value = { ...nextFilters }
  }

  function buildQuery(): DashboardQuery {
    return {
      start_date: filters.value.startDate,
      end_date: filters.value.endDate,
      timezone: filters.value.timezone,
      top_limit: filters.value.topLimit,
    }
  }

  function validateFilters(): string | null {
    if (!filters.value.startDate || !filters.value.endDate) {
      return 'Selecciona las fechas inicial y final'
    }

    if (filters.value.startDate > filters.value.endDate) {
      return 'La fecha inicial no puede ser posterior a la fecha final'
    }

    if (filters.value.topLimit < 1 || filters.value.topLimit > 50) {
      return 'La cantidad de destacados debe estar entre 1 y 50'
    }

    return null
  }

  async function loadDashboard(): Promise<void> {
    const validationMessage = validateFilters()

    if (validationMessage) {
      errorMessage.value = validationMessage
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      dashboard.value = await dashboardService.getDashboard(buildQuery())
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, 'No fue posible cargar el dashboard')
    } finally {
      isLoading.value = false
    }
  }

  function reset(): void {
    dashboard.value = null
    filters.value = createDefaultFilters()
    errorMessage.value = null
    isLoading.value = false
  }

  return {
    dashboard,
    filters,
    isLoading,
    errorMessage,
    hasDashboard,
    setFilters,
    loadDashboard,
    reset,
  }
})
