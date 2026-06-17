import { ArrowLeft, Pencil, Send, Trophy, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Quote } from '../../../types'
import { QuoteStatusBadge } from '../QuoteStatusBadge'
import { Button } from '../../ui/button'
import { useChangeQuoteStatus } from '../../../hooks/quotes/useChangeQuoteStatus'

interface Props {
  quote: Quote
  onEdit: () => void
}

export default function QuoteHeader({ quote, onEdit }: Props) {
  const navigate     = useNavigate()
  const changeStatus = useChangeQuoteStatus(quote.id)

  const isDraft    = quote.status === 'DRAFT'
  const isSent     = quote.status === 'SENT'
  const isTerminal = ['WON', 'LOST', 'EXPIRED'].includes(quote.status)

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/quotes')}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-semibold">{quote.title}</h2>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {quote.customer.name}
            {quote.customer.company ? ` — ${quote.customer.company}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        {isDraft && (
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={onEdit}>
              <Pencil size={14} /> Editar
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => changeStatus.mutate('SENT')}
              disabled={changeStatus.isPending}
            >
              <Send size={14} /> Enviar cotización
            </Button>
          </>
        )}
        {isSent && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => changeStatus.mutate('LOST')}
              disabled={changeStatus.isPending}
            >
              <XCircle size={14} /> Marcar perdida
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => changeStatus.mutate('WON')}
              disabled={changeStatus.isPending}
            >
              <Trophy size={14} /> Marcar ganada
            </Button>
          </>
        )}
        {isTerminal && (
          <span className="text-sm text-muted-foreground italic">Estado final</span>
        )}
      </div>
    </div>
  )
}
