import { useNavigate } from 'react-router-dom'
import {
  Users, UserCheck, FileText, Bell,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { useAuth }              from '../../context/AuthContext'
import { useDashboardStats }    from '../../hooks/dashboard/useDashboardStats'
import { useTodayReminders }    from '../../hooks/reminders/useReminders'
import { useCompleteReminder }  from '../../hooks/reminders/useCompleteReminder'
import StatCard                 from '../../components/dashboard/StatCard'
import { Badge }                from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button }               from '../../components/ui/button'
import type { QuoteStatus }     from '../../types'

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatMXN = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string }> = {
  DRAFT:   { label: 'Borrador', color: 'bg-slate-100  text-slate-700' },
  SENT:    { label: 'Enviada',  color: 'bg-blue-100   text-blue-700'  },
  WON:     { label: 'Ganada',   color: 'bg-green-100  text-green-700' },
  LOST:    { label: 'Perdida',  color: 'bg-red-100    text-red-700'   },
  EXPIRED: { label: 'Vencida',  color: 'bg-amber-100  text-amber-700' },
}

const STATUS_ORDER: QuoteStatus[] = ['DRAFT', 'SENT', 'WON', 'LOST', 'EXPIRED']

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded ${className}`} />
}

// ══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: stats, isLoading, isError }           = useDashboardStats()
  const { data: reminders = [], isLoading: remindersLoading } = useTodayReminders()
  const completeReminder = useCompleteReminder()

  // ── Saludo ────────────────────────────────────────────────────────────────
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  // ── Pipeline chart ────────────────────────────────────────────────────────
  const wonTotal  = stats?.quotesByStatus?.WON?.total   ?? 0
  const sentTotal = stats?.quotesByStatus?.SENT?.total  ?? 0
  const draftTotal= stats?.quotesByStatus?.DRAFT?.total ?? 0
  const pipelineTotal = wonTotal + sentTotal + draftTotal

  const wonPct  = pipelineTotal > 0 ? Math.round((wonTotal  / pipelineTotal) * 100) : 0
  const sentPct = pipelineTotal > 0 ? Math.round((sentTotal / pipelineTotal) * 100) : 0
  const restPct = Math.max(0, 100 - wonPct - sentPct)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
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
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </Badge>
      </div>

      {/* Error de conexión */}
      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} />
          No se pudo cargar la información. Verifica que el backend esté corriendo.
        </div>
      )}

      {/* Stat cards */}
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
          subtitle="Relaciones comerciales activas"
          icon={UserCheck}
          color="green"
          loading={isLoading}
        />
        <StatCard
          title="Pipeline abierto"
          value={stats?.openQuotesCount ?? 0}
          subtitle={stats ? `${formatMXN(stats.openQuotesValue)} en juego` : ''}
          icon={FileText}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Recordatorios hoy"
          value={stats?.todayReminders ?? 0}
          subtitle={
            (stats?.todayReminders ?? 0) > 0
              ? 'Pendientes de atender'
              : 'Al día — sin pendientes'
          }
          icon={Bell}
          color={(stats?.todayReminders ?? 0) > 0 ? 'amber' : 'green'}
          loading={isLoading}
        />
      </div>

      {/* Segunda fila: cotizaciones + recordatorios */}
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
                  <div key={i} className="flex items-center justify-between gap-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {STATUS_ORDER.map((status) => {
                  const data = stats?.quotesByStatus?.[status]
                  const cfg  = STATUS_CONFIG[status]
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 px-1 rounded hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/quotes?status=${status}`)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {data?.count ?? 0}{' '}
                          {(data?.count ?? 0) === 1 ? 'cotización' : 'cotizaciones'}
                        </span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {formatMXN(data?.total ?? 0)}
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                Recordatorios de hoy
              </CardTitle>
              {reminders.filter((r) => !r.isDone).length > 0 && (
                <Badge className="text-xs">
                  {reminders.filter((r) => !r.isDone).length} pendientes
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {remindersLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={32} className="text-green-500 mb-2" />
                <p className="text-sm font-medium">¡Todo al día!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No tienes recordatorios pendientes para hoy
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...reminders]
                  .sort((a, b) => Number(a.isDone) - Number(b.isDone))
                  .map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                        r.isDone
                          ? 'bg-muted/40 border-border/40 opacity-60'
                          : 'bg-card border-border'
                      }`}
                    >
                      {/* Botón completar */}
                      <button
                        onClick={() => !r.isDone && completeReminder.mutate(r.id)}
                        disabled={r.isDone || completeReminder.isPending}
                        className="shrink-0 mt-0.5"
                        title={r.isDone ? 'Completado' : 'Marcar como completado'}
                      >
                        {r.isDone
                          ? <CheckCircle2 size={16} className="text-green-500" />
                          : <Clock size={16} className="text-amber-500 hover:text-green-500 transition-colors" />
                        }
                      </button>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${r.isDone ? 'line-through text-muted-foreground' : ''}`}>
                          {r.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(r.remindAt).toLocaleTimeString('es-MX', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Link al lead o cliente */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 shrink-0 px-2"
                        onClick={() => navigate(
                          r.entityType === 'LEAD'
                            ? `/leads/${r.entityId}`
                            : `/customers/${r.entityId}`
                        )}
                      >
                        Ver
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Pipeline visual — solo si hay datos */}
      {!isLoading && pipelineTotal > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                Resumen del pipeline
              </CardTitle>
              <span className="text-sm font-normal text-muted-foreground">
                Total: {formatMXN(pipelineTotal)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">

            {/* Barra proporcional */}
            <div className="flex h-3 w-full rounded-full overflow-hidden gap-0.5">
              {wonPct  > 0 && (
                <div className="bg-green-500 transition-all rounded-full" style={{ width: `${wonPct}%` }} />
              )}
              {sentPct > 0 && (
                <div className="bg-blue-500 transition-all rounded-full"  style={{ width: `${sentPct}%` }} />
              )}
              {restPct > 0 && (
                <div className="bg-muted transition-all rounded-full" style={{ width: `${restPct}%` }} />
              )}
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shrink-0" />
                Ganadas · {formatMXN(wonTotal)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shrink-0" />
                En proceso · {formatMXN(sentTotal)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20 inline-block shrink-0" />
                Borradores · {formatMXN(draftTotal)}
              </span>
            </div>

            {/* Accesos rápidos */}
            <div className="flex gap-2 pt-1 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/leads')}
              >
                Ver leads
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/quotes?status=SENT')}
              >
                Cotizaciones enviadas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/quotes')}
              >
                Todas las cotizaciones
              </Button>
            </div>

          </CardContent>
        </Card>
      )}

    </div>
  )
}
