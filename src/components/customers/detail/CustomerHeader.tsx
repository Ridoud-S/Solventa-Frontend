import { ArrowLeft, Pencil, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Customer } from '../../../types'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'

interface Props {
  customer: Customer
  onEdit: () => void
}

export default function CustomerHeader({ customer, onEdit }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">{customer.name}</h2>
            {customer.leadId && (
              <Badge variant="outline" className="text-xs gap-1">
                <Building2 size={11} /> Lead convertido
              </Badge>
            )}
          </div>
          {customer.company && (
            <p className="text-sm text-muted-foreground">{customer.company}</p>
          )}
        </div>
      </div>

      <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={onEdit}>
        <Pencil size={14} /> Editar
      </Button>
    </div>
  )
}
