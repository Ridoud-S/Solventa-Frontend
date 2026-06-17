import { History, ArrowRight } from 'lucide-react'
import type { QuoteStatusHistoryItem } from '../../../api/quotes.api'
import { QuoteStatusBadge } from '../QuoteStatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

interface Props {
  history: QuoteStatusHistoryItem[]
  isLoading: boolean
}

export default function QuoteStatusHistory({ history, isLoading }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History size={16} className="text-primary" />
          Historial de estados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin cambios de estado registrados
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((h, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  {h.oldStatus ? (
                    <>
                      <QuoteStatusBadge status={h.oldStatus} />
                      <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Creada como</span>
                  )}
                  <QuoteStatusBadge status={h.newStatus} />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">{h.changedByName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.changedAt).toLocaleDateString('es-MX', {
                      day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
