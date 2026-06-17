import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi, type UpdateCompanyDto } from '../../api/users.api'
import { userKeys } from './useProfile'
import { extractError } from '../../lib/extractError'

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCompanyDto) => usersApi.updateCompany(data),
    onSuccess: (updated) => {
      qc.setQueryData(userKeys.company, updated)
      toast.success('Empresa actualizada')
    },
    onError: (err) => toast.error(extractError(err, 'No se pudo actualizar la empresa')),
  })
}
