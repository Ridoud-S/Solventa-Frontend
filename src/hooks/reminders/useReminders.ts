import { useQuery } from '@tanstack/react-query'
import { remindersApi } from '../../api/follow-ups.api'
import type { EntityType } from '../../types'

export const remindersKeys = {
  all:      ['reminders'] as const,
  today:    () => [...remindersKeys.all, 'today'] as const,
  byEntity: (type: EntityType, id: string) =>
    [...remindersKeys.all, type, id] as const,
}

export function useReminders(entityType: EntityType, entityId: string | undefined) {
  return useQuery({
    queryKey: remindersKeys.byEntity(entityType, entityId ?? ''),
    queryFn:  () => remindersApi.listByEntity(entityType, entityId!),
    enabled:  !!entityId,
  })
}

export function useTodayReminders() {
  return useQuery({
    queryKey: remindersKeys.today(),
    queryFn:  () => remindersApi.today(),
  })
}
