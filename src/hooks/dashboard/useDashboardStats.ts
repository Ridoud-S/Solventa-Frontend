import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../api/dashboard.api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  dashboardApi.getStats,
    refetchInterval: 5 * 60 * 1000, // refresca cada 5 min automáticamente
    staleTime:       2 * 60 * 1000, // considera los datos frescos por 2 min
  })
}
