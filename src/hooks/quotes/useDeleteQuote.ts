import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { quotesApi } from '../../api/quotes.api'
import { quotesKeys } from './useQuotes'
import { extractError } from '../../lib/extractError'

export function useDeleteQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quotesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotesKeys.lists() })
      toast.success('Cotización eliminada')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo eliminar la cotización')),
  })
}
