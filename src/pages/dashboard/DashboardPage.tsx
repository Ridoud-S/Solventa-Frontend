import { useQuery } from '@tanstack/react-query'
import {
  Users, UserCheck, FileText, Bell,
  TrendingUp, Clock, CheckCircle2, XCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { dashboardApi } from '../../api/dashboard'
import StatCard from '../../components/dashboard/StatCard'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import type { QuoteStatus } from '../../types'

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatMXN = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string }> = {
  DRAFT:   { label: 'Borrador', color: 'bg-slate-100 text-slate-700'  },
  SENT:    { label: 'Enviada',  color: 'bg-blue-100 text-blue-700'    },
  WON:     { label: 'Ganada',   color: 'bg-green-100 text-green-700'  },
  LOST:    { label: 'Perdida',  color: 'bg-red-100 text-red-700'      },
  EXPIRED: { label: 'Vencida',  color: 'bg-amber-100 text-amber-700'  },
}

// ── Skeleton genérico ─────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded ${className}`} />
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    // Mientras el backend no esté listo, usamos datos de demo
    placeholderData: {
      totalLeads: 24,
      totalCustomers: 11,
      openQuotesCount: 8,
      openQuotesValue: 187500,
      todayReminders: 3,
      quotesByStatus: {
        DRAFT:   { count: 3, total: 45000  },
        SENT:    { count: 5, total: 142500 },
        WON:     { count: 12, total: 380000 },
        LOST:    { count: 4, total: 92000  },
        EXPIRED: { count: 2, total: 28000  },
      },
    },
  })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aquí está el resumen de tu negocio hoy
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {new Date().toLocaleDateString('es-MX', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}
        </Badge>
      </div>

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la información del dashboard. Mostrando datos de ejemplo.
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Leads activos"
          value={stats?.totalLeads ?? 0}
          subtitle="Prospectos en seguimiento"
          icon={Users}
          color="purple"
          loading={isLoading}
        />
        <StatCard
          title="Clientes"
          value={stats?.totalCustomers ?? 0}
          subtitle="Leads convertidos"
          icon={UserCheck}
          color="green"
          loading={isLoading}
        />
        <StatCard
          title="Cotizaciones abiertas"
          value={stats?.openQuotesCount ?? 0}
          subtitle={stats ? formatMXN(stats.openQuotesValue) + ' en pipeline' : ''}
          icon={FileText}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Recordatorios hoy"
          value={stats?.todayReminders ?? 0}
          subtitle="Pendientes de atender"
          icon={Bell}
          color={stats && stats.todayReminders > 0 ? 'amber' : 'green'}
          loading={isLoading}
        />
      </div>

      {/* ── Segunda fila ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Cotizaciones por estado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Cotizaciones por estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats && Object.entries(stats.quotesByStatus).map(([status, data]) => {
                  const cfg = STATUS_CONFIG[status as QuoteStatus]
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {data.count} {data.count === 1 ? 'cotización' : 'cotizaciones'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {formatMXN(data.total)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recordatorios del día */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              Recordatorios de hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : stats && stats.todayReminders > 0 ? (
              // Cuando el backend esté listo, aquí mapearás los recordatorios reales.
              // Por ahora mostramos placeholders realistas.
              <div className="space-y-2.5">
                {[
                  { name: 'Ferretería López',    action: 'Llamada de seguimiento', time: '10:00 AM', done: false },
                  { name: 'Constructora Vega',   action: 'Enviar cotización',      time: '12:30 PM', done: false },
                  { name: 'Despacho Martínez',   action: 'Confirmar reunión',      time: '3:00 PM',  done: true  },
                ].map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border ${
                      r.done ? 'bg-muted/40 border-border/40 opacity-60' : 'bg-card border-border'
                    }`}
                  >
                    {r.done
                      ? <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                      : <Clock        size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${r.done ? 'line-through text-muted-foreground' : ''}`}>
                        {r.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{r.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={32} className="text-green-500 mb-2" />
                <p className="text-sm font-medium">¡Todo al día!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No tienes recordatorios pendientes para hoy
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Pipeline visual ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <XCircle size={16} className="text-primary" />
            Resumen del pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : stats && (() => {
            const won  = stats.quotesByStatus.WON?.total  ?? 0
            const sent = stats.quotesByStatus.SENT?.total ?? 0
            const total = won + sent + (stats.quotesByStatus.DRAFT?.total ?? 0)
            if (total === 0) return (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aún no hay cotizaciones registradas
              </p>
            )
            const wonPct  = Math.round((won  / total) * 100)
            const sentPct = Math.round((sent / total) * 100)
            const restPct = 100 - wonPct - sentPct
            return (
              <div className="space-y-3">
                <div className="flex h-4 w-full rounded-full overflow-hidden gap-0.5">
                  {wonPct  > 0 && <div className="bg-green-500 transition-all" style={{ width: `${wonPct}%`  }} />}
                  {sentPct > 0 && <div className="bg-blue-500  transition-all" style={{ width: `${sentPct}%` }} />}
                  {restPct > 0 && <div className="bg-slate-200 transition-all" style={{ width: `${restPct}%` }} />}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                    Ganadas {formatMXN(won)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    En proceso {formatMXN(sent)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
                    Resto {formatMXN(total - won - sent)}
                  </span>
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>

    </div>
  )
}
