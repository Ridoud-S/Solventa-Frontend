import { useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import type { Quote } from '../../types'
import { useCreateQuote } from '../../hooks/quotes/useCreateQuote'
import { useUpdateQuote } from '../../hooks/quotes/useUpdateQuote'
import { useCustomers } from '../../hooks/customers/useCustomers'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../ui/select'

// ── Schema ─────────────────────────────────────────────────────────────────────
const lineSchema = z.object({
  description: z.string().min(1, 'Requerido'),
  quantity:    z.coerce.number().positive('> 0'),
  unitPrice:   z.coerce.number().min(0, '>= 0'),
})

const schema = z.object({
  customerId:  z.string().min(1, 'Selecciona un cliente'),
  title:       z.string().min(2, 'El título es requerido'),
  discountPct: z.coerce.number().min(0).max(100).default(0),
  taxPct:      z.coerce.number().min(0).default(16),
  expiresAt:   z.string().min(1, 'La fecha de vencimiento es requerida'),
  notes:       z.string().optional(),
  lines:       z.array(lineSchema).min(1, 'Agrega al menos una línea'),
})

type FormData = z.infer<typeof schema>

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

// Formato YYYY-MM-DD para input date
const toDateInput = (iso: string) => iso?.slice(0, 10) ?? ''

interface Props {
  open: boolean
  onClose: () => void
  quote?: Quote | null
}

export default function QuoteFormModal({ open, onClose, quote }: Props) {
  const isEdit      = !!quote
  const createQuote = useCreateQuote()
  const updateQuote = useUpdateQuote(quote?.id ?? '')

  const { data: customersPage } = useCustomers({ size: 100 })
  const customers = customersPage?.content ?? []

  const { register, handleSubmit, control, watch, reset,
          formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      discountPct: 0,
      taxPct: 16,
      lines: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  // Rellenar al editar
  useEffect(() => {
    if (quote) {
      reset({
        customerId:  quote.customer.id,
        title:       quote.title,
        discountPct: quote.discountPct,
        taxPct:      quote.taxPct,
        expiresAt:   toDateInput(quote.expiresAt),
        notes:       quote.notes ?? '',
        lines: [...quote.lines]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((l) => ({
            description: l.description,
            quantity:    l.quantity,
            unitPrice:   l.unitPrice,
          })),
      })
    } else {
      reset({
        discountPct: 0,
        taxPct: 16,
        lines: [{ description: '', quantity: 1, unitPrice: 0 }],
      })
    }
  }, [quote, reset, open])

  // ── Cálculo en tiempo real ─────────────────────────────────────────────────
  const watchedLines  = watch('lines') ?? []
  const discountPct   = Number(watch('discountPct')) || 0
  const taxPct        = Number(watch('taxPct'))      || 0

  const subtotal = watchedLines.reduce((acc, l) => {
    return acc + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0)
  }, 0)
  const afterDiscount = subtotal * (1 - discountPct / 100)
  const total         = afterDiscount * (1 + taxPct / 100)

  // ── Submit ─────────────────────────────────────────────────────────────────
  const isLoading = createQuote.isPending || updateQuote.isPending

  const onSubmit = (data: FormData) => {
    const onSuccess = () => { reset(); onClose() }
    if (isEdit) {
      updateQuote.mutate(data, { onSuccess })
    } else {
      createQuote.mutate(data, { onSuccess })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Cotización' : 'Nueva Cotización'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">

          {/* Cliente + Título */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Cliente *</Label>
              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}{c.company ? ` — ${c.company}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerId && (
                <p className="text-xs text-destructive">{errors.customerId.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Título *</Label>
              <Input
                placeholder="Ej: Material construcción Proyecto X"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Descuento + IVA + Vencimiento */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Descuento %</Label>
              <Input type="number" min={0} max={100} step={0.01} {...register('discountPct')} />
            </div>
            <div className="space-y-1">
              <Label>IVA %</Label>
              <Input type="number" min={0} step={0.01} {...register('taxPct')} />
            </div>
            <div className="space-y-1">
              <Label>Vence el *</Label>
              <Input type="date" {...register('expiresAt')} />
              {errors.expiresAt && (
                <p className="text-xs text-destructive">{errors.expiresAt.message}</p>
              )}
            </div>
          </div>

          {/* Líneas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Líneas de cotización *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
              >
                <Plus size={14} /> Agregar línea
              </Button>
            </div>

            {errors.lines?.root && (
              <p className="text-xs text-destructive">{errors.lines.root.message}</p>
            )}

            <div className="border rounded-lg overflow-hidden">
              {/* Cabecera */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                <span className="col-span-5">Descripción</span>
                <span className="col-span-2 text-right">Cantidad</span>
                <span className="col-span-2 text-right">Precio unit.</span>
                <span className="col-span-2 text-right">Subtotal</span>
                <span className="col-span-1" />
              </div>

              {/* Filas */}
              {fields.map((field, idx) => {
                const qty   = Number(watch(`lines.${idx}.quantity`))  || 0
                const price = Number(watch(`lines.${idx}.unitPrice`)) || 0
                const sub   = qty * price

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-2 px-3 py-2 border-t items-center"
                  >
                    <div className="col-span-5">
                      <Input
                        placeholder="Producto o servicio"
                        className="h-8 text-sm"
                        {...register(`lines.${idx}.description`)}
                      />
                      {errors.lines?.[idx]?.description && (
                        <p className="text-xs text-destructive mt-0.5">
                          {errors.lines[idx]?.description?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        className="h-8 text-sm text-right"
                        {...register(`lines.${idx}.quantity`)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        className="h-8 text-sm text-right"
                        {...register(`lines.${idx}.unitPrice`)}
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium pr-1">
                      {formatMXN(sub)}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Totales en tiempo real */}
          <div className="flex justify-end">
            <div className="w-56 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMXN(subtotal)}</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Descuento ({discountPct}%)</span>
                  <span className="text-red-500">- {formatMXN(subtotal * (discountPct / 100))}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>IVA ({taxPct}%)</span>
                <span>{formatMXN(afterDiscount * (taxPct / 100))}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-1.5">
                <span>Total</span>
                <span>{formatMXN(total)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label>Notas</Label>
            <Textarea
              placeholder="Condiciones de pago, plazos de entrega, observaciones..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cotización'}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}
