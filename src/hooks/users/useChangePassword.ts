import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi, type ChangePasswordDto } from '../../api/users.api'
import { extractError } from '../../lib/extractError'

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => usersApi.changePassword(data),
    onSuccess: () => toast.success('Contraseña actualizada correctamente'),
    onError: (err) => toast.error(extractError(err, 'Contraseña actual incorrecta')),
  })
}
