import { ArrowLeft, Pencil, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Lead } from '../../../types'
import { Button } from '../../ui/button'

interface Props {
  lead: Lead
  onEdit: () => void
  onConvert: () => void
}

export default function LeadHeader({ lead, onEdit, onConvert }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">{lead.name}</h2>
          {lead.company && (
            <p className="text-sm text-muted-foreground">{lead.company}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" className="gap-2" onClick={onEdit}>
          <Pencil size={14} /> Editar
        </Button>
        {lead.status !== 'CONVERTED' && (
          <Button
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={onConvert}
          >
            <UserCheck size={14} /> Convertir a cliente
          </Button>
        )}
      </div>
    </div>
  )
}
