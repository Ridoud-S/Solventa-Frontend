import { FileText } from 'lucide-react'
import type { QuoteLine } from '../../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

interface Props {
  lines: QuoteLine[]
  subtotal: number
  discountPct: number
  taxPct: number
  total: number
}

export default function QuoteLinesTable({ lines, subtotal, discountPct, taxPct, total }: Props) {
  const afterDiscount = subtotal * (1 - discountPct / 100)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          Líneas de cotización
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground">
            <span className="col-span-5">Descripción</span>
            <span className="col-span-2 text-right">Cantidad</span>
            <span className="col-span-2 text-right">Precio unit.</span>
            <span className="col-span-3 text-right">Subtotal</span>
          </div>

          {/* Líneas */}
          {[...lines]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((line) => (
              <div
                key={line.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-t text-sm items-center"
              >
                <span className="col-span-5 font-medium">{line.description}</span>
                <span className="col-span-2 text-right text-muted-foreground">
                  {line.quantity}
                </span>
                <span className="col-span-2 text-right text-muted-foreground">
                  {formatMXN(line.unitPrice)}
                </span>
                <span className="col-span-3 text-right font-medium">
                  {formatMXN(line.subtotal)}
                </span>
              </div>
            ))}

          {/* Totales */}
          <div className="border-t bg-muted/30 px-4 py-3 space-y-1.5">
            <div className="flex justify-end gap-8 text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="w-32 text-right">{formatMXN(subtotal)}</span>
            </div>
            {discountPct > 0 && (
              <div className="flex justify-end gap-8 text-sm text-muted-foreground">
                <span>Descuento ({discountPct}%)</span>
                <span className="w-32 text-right">- {formatMXN(subtotal * (discountPct / 100))}</span>
              </div>
            )}
            <div className="flex justify-end gap-8 text-sm text-muted-foreground">
              <span>IVA ({taxPct}%)</span>
              <span className="w-32 text-right">{formatMXN(afterDiscount * (taxPct / 100))}</span>
            </div>
            <div className="flex justify-end gap-8 text-base font-semibold border-t pt-1.5">
              <span>Total</span>
              <span className="w-32 text-right">{formatMXN(total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
