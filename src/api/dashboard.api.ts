import apiClient from './client'
import type { QuoteStatus } from '../types'

export interface QuoteStatusStat {
  count: number
  total: number
}

export interface DashboardStats {
  totalLeads: number
  totalCustomers: number
  openQuotesCount: number
  openQuotesValue: number
  todayReminders: number
  quotesByStatus: Record<QuoteStatus, QuoteStatusStat>
}

export const dashboardApi = {
  getStats: () =>
    apiClient.get<DashboardStats>('/dashboard/stats').then((r) => r.data),
}
