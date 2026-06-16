import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { EntityType } from '../../types'
import { useCreateReminder } from '../../hooks/reminders/useCreateReminder'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

const schema = z.object({
  remindAt:    z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(3, 'Describe el recordatorio'),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  entityType: EntityType
  entityId: string
}

export default function ReminderFormModal({ open, onClose, entityType, entityId }: Props) {
  const createReminder = useCreateReminder()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      remindAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    },
  })

  const onSubmit = (data: FormData) => {
    createReminder.mutate(
      {
        ...data,
        entityType,
        entityId,
        remindAt: new Date(data.remindAt).toISOString(),
      },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Crear recordatorio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>¿Cuándo? *</Label>
            <Input type="datetime-local" {...register('remindAt')} />
          </div>

          <div className="space-y-1">
            <Label>Descripción *</Label>
            <Textarea
              placeholder="Ej: Llamar para confirmar la cotización"
              rows={2}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createReminder.isPending}>
              {createReminder.isPending ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
