import type { Lead } from '../../types'

const STATUS_CONFIG: Record<Lead['status'], { label: string; className: string }> = {
  NEW:        { label: 'Nuevo',       className: 'bg-slate-100  text-slate-700'  },
  CONTACTED:  { label: 'Contactado',  className: 'bg-blue-100   text-blue-700'   },
  QUALIFIED:  { label: 'Calificado',  className: 'bg-purple-100 text-purple-700' },
  CONVERTED:  { label: 'Convertido',  className: 'bg-green-100  text-green-700'  },
  DISCARDED:  { label: 'Descartado',  className: 'bg-red-100    text-red-700'    },
}

const PRIORITY_CONFIG: Record<Lead['priority'], { label: string; className: string }> = {
  LOW:    { label: 'Baja',  className: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Media', className: 'bg-amber-100 text-amber-700' },
  HIGH:   { label: 'Alta',  className: 'bg-red-100   text-red-700'   },
}

export function LeadStatusBadge({ status }: { status: Lead['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

export function LeadPriorityBadge({ priority }: { priority: Lead['priority'] }) {
  const cfg = PRIORITY_CONFIG[priority]
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
