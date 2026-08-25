import type { DashboardResponse } from '@/types/dashboard'

export const dashboardFixture: DashboardResponse = {
  metadata: {
    company_id: 'bf7bd432-0c31-4350-95f2-cce62dda4884',
    start_date: '2026-08-01',
    end_date: '2026-08-24',
    timezone: 'America/Bogota',
    generated_at: '2026-08-24T21:15:12.814181Z',
  },
  top_limit: 5,
  kpis: {
    completed_sales_count: 2,
    cancelled_sales_count: 1,
    sales_cancellation_rate: '33.33',
    net_sales: '180000.00',
    average_ticket: '90000.00',
    total_income: '230000.00',
    total_expense: '50000.00',
    net_cash_flow: '180000.00',
    total_stock_units: '46.000',
    low_stock_products: 1,
    out_of_stock_products: 0,
    active_customers: 3,
    new_customers: 1,
    services_sold: 2,
    service_revenue: '120000.00',
    appointments_count: 4,
    completed_appointments: 2,
    cancelled_appointments: 1,
    no_show_appointments: 0,
    appointment_completion_rate: '66.67',
  },
  charts: {
    daily_sales: [
      { date: '2026-08-01', sales_count: 1, net_sales: '80000.00' },
      { date: '2026-08-02', sales_count: 1, net_sales: '100000.00' },
    ],
    daily_cash_flow: [
      {
        date: '2026-08-01',
        income: '130000.00',
        expense: '30000.00',
        net_amount: '100000.00',
      },
      {
        date: '2026-08-02',
        income: '100000.00',
        expense: '20000.00',
        net_amount: '80000.00',
      },
    ],
    appointments_by_status: [
      { status: 'scheduled', appointments_count: 1 },
      { status: 'confirmed', appointments_count: 0 },
      { status: 'in_progress', appointments_count: 0 },
      { status: 'completed', appointments_count: 2 },
      { status: 'cancelled', appointments_count: 1 },
      { status: 'no_show', appointments_count: 0 },
    ],
    inventory_movements: [
      { movement_type: 'entry', movements_count: 3, quantity: '22.000' },
      { movement_type: 'exit', movements_count: 2, quantity: '5.000' },
    ],
  },
  highlights: {
    products: [
      {
        product_id: 'd360553e-44cc-4855-b513-156c63a75baf',
        code: 'PROD-001',
        name: 'Shampoo profesional',
        sales_count: 2,
        quantity: '2.000',
        revenue: '60000.00',
        current_stock: '12.000',
      },
    ],
    services: [
      {
        service_id: '59d251c9-c416-47db-acd0-ff193ca60cb3',
        service_name: 'Corte y peinado',
        sales_count: 2,
        quantity: '2.000',
        revenue: '120000.00',
        average_unit_price: '60000.00',
      },
    ],
    customers: [
      {
        customer_id: 'e2da1859-d4f4-493f-8216-cd911466162a',
        customer_name: 'Cliente de prueba',
        purchases_count: 2,
        total_spent: '180000.00',
        average_ticket: '90000.00',
      },
    ],
  },
}
