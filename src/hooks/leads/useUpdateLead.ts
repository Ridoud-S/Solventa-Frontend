import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leadsApi, type UpdateLeadDto } from '../../api/leads.api'
import { leadsKeys } from './useLeads'
import { extractError } from '../../lib/extractError'

export function useUpdateLead(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateLeadDto) => leadsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsKeys.lists() })
      qc.invalidateQueries({ queryKey: leadsKeys.detail(id) })
      toast.success('Lead actualizado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo actualizar el lead')),
  })
}
