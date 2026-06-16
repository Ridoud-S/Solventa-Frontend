import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { followUpsApi, type CreateFollowUpDto } from '../../api/follow-ups.api'
import { followUpsKeys } from './useFollowUps'
import { extractError } from '../../lib/extractError'

export function useCreateFollowUp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFollowUpDto) => followUpsApi.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: followUpsKeys.byEntity(variables.entityType, variables.entityId),
      })
      toast.success('Seguimiento registrado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo registrar el seguimiento')),
  })
}
