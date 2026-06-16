import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { followUpsApi } from '../../api/follow-ups.api'
import { followUpsKeys } from './useFollowUps'
import { extractError } from '../../lib/extractError'
import type { EntityType } from '../../types'

interface DeleteContext {
  entityType: EntityType
  entityId: string
}

export function useDeleteFollowUp(ctx: DeleteContext) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => followUpsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: followUpsKeys.byEntity(ctx.entityType, ctx.entityId),
      })
      toast.success('Seguimiento eliminado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo eliminar')),
  })
}
