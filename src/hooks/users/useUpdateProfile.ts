import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi, type UpdateProfileDto } from '../../api/users.api'
import { userKeys } from './useProfile'
import { extractError } from '../../lib/extractError'

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfileDto) => usersApi.updateMe(data),
    onSuccess: (updated) => {
      qc.setQueryData(userKeys.me, updated)
      toast.success('Perfil actualizado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo actualizar el perfil')),
  })
}
