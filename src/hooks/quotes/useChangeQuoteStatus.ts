import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { quotesApi } from '../../api/quotes.api'
import type { QuoteStatus } from '../../types'
import { quotesKeys } from './useQuotes'
import { extractError } from '../../lib/extractError'

export function useChangeQuoteStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: QuoteStatus) => quotesApi.changeStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotesKeys.lists() })
      qc.invalidateQueries({ queryKey: quotesKeys.detail(id) })
      qc.invalidateQueries({ queryKey: quotesKeys.history(id) })
      toast.success('Estado actualizado')
    },
    onError: (err) => toast.error(extractError(err, 'Transición de estado inválida')),
  })
}
