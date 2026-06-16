import { useQuery } from '@tanstack/react-query'
import { followUpsApi } from '../../api/follow-ups.api'
import type { EntityType } from '../../types'

export const followUpsKeys = {
  all:      ['follow-ups'] as const,
  byEntity: (type: EntityType, id: string) =>
    [...followUpsKeys.all, type, id] as const,
}

export function useFollowUps(entityType: EntityType, entityId: string | undefined) {
  return useQuery({
    queryKey: followUpsKeys.byEntity(entityType, entityId ?? ''),
    queryFn:  () => followUpsApi.listByEntity(entityType, entityId!),
    enabled:  !!entityId,
  })
}
