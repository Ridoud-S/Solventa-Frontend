import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leadsApi } from '../../api/leads.api'
import { leadsKeys } from './useLeads'
import { extractError } from '../../lib/extractError'

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsKeys.lists() })
      toast.success('Lead eliminado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo eliminar el lead')),
  })
}
