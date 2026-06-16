import { Phone, Mail, Users, MessageCircle, Calendar, CheckCircle2, Trash2, MessageSquare, Plus } from 'lucide-react'
import type { FollowUp } from '../../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'

const TYPE_CONFIG: Record<FollowUp['type'], { label: string; icon: typeof Phone }> = {
  CALL:     { label: 'Llamada',  icon: Phone         },
  EMAIL:    { label: 'Email',    icon: Mail          },
  MEETING:  { label: 'Reunión',  icon: Users         },
  WHATSAPP: { label: 'WhatsApp', icon: MessageCircle },
  OTHER:    { label: 'Otro',     icon: Calendar      },
}

interface Props {
  followUps: FollowUp[]
  isLoading: boolean
  onAddFollowUp: () => void
  onAddReminder: () => void
  onDeleteFollowUp: (id: string) => void
}

export default function FollowUpsTimeline({
  followUps, isLoading, onAddFollowUp, onAddReminder, onDeleteFollowUp,
}: Props) {
  const sorted = [...followUps].sort(
    (a, b) => new Date(b.interactionDate).getTime() - new Date(a.interactionDate).getTime(),
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" />
            Historial de seguimientos ({followUps.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={onAddReminder}>
              <Calendar size={14} /> Recordatorio
            </Button>
            <Button size="sm" className="gap-2" onClick={onAddFollowUp}>
              <Plus size={14} /> Registrar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sin seguimientos aún</p>
            <p className="text-xs mt-1">Registra la primera interacción con este lead</p>
          </div>
        ) : (
          <div className="space-y-0">
            {sorted.map((fu, idx) => {
              const cfg  = TYPE_CONFIG[fu.type]
              const Icon = cfg.icon
              return (
                <div key={fu.id} className="flex gap-3 pb-4 relative">
                  {idx < sorted.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{cfg.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(fu.interactionDate).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        <button
                          onClick={() => onDeleteFollowUp(fu.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{fu.notes}</p>
                    {fu.result && (
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <CheckCircle2 size={12} /> {fu.result}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
