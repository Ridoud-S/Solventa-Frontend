import { Mail, Phone, MapPin, FileText } from 'lucide-react'
import type { Customer } from '../../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

export default function CustomerInfoCard({ customer }: { customer: Customer }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Información del cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {customer.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={14} className="shrink-0" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.rfc && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText size={14} className="shrink-0" />
              <span>RFC: <span className="font-mono">{customer.rfc}</span></span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Registrado:</span>
            <span>{new Date(customer.createdAt).toLocaleDateString('es-MX', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}</span>
          </div>
        </div>

        {customer.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Notas</p>
            <p className="text-sm">{customer.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
