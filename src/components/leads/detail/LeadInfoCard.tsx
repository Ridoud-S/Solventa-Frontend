import { Mail, Phone } from 'lucide-react'
import type { Lead } from '../../../types'
import { Badge } from '../../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

export default function LeadInfoCard({ lead }: { lead: Lead }) {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Información del lead
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {lead.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={14} className="shrink-0" />
              <span>{lead.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Fuente:</span>
            <Badge variant="outline" className="text-xs">{lead.source}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Registrado:</span>
            <span>{new Date(lead.createdAt).toLocaleDateString('es-MX')}</span>
          </div>
        </div>
        {lead.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Notas</p>
            <p className="text-sm">{lead.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
