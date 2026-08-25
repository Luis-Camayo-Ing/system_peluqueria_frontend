import { z } from 'zod'

const decimalSchema = z.string().regex(/^-?\d+(?:\.\d+)?$/, 'El valor debe ser un decimal válido')

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const reportMetadataSchema = z.object({
  company_id: z.string().uuid(),
  start_date: dateSchema,
  end_date: dateSchema,
  timezone: z.string().min(1),
  generated_at: z.string().datetime({ offset: true }),
})

export const salesDailyMetricSchema = z.object({
  date: dateSchema,
  sales_count: z.number().int().nonnegative(),
  net_sales: decimalSchema,
})

export const inventoryMovementMetricSchema = z.object({
  movement_type: z.string().min(1),
  movements_count: z.number().int().nonnegative(),
  quantity: decimalSchema,
})

export const topCustomerMetricSchema = z.object({
  customer_id: z.string().uuid(),
  customer_name: z.string().min(1),
  purchases_count: z.number().int().nonnegative(),
  total_spent: decimalSchema,
  average_ticket: decimalSchema,
})

export const topServiceMetricSchema = z.object({
  service_id: z.string().uuid(),
  service_name: z.string().min(1),
  sales_count: z.number().int().nonnegative(),
  quantity: decimalSchema,
  revenue: decimalSchema,
  average_unit_price: decimalSchema,
})

export const dashboardKpisSchema = z.object({
  completed_sales_count: z.number().int().nonnegative(),
  cancelled_sales_count: z.number().int().nonnegative(),
  sales_cancellation_rate: decimalSchema,
  net_sales: decimalSchema,
  average_ticket: decimalSchema,
  total_income: decimalSchema,
  total_expense: decimalSchema,
  net_cash_flow: decimalSchema,
  total_stock_units: decimalSchema,
  low_stock_products: z.number().int().nonnegative(),
  out_of_stock_products: z.number().int().nonnegative(),
  active_customers: z.number().int().nonnegative(),
  new_customers: z.number().int().nonnegative(),
  services_sold: z.number().int().nonnegative(),
  service_revenue: decimalSchema,
  appointments_count: z.number().int().nonnegative(),
  completed_appointments: z.number().int().nonnegative(),
  cancelled_appointments: z.number().int().nonnegative(),
  no_show_appointments: z.number().int().nonnegative(),
  appointment_completion_rate: decimalSchema,
})

export const dashboardCashDailyMetricSchema = z.object({
  date: dateSchema,
  income: decimalSchema,
  expense: decimalSchema,
  net_amount: decimalSchema,
})

export const appointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
])

export const dashboardAppointmentStatusMetricSchema = z.object({
  status: appointmentStatusSchema,
  appointments_count: z.number().int().nonnegative(),
})

export const dashboardTopProductMetricSchema = z.object({
  product_id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  sales_count: z.number().int().nonnegative(),
  quantity: decimalSchema,
  revenue: decimalSchema,
  current_stock: decimalSchema,
})

export const dashboardResponseSchema = z.object({
  metadata: reportMetadataSchema,
  top_limit: z.number().int().min(1).max(50),
  kpis: dashboardKpisSchema,
  charts: z.object({
    daily_sales: z.array(salesDailyMetricSchema),
    daily_cash_flow: z.array(dashboardCashDailyMetricSchema),
    appointments_by_status: z.array(dashboardAppointmentStatusMetricSchema),
    inventory_movements: z.array(inventoryMovementMetricSchema),
  }),
  highlights: z.object({
    products: z.array(dashboardTopProductMetricSchema),
    services: z.array(topServiceMetricSchema),
    customers: z.array(topCustomerMetricSchema),
  }),
})

export interface DashboardQuery {
  start_date: string
  end_date: string
  timezone: string
  top_limit: number
}

export interface DashboardFilters {
  startDate: string
  endDate: string
  timezone: string
  topLimit: number
}

export interface ChartPoint {
  label: string
  value: number
}

export interface ChartBar extends ChartPoint {
  color?: string
}

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>
export type DashboardKpis = z.infer<typeof dashboardKpisSchema>
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>
export type DashboardTopProduct = z.infer<typeof dashboardTopProductMetricSchema>
export type TopService = z.infer<typeof topServiceMetricSchema>
export type TopCustomer = z.infer<typeof topCustomerMetricSchema>
