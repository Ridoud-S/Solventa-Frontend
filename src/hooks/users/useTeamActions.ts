import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi, type InviteUserDto } from '../../api/users.api'
import { userKeys } from './useProfile'
import { extractError } from '../../lib/extractError'

export function useInviteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: InviteUserDto) => usersApi.inviteUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.team })
      toast.success('Usuario invitado al equipo')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo invitar al usuario')),
  })
}

export function useToggleUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? usersApi.activateUser(id) : usersApi.deactivateUser(id),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: userKeys.team })
      toast.success(vars.active ? 'Usuario activado' : 'Usuario desactivado')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo actualizar el usuario')),
  })
}
