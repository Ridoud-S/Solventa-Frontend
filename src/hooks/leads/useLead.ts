import { useQuery } from '@tanstack/react-query'
import { leadsApi } from '../../api/leads.api'
import { leadsKeys } from './useLeads'

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: leadsKeys.detail(id ?? ''),
    queryFn:  () => leadsApi.getById(id!),
    enabled:  !!id,
  })
}
