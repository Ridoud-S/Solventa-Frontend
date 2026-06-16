import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { leadsApi, type CreateLeadDto } from '../../api/leads.api'
import { leadsKeys } from './useLeads'
import { extractError } from '../../lib/extractError'

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeadDto) => leadsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsKeys.lists() })
      toast.success('Lead creado correctamente')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo crear el lead')),
  })
}
