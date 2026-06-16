import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customersApi, type UpdateCustomerDto } from '../../api/customers.api'
import { customersKeys } from './useCustomers'
import { extractError } from '../../lib/extractError'

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCustomerDto) => customersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customersKeys.lists() })
      qc.invalidateQueries({ queryKey: customersKeys.detail(id) })
      toast.success('Cliente actualizado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo actualizar el cliente')),
  })
}
