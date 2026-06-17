import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { quotesApi, type QuoteFilters } from '../../api/quotes.api'

export const quotesKeys = {
  all:     ['quotes'] as const,
  lists:   () => [...quotesKeys.all, 'list'] as const,
  list:    (filters: QuoteFilters) => [...quotesKeys.lists(), filters] as const,
  detail:  (id: string) => [...quotesKeys.all, 'detail', id] as const,
  history: (id: string) => [...quotesKeys.all, 'history', id] as const,
}

export function useQuotes(filters: QuoteFilters = {}) {
  return useQuery({
    queryKey: quotesKeys.list(filters),
    queryFn:  () => quotesApi.list(filters),
    placeholderData: keepPreviousData,
  })
}
