import apiClient from './client'
import type { Customer } from '../types'
import type { PageResponse } from '../types/api'

export interface CreateCustomerDto {
  name: string
  company?: string
  email?: string
  phone?: string
  rfc?: string
  address?: string
  notes?: string
  assignedToId?: string
}

export type UpdateCustomerDto = CreateCustomerDto

export interface CustomerFilters {
  q?: string
  page?: number
  size?: number
}

export const customersApi = {
  list: (filters: CustomerFilters = {}) =>
    apiClient
      .get<PageResponse<Customer>>('/customers', { params: filters })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Customer>(`/customers/${id}`).then((r) => r.data),

  create: (data: CreateCustomerDto) =>
    apiClient.post<Customer>('/customers', data).then((r) => r.data),

  update: (id: string, data: UpdateCustomerDto) =>
    apiClient.put<Customer>(`/customers/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<void>(`/customers/${id}`).then((r) => r.data),
}
