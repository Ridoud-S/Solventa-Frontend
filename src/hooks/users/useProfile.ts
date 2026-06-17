import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../../api/users.api'

export const userKeys = {
  me:      ['user', 'me']      as const,
  company: ['user', 'company'] as const,
  team:    ['user', 'team']    as const,
}

export function useProfile() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn:  usersApi.getMe,
  })
}

export function useCompany() {
  return useQuery({
    queryKey: userKeys.company,
    queryFn:  usersApi.getCompany,
  })
}

export function useTeam() {
  return useQuery({
    queryKey: userKeys.team,
    queryFn:  usersApi.getTeam,
  })
}
