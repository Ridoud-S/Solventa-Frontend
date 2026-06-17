import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { quotesApi, type UpdateQuoteDto } from '../../api/quotes.api'
import { quotesKeys } from './useQuotes'
import { extractError } from '../../lib/extractError'

export function useUpdateQuote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateQuoteDto) => quotesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotesKeys.lists() })
      qc.invalidateQueries({ queryKey: quotesKeys.detail(id) })
      toast.success('Cotización actualizada')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo actualizar la cotización')),
  })
}
