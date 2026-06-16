import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leadsApi } from '../../api/leads.api'
import type { Lead } from '../../types'
import { leadsKeys } from './useLeads'
import { extractError } from '../../lib/extractError'

export function useChangeLeadStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: Lead['status']) => leadsApi.changeStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsKeys.lists() })
      qc.invalidateQueries({ queryKey: leadsKeys.detail(id) })
      toast.success('Estado actualizado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo cambiar el estado')),
  })
}
