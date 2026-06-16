import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { remindersApi, type CreateReminderDto } from '../../api/follow-ups.api'
import { remindersKeys } from './useReminders'
import { extractError } from '../../lib/extractError'

export function useCreateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateReminderDto) => remindersApi.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: remindersKeys.byEntity(variables.entityType, variables.entityId),
      })
      qc.invalidateQueries({ queryKey: remindersKeys.today() })
      toast.success('Recordatorio creado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo crear el recordatorio')),
  })
}
