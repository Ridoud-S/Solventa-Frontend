import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { customersApi, type CustomerFilters } from '../../api/customers.api'

export const customersKeys = {
  all:    ['customers'] as const,
  lists:  () => [...customersKeys.all, 'list'] as const,
  list:   (filters: CustomerFilters) => [...customersKeys.lists(), filters] as const,
  detail: (id: string) => [...customersKeys.all, 'detail', id] as const,
}

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: customersKeys.list(filters),
    queryFn:  () => customersApi.list(filters),
    placeholderData: keepPreviousData,
  })
}
