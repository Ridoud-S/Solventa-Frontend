import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { remindersApi } from '../../api/follow-ups.api'
import { remindersKeys } from './useReminders'
import { extractError } from '../../lib/extractError'

export function useDeleteReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => remindersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: remindersKeys.all })
      toast.success('Recordatorio eliminado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo eliminar')),
  })
}
