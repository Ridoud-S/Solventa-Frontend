import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customersApi } from '../../api/customers.api'
import { customersKeys } from './useCustomers'
import { extractError } from '../../lib/extractError'

export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customersKeys.lists() })
      toast.success('Cliente eliminado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo eliminar el cliente')),
  })
}
