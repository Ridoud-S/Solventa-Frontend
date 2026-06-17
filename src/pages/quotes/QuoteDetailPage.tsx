import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, User, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

// Hooks
import { useQuote, useQuoteHistory } from '../../hooks/quotes/useQuote'

// Componentes
import QuoteHeader        from '../../components/quotes/detail/QuoteHeader'
import QuoteLinesTable    from '../../components/quotes/detail/QuoteLinesTable'
import QuoteStatusHistory from '../../components/quotes/detail/QuoteStatusHistory'
import QuoteFormModal     from '../../components/quotes/QuoteFormModal'

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [editOpen, setEditOpen] = useState(false)

  const { data: quote, isLoading }                      = useQuote(id)
  const { data: history = [], isLoading: histLoading }  = useQuoteHistory(id)

  if (isLoading && !quote) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Cotización no encontrada.
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">

      <QuoteHeader quote={quote} onEdit={() => setEditOpen(true)} />

      {/* Tarjetas de info rápida */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Emitida</p>
          <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
            <Calendar size={13} className="text-muted-foreground" />
            {new Date(quote.issuedAt).toLocaleDateString('es-MX')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Vence</p>
          <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
            <Calendar size={13} className="text-muted-foreground" />
            {new Date(quote.expiresAt).toLocaleDateString('es-MX')}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Creada por</p>
          <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
            <User size={13} className="text-muted-foreground" />
            {quote.createdBy?.name ?? '—'}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Líneas</p>
          <p className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
            <FileText size={13} className="text-muted-foreground" />
            {quote.lines.length} {quote.lines.length === 1 ? 'producto' : 'productos'}
          </p>
        </Card>
      </div>

      {/* Líneas + totales */}
      <QuoteLinesTable
        lines={quote.lines}
        subtotal={quote.subtotal}
        discountPct={quote.discountPct}
        taxPct={quote.taxPct}
        total={quote.total}
      />

      {/* Notas */}
      {quote.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{quote.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Historial de estados */}
      <QuoteStatusHistory history={history} isLoading={histLoading} />

      {/* Modal editar (solo DRAFT) */}
      {quote.status === 'DRAFT' && (
        <QuoteFormModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          quote={quote}
        />
      )}

    </div>
  )
}
