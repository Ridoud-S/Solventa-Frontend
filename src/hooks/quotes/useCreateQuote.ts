import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { quotesApi, type CreateQuoteDto } from '../../api/quotes.api'
import { quotesKeys } from './useQuotes'
import { extractError } from '../../lib/extractError'

export function useCreateQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuoteDto) => quotesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotesKeys.lists() })
      toast.success('Cotización creada')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo crear la cotización')),
  })
}
