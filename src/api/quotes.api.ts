import apiClient from './client'
import type { Quote, QuoteStatus } from '../types'
import type { PageResponse } from '../types/api'

export interface QuoteLineDto {
  description: string
  quantity: number
  unitPrice: number
}

export interface CreateQuoteDto {
  customerId: string
  title: string
  discountPct?: number
  taxPct?: number
  issuedAt?: string
  expiresAt: string
  notes?: string
  lines: QuoteLineDto[]
}

export type UpdateQuoteDto = CreateQuoteDto

export interface QuoteFilters {
  status?: QuoteStatus
  customerId?: string
  q?: string
  page?: number
  size?: number
}

export interface QuoteStatusHistoryItem {
  oldStatus: QuoteStatus | null
  newStatus: QuoteStatus
  changedByName: string
  changedAt: string
}

export const quotesApi = {
  list: (filters: QuoteFilters = {}) =>
    apiClient
      .get<PageResponse<Quote>>('/quotes', { params: filters })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Quote>(`/quotes/${id}`).then((r) => r.data),

  getHistory: (id: string) =>
    apiClient
      .get<QuoteStatusHistoryItem[]>(`/quotes/${id}/history`)
      .then((r) => r.data),

  create: (data: CreateQuoteDto) =>
    apiClient.post<Quote>('/quotes', data).then((r) => r.data),

  update: (id: string, data: UpdateQuoteDto) =>
    apiClient.put<Quote>(`/quotes/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<void>(`/quotes/${id}`).then((r) => r.data),

  changeStatus: (id: string, status: QuoteStatus) =>
    apiClient
      .patch<Quote>(`/quotes/${id}/status`, { status })
      .then((r) => r.data),
}
