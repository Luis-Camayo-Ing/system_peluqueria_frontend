import { http } from '@/services/http'
import {
  dashboardResponseSchema,
  type DashboardQuery,
  type DashboardResponse,
} from '@/types/dashboard'

export const dashboardService = {
  async getDashboard(query: DashboardQuery): Promise<DashboardResponse> {
    const response = await http.get<unknown>('/dashboard', {
      params: query,
    })

    return dashboardResponseSchema.parse(response.data)
  },
}
