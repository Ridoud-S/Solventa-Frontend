import type { Lead } from '../../../types'
import { LeadStatusBadge, LeadPriorityBadge } from '../LeadStatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { useChangeLeadStatus } from '../../../hooks/leads/useChangeLeadStatus'

const STATUS_ORDER: Lead['status'][] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'DISCARDED',
]

export default function LeadStatusCard({ lead }: { lead: Lead }) {
  const changeStatus = useChangeLeadStatus(lead.id)
  const isConverted  = lead.status === 'CONVERTED'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Estado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <LeadStatusBadge status={lead.status} />
          <LeadPriorityBadge priority={lead.priority} />
        </div>

        {!isConverted && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Cambiar estado</p>
            {STATUS_ORDER
              .filter((s) => s !== lead.status && s !== 'CONVERTED')
              .map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus.mutate(s)}
                  disabled={changeStatus.isPending}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors text-muted-foreground flex items-center gap-2"
                >
                  → Marcar como <LeadStatusBadge status={s} />
                </button>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
