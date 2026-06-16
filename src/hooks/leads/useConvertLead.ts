import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leadsApi } from '../../api/leads.api'
import { leadsKeys } from './useLeads'
import { extractError } from '../../lib/extractError'

export function useConvertLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadsApi.convertToCustomer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsKeys.lists() })
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Lead convertido a cliente')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo convertir el lead')),
  })
}
