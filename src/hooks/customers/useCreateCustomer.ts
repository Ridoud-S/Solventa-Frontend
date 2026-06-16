import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customersApi, type CreateCustomerDto } from '../../api/customers.api'
import { customersKeys } from './useCustomers'
import { extractError } from '../../lib/extractError'

export function useCreateCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCustomerDto) => customersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customersKeys.lists() })
      toast.success('Cliente creado correctamente')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo crear el cliente')),
  })
}
