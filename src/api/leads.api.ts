import apiClient from './client'
import type { Lead } from '../types'
import type { PageResponse } from '../types/api'

export interface CreateLeadDto {
  name: string
  company?: string
  email?: string
  phone?: string
  source: Lead['source']
  priority: Lead['priority']
  notes?: string
  assignedToId?: string
}

export type UpdateLeadDto = CreateLeadDto

export interface LeadFilters {
  q?: string
  status?: Lead['status']
  priority?: Lead['priority']
  page?: number
  size?: number
}

export const leadsApi = {
  list: (filters: LeadFilters = {}) =>
    apiClient
      .get<PageResponse<Lead>>('/leads', { params: filters })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Lead>(`/leads/${id}`).then((r) => r.data),

  create: (data: CreateLeadDto) =>
    apiClient.post<Lead>('/leads', data).then((r) => r.data),

  update: (id: string, data: UpdateLeadDto) =>
    apiClient.put<Lead>(`/leads/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<void>(`/leads/${id}`).then((r) => r.data),

  changeStatus: (id: string, status: Lead['status']) =>
    apiClient
      .patch<Lead>(`/leads/${id}/status`, { status })
      .then((r) => r.data),

  convertToCustomer: (id: string) =>
    apiClient
      .post<{ customerId: string; message: string }>(`/leads/${id}/convert`)
      .then((r) => r.data),
}
