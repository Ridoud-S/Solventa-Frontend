import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { leadsApi, type LeadFilters } from '../../api/leads.api'

export const leadsKeys = {
  all:    ['leads'] as const,
  lists:  () => [...leadsKeys.all, 'list'] as const,
  list:   (filters: LeadFilters) => [...leadsKeys.lists(), filters] as const,
  detail: (id: string) => [...leadsKeys.all, 'detail', id] as const,
}

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: leadsKeys.list(filters),
    queryFn:  () => leadsApi.list(filters),
    placeholderData: keepPreviousData, // mantiene la data vieja mientras carga la nueva página
  })
}
