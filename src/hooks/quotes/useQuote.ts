import { useQuery } from '@tanstack/react-query'
import { quotesApi } from '../../api/quotes.api'
import { quotesKeys } from './useQuotes'

export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: quotesKeys.detail(id ?? ''),
    queryFn:  () => quotesApi.getById(id!),
    enabled:  !!id,
  })
}

export function useQuoteHistory(id: string | undefined) {
  return useQuery({
    queryKey: quotesKeys.history(id ?? ''),
    queryFn:  () => quotesApi.getHistory(id!),
    enabled:  !!id,
  })
}
