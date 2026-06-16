import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { EntityType, FollowUp } from '../../../types'
import { useCreateFollowUp } from '../../../hooks/follow-ups/useCreateFollowUp'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select'
import { Textarea } from '../../ui/textarea'

const schema = z.object({
  type:            z.enum(['CALL', 'EMAIL', 'MEETING', 'WHATSAPP', 'OTHER']),
  interactionDate: z.string().min(1, 'La fecha es requerida'),
  notes:           z.string().min(3, 'Agrega una nota sobre la interacción'),
  result:          z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  entityType: EntityType
  entityId: string
}

export default function FollowUpFormModal({ open, onClose, entityType, entityId }: Props) {
  const createFollowUp = useCreateFollowUp()

  const { register, handleSubmit, watch, setValue, reset,
          formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type:            'CALL',
      interactionDate: new Date().toISOString().slice(0, 16),
    },
  })

  const onSubmit = (data: FormData) => {
    createFollowUp.mutate(
      {
        ...data,
        entityType,
        entityId,
        interactionDate: new Date(data.interactionDate).toISOString(),
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar seguimiento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Tipo *</Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v as FollowUp['type'])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CALL">Llamada</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="MEETING">Reunión</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fecha y hora *</Label>
              <Input type="datetime-local" {...register('interactionDate')} />
              {errors.interactionDate && (
                <p className="text-xs text-destructive">{errors.interactionDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notas *</Label>
            <Textarea
              placeholder="¿Qué pasó en esta interacción?"
              rows={3}
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Resultado</Label>
            <Input
              placeholder="¿Cómo quedó? ¿Próximo paso?"
              {...register('result')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createFollowUp.isPending}>
              {createFollowUp.isPending ? 'Guardando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
