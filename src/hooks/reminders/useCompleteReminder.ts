import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { remindersApi } from '../../api/follow-ups.api'
import { remindersKeys } from './useReminders'
import { extractError } from '../../lib/extractError'

export function useCompleteReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => remindersApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: remindersKeys.all })
      toast.success('Recordatorio completado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo completar')),
  })
}
