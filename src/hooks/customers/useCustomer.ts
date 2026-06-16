import { useQuery } from '@tanstack/react-query'
import { customersApi } from '../../api/customers.api'
import { customersKeys } from './useCustomers'

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: customersKeys.detail(id ?? ''),
    queryFn:  () => customersApi.getById(id!),
    enabled:  !!id,
  })
}
