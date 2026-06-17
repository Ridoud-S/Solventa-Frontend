import type { QuoteStatus } from '../../types'

const CONFIG: Record<QuoteStatus, { label: string; className: string }> = {
  DRAFT:   { label: 'Borrador', className: 'bg-slate-100  text-slate-700'  },
  SENT:    { label: 'Enviada',  className: 'bg-blue-100   text-blue-700'   },
  WON:     { label: 'Ganada',   className: 'bg-green-100  text-green-700'  },
  LOST:    { label: 'Perdida',  className: 'bg-red-100    text-red-700'    },
  EXPIRED: { label: 'Vencida',  className: 'bg-amber-100  text-amber-700'  },
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const cfg = CONFIG[status]
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
