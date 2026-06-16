import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateLead } from '../../hooks/leads/useCreateLead'
import { useUpdateLead } from '../../hooks/leads/useUpdateLead'
import type { CreateLeadDto } from '../../api/leads.api'
import type { Lead } from '../../types'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../ui/select'
import { Textarea } from '../ui/textarea'

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  name:     z.string().min(2, 'El nombre es requerido'),
  company:  z.string().optional(),
  email:    z.string().email('Correo inválido').optional().or(z.literal('')),
  phone:    z.string().optional(),
  source:   z.enum(['WHATSAPP','EMAIL','REFERRAL','WEBSITE','PHONE','OTHER']),
  priority: z.enum(['LOW','MEDIUM','HIGH']),
  notes:    z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  lead?: Lead | null   // si viene, es edición
}

export default function LeadFormModal({ open, onClose, lead }: Props) {
  const isEdit = !!lead

  const { register, handleSubmit, reset, setValue, watch,
          formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      source:   'WHATSAPP',
      priority: 'MEDIUM',
    },
  })

  // Rellenar el form al editar
  useEffect(() => {
    if (lead) {
      reset({
        name:     lead.name,
        company:  lead.company  ?? '',
        email:    lead.email    ?? '',
        phone:    lead.phone    ?? '',
        source:   lead.source,
        priority: lead.priority,
        notes:    lead.notes    ?? '',
      })
    } else {
      reset({ source: 'WHATSAPP', priority: 'MEDIUM' })
    }
  }, [lead, reset])

  // ── Hooks ─────────────────────────────────────────────────────────────────────
  const createLead = useCreateLead()
  const updateLead = useUpdateLead(lead?.id ?? '')

  const isLoading = createLead.isPending || updateLead.isPending

  const onSubmit = (data: FormData) => {
    const payload: CreateLeadDto = {
      ...data,
      email:   data.email   || undefined,
      company: data.company || undefined,
      phone:   data.phone   || undefined,
      notes:   data.notes   || undefined,
    }
    if (isEdit) {
      updateLead.mutate(payload, { onSuccess: onClose })
    } else {
      createLead.mutate(payload, { onSuccess: onClose })
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Lead' : 'Nuevo Lead'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">

          {/* Nombre + Empresa */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" placeholder="Juan García" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" placeholder="Mi Empresa SA" {...register('company')} />
            </div>
          </div>

          {/* Email + Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" placeholder="juan@empresa.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="+52 55 1234 5678" {...register('phone')} />
            </div>
          </div>

          {/* Fuente + Prioridad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Fuente *</Label>
              <Select
                value={watch('source')}
                onValueChange={(v) => setValue('source', v as Lead['source'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="REFERRAL">Referido</SelectItem>
                  <SelectItem value="WEBSITE">Sitio web</SelectItem>
                  <SelectItem value="PHONE">Llamada</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Prioridad *</Label>
              <Select
                value={watch('priority')}
                onValueChange={(v) => setValue('priority', v as Lead['priority'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Contexto del lead, cómo llegó, qué necesita..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear lead'}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}
