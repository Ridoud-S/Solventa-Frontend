import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Pencil, UserCheck, Phone, Mail,
  MessageCircle, Users, Calendar, Plus, CheckCircle2, Trash2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { leadsApi } from '../../api/leads'
import { followUpsApi, remindersApi, type CreateFollowUpDto, type CreateReminderDto } from '../../api/followups'
import type { Lead, FollowUp } from '../../types'
import { LeadStatusBadge, LeadPriorityBadge } from '../../components/leads/LeadStatusBadge'
import LeadFormModal from '../../components/leads/LeadFormModal'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Textarea } from '../../components/ui/textarea'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../../components/ui/select'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '../../components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog'

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_LEAD: Lead = {
  id: '3', name: 'Roberto Vega', company: 'Constructora Vega',
  email: 'rvega@cvega.mx', phone: '55 2345 6789',
  source: 'EMAIL', status: 'QUALIFIED', priority: 'HIGH',
  notes: 'Proyecto de remodelación de oficinas por 2M. Necesita cotización detallada antes del 15 de junio.',
  createdAt: '2026-06-03T08:00:00Z', updatedAt: '2026-06-05T14:00:00Z',
}

const DEMO_FOLLOWUPS: FollowUp[] = [
  { id: 'f1', entityType: 'LEAD', entityId: '3', type: 'EMAIL',    interactionDate: '2026-06-04T10:00:00Z', notes: 'Se envió presentación del servicio por email.', result: 'Respondió con interés, pidió cotización', createdAt: '2026-06-04T10:00:00Z' },
  { id: 'f2', entityType: 'LEAD', entityId: '3', type: 'CALL',     interactionDate: '2026-06-06T16:00:00Z', notes: 'Llamada de 20 minutos para aclarar alcance del proyecto.', result: 'Confirmó presupuesto disponible de 2M', createdAt: '2026-06-06T16:00:00Z' },
  { id: 'f3', entityType: 'LEAD', entityId: '3', type: 'WHATSAPP', interactionDate: '2026-06-09T09:00:00Z', notes: 'Recordatorio de cotización enviada por WhatsApp.', result: 'Dijo que revisará hoy', createdAt: '2026-06-09T09:00:00Z' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const FOLLOWUP_TYPE_CONFIG: Record<FollowUp['type'], { label: string; icon: typeof Phone }> = {
  CALL:     { label: 'Llamada',  icon: Phone          },
  EMAIL:    { label: 'Email',    icon: Mail           },
  MEETING:  { label: 'Reunión',  icon: Users          },
  WHATSAPP: { label: 'WhatsApp', icon: MessageCircle  },
  OTHER:    { label: 'Otro',     icon: Calendar       },
}

const STATUS_ORDER: Lead['status'][] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'DISCARDED']

// ── Schemas ───────────────────────────────────────────────────────────────────
const followUpSchema = z.object({
  type:            z.enum(['CALL', 'EMAIL', 'MEETING', 'WHATSAPP', 'OTHER']),
  interactionDate: z.string().min(1, 'La fecha es requerida'),
  notes:           z.string().min(3, 'Agrega una nota sobre la interacción'),
  result:          z.string().optional(),
})

const reminderSchema = z.object({
  remindAt:    z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(3, 'Describe el recordatorio'),
})

type FollowUpForm  = z.infer<typeof followUpSchema>
type ReminderForm  = z.infer<typeof reminderSchema>

// ══════════════════════════════════════════════════════════════════════════════
export default function LeadDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const [editOpen,        setEditOpen]        = useState(false)
  const [followUpOpen,    setFollowUpOpen]    = useState(false)
  const [reminderOpen,    setReminderOpen]    = useState(false)
  const [convertTarget,   setConvertTarget]   = useState(false)
  const [deleteFollowUp,  setDeleteFollowUp]  = useState<string | null>(null)

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey:        ['lead', id],
    queryFn:         () => leadsApi.getById(id!),
    placeholderData: DEMO_LEAD,
    enabled:         !!id,
  })

  const { data: followUps = [] } = useQuery({
    queryKey:        ['followups', 'LEAD', id],
    queryFn:         () => followUpsApi.getByEntity('LEAD', id!),
    placeholderData: DEMO_FOLLOWUPS,
    enabled:         !!id,
  })

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: (status: Lead['status']) => leadsApi.changeStatus(id!, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lead', id] })
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Estado actualizado')
    },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  const convertMutation = useMutation({
    mutationFn: () => leadsApi.convertToCustomer(id!),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead convertido a cliente')
      navigate(`/customers/${data.customerId}`)
    },
    onError: () => toast.error('No se pudo convertir el lead'),
  })

  const followUpMutation = useMutation({
    mutationFn: (data: CreateFollowUpDto) => followUpsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['followups', 'LEAD', id] })
      toast.success('Seguimiento registrado')
      setFollowUpOpen(false)
      followUpForm.reset()
    },
    onError: () => toast.error('No se pudo registrar el seguimiento'),
  })

  const reminderMutation = useMutation({
    mutationFn: (data: CreateReminderDto) => remindersApi.create(data),
    onSuccess: () => {
      toast.success('Recordatorio creado')
      setReminderOpen(false)
      reminderForm.reset()
    },
    onError: () => toast.error('No se pudo crear el recordatorio'),
  })

  const deleteFollowUpMutation = useMutation({
    mutationFn: (fid: string) => followUpsApi.delete(fid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['followups', 'LEAD', id] })
      toast.success('Seguimiento eliminado')
      setDeleteFollowUp(null)
    },
  })

  // ── Forms ─────────────────────────────────────────────────────────────────────
  const followUpForm = useForm<FollowUpForm>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      type:            'CALL',
      interactionDate: new Date().toISOString().slice(0, 16),
    },
  })

  const reminderForm = useForm<ReminderForm>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      remindAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    },
  })

  const onFollowUpSubmit = (data: FollowUpForm) => {
    followUpMutation.mutate({
      ...data,
      entityType: 'LEAD',
      entityId:   id!,
    })
  }

  const onReminderSubmit = (data: ReminderForm) => {
    reminderMutation.mutate({
      ...data,
      entityType: 'LEAD',
      entityId:   id!,
    })
  }

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (leadLoading && !lead) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (!lead) return (
    <div className="text-center py-20 text-muted-foreground">
      Lead no encontrado.
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-4xl">

      {/* Header */}
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
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditOpen(true)}>
            <Pencil size={14} /> Editar
          </Button>
          {lead.status !== 'CONVERTED' && (
            <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setConvertTarget(true)}>
              <UserCheck size={14} /> Convertir a cliente
            </Button>
          )}
        </div>
      </div>

      {/* Info + Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Datos de contacto */}
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

        {/* Estado y prioridad */}
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
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Cambiar estado</p>
              {STATUS_ORDER.filter((s) => s !== lead.status && s !== 'CONVERTED').map((s) => (
                <button
                  key={s}
                  onClick={() => statusMutation.mutate(s)}
                  disabled={statusMutation.isPending}
                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                >
                  → Marcar como <LeadStatusBadge status={s} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seguimientos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageCircle size={16} className="text-primary" />
              Historial de seguimientos ({followUps.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2"
                onClick={() => setReminderOpen(true)}>
                <Calendar size={14} /> Recordatorio
              </Button>
              <Button size="sm" className="gap-2"
                onClick={() => setFollowUpOpen(true)}>
                <Plus size={14} /> Registrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {followUps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin seguimientos aún</p>
              <p className="text-xs mt-1">Registra la primera interacción con este lead</p>
            </div>
          ) : (
            <div className="space-y-0">
              {[...followUps]
                .sort((a, b) => new Date(b.interactionDate).getTime() - new Date(a.interactionDate).getTime())
                .map((fu, idx) => {
                  const cfg  = FOLLOWUP_TYPE_CONFIG[fu.type]
                  const Icon = cfg.icon
                  return (
                    <div key={fu.id} className="flex gap-3 pb-4 relative">
                      {/* Línea de tiempo */}
                      {idx < followUps.length - 1 && (
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
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                            <button
                              onClick={() => setDeleteFollowUp(fu.id)}
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
                })
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modal: Editar lead ──────────────────────────────────────────────── */}
      <LeadFormModal open={editOpen} onClose={() => setEditOpen(false)} lead={lead} />

      {/* ── Modal: Registrar seguimiento ───────────────────────────────────── */}
      <Dialog open={followUpOpen} onOpenChange={(v) => !v && setFollowUpOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar seguimiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={followUpForm.handleSubmit(onFollowUpSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo *</Label>
                <Select
                  value={followUpForm.watch('type')}
                  onValueChange={(v) => followUpForm.setValue('type', v as FollowUp['type'])}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">Llamada</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="MEETING">Reunión</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Fecha y hora *</Label>
                <Input
                  type="datetime-local"
                  {...followUpForm.register('interactionDate')}
                />
                {followUpForm.formState.errors.interactionDate && (
                  <p className="text-xs text-destructive">
                    {followUpForm.formState.errors.interactionDate.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notas *</Label>
              <Textarea
                placeholder="¿Qué pasó en esta interacción?"
                rows={3}
                {...followUpForm.register('notes')}
              />
              {followUpForm.formState.errors.notes && (
                <p className="text-xs text-destructive">
                  {followUpForm.formState.errors.notes.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Resultado</Label>
              <Input
                placeholder="¿Cómo quedó? ¿Próximo paso?"
                {...followUpForm.register('result')}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFollowUpOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={followUpMutation.isPending}>
                {followUpMutation.isPending ? 'Guardando...' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Recordatorio ─────────────────────────────────────────────── */}
      <Dialog open={reminderOpen} onOpenChange={(v) => !v && setReminderOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear recordatorio</DialogTitle>
          </DialogHeader>
          <form onSubmit={reminderForm.handleSubmit(onReminderSubmit)} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>¿Cuándo? *</Label>
              <Input type="datetime-local" {...reminderForm.register('remindAt')} />
            </div>
            <div className="space-y-1">
              <Label>Descripción *</Label>
              <Textarea
                placeholder="Ej: Llamar para confirmar la cotización"
                rows={2}
                {...reminderForm.register('description')}
              />
              {reminderForm.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {reminderForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReminderOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={reminderMutation.isPending}>
                {reminderMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Convertir a cliente ──────────────────────────────────────── */}
      <AlertDialog open={!!convertTarget} onOpenChange={(v) => !v && setConvertTarget(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Convertir a cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{lead?.name}</strong> pasará a ser un cliente registrado.
              Serás redirigido a su perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => convertTarget && convertMutation.mutate()}
            >
              Convertir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Modal: Eliminar seguimiento ────────────────────────────────────── */}
      <AlertDialog open={!!deleteFollowUp} onOpenChange={(v) => !v && setDeleteFollowUp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar seguimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteFollowUp && deleteFollowUpMutation.mutate(deleteFollowUp)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
