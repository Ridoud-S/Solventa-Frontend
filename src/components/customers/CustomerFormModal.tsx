import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Customer } from '../../types'
import { useCreateCustomer } from '../../hooks/customers/useCreateCustomer'
import { useUpdateCustomer } from '../../hooks/customers/useUpdateCustomer'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  name:    z.string().min(2, 'El nombre es requerido'),
  company: z.string().optional(),
  email:   z.string().email('Correo inválido').optional().or(z.literal('')),
  phone:   z.string().optional(),
  rfc:     z.string().max(13, 'RFC máximo 13 caracteres').optional().or(z.literal('')),
  address: z.string().optional(),
  notes:   z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  customer?: Customer | null
}

export default function CustomerFormModal({ open, onClose, customer }: Props) {
  const isEdit         = !!customer
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer(customer?.id ?? '')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (customer) {
      reset({
        name:    customer.name,
        company: customer.company ?? '',
        email:   customer.email   ?? '',
        phone:   customer.phone   ?? '',
        rfc:     customer.rfc     ?? '',
        address: customer.address ?? '',
        notes:   customer.notes   ?? '',
      })
    } else {
      reset({ name: '', company: '', email: '', phone: '', rfc: '', address: '', notes: '' })
    }
  }, [customer, reset])

  const isLoading = createCustomer.isPending || updateCustomer.isPending

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      email:   data.email   || undefined,
      company: data.company || undefined,
      phone:   data.phone   || undefined,
      rfc:     data.rfc     || undefined,
      address: data.address || undefined,
      notes:   data.notes   || undefined,
    }
    const onSuccess = () => { reset(); onClose() }
    if (isEdit) {
      updateCustomer.mutate(payload, { onSuccess })
    } else {
      createCustomer.mutate(payload, { onSuccess })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">

          {/* Nombre + Empresa */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="c-name">Nombre *</Label>
              <Input id="c-name" placeholder="Juan García" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-company">Empresa</Label>
              <Input id="c-company" placeholder="Mi Empresa SA" {...register('company')} />
            </div>
          </div>

          {/* Email + Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="c-email">Correo</Label>
              <Input id="c-email" type="email" placeholder="juan@empresa.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-phone">Teléfono</Label>
              <Input id="c-phone" placeholder="55 1234 5678" {...register('phone')} />
            </div>
          </div>

          {/* RFC + Dirección */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="c-rfc">RFC</Label>
              <Input id="c-rfc" placeholder="ABC850315XY1" maxLength={13} {...register('rfc')} />
              {errors.rfc && <p className="text-xs text-destructive">{errors.rfc.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-address">Dirección</Label>
              <Input id="c-address" placeholder="Av. Reforma 123, CDMX" {...register('address')} />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label htmlFor="c-notes">Notas</Label>
            <Textarea
              id="c-notes"
              placeholder="Información relevante del cliente..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}
