import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog'

// Hooks
import { useLead }            from '../../hooks/leads/useLead'
import { useConvertLead }     from '../../hooks/leads/useConvertLead'
import { useFollowUps }       from '../../hooks/follow-ups/useFollowUps'
import { useDeleteFollowUp }  from '../../hooks/follow-ups/useDeleteFollowUp'

// Componentes
import LeadFormModal      from '../../components/leads/LeadFormModal'
import LeadHeader         from '../../components/leads/detail/LeadHeader'
import LeadInfoCard       from '../../components/leads/detail/LeadInfoCard'
import LeadStatusCard     from '../../components/leads/detail/LeadStatusCard'
import FollowUpsTimeline  from '../../components/leads/detail/FollowUpsTimeline'
import FollowUpFormModal  from '../../components/leads/detail/FollowUpFormModal'
import ReminderFormModal  from '../../components/reminders/ReminderFormModal'

export default function LeadDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  // ── Modales ──────────────────────────────────────────────────────────────────
  const [editOpen,       setEditOpen]       = useState(false)
  const [followUpOpen,   setFollowUpOpen]   = useState(false)
  const [reminderOpen,   setReminderOpen]   = useState(false)
  const [convertOpen,    setConvertOpen]    = useState(false)
  const [deleteFollowUp, setDeleteFollowUp] = useState<string | null>(null)

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: lead, isLoading }                       = useLead(id)
  const { data: followUps = [], isLoading: fuLoading }  = useFollowUps('LEAD', id)
  const convertLead            = useConvertLead()
  const deleteFollowUpMutation = useDeleteFollowUp({ entityType: 'LEAD', entityId: id ?? '' })

  // ── Loading / not found ───────────────────────────────────────────────────────
  if (isLoading && !lead) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Lead no encontrado.
      </div>
    )
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleConvert = () => {
    convertLead.mutate(lead.id, {
      onSuccess: (data) => {
        setConvertOpen(false)
        navigate(`/customers/${data.customerId}`)
      },
    })
  }

  const handleDeleteFollowUp = () => {
    if (!deleteFollowUp) return
    deleteFollowUpMutation.mutate(deleteFollowUp, {
      onSuccess: () => setDeleteFollowUp(null),
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-4xl">

      <LeadHeader
        lead={lead}
        onEdit={() => setEditOpen(true)}
        onConvert={() => setConvertOpen(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LeadInfoCard lead={lead} />
        <LeadStatusCard lead={lead} />
      </div>

      <FollowUpsTimeline
        followUps={followUps}
        isLoading={fuLoading}
        onAddFollowUp={() => setFollowUpOpen(true)}
        onAddReminder={() => setReminderOpen(true)}
        onDeleteFollowUp={(id) => setDeleteFollowUp(id)}
      />

      {/* ── Modales ──────────────────────────────────────────────────────────── */}
      <LeadFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        lead={lead}
      />

      <FollowUpFormModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        entityType="LEAD"
        entityId={lead.id}
      />

      <ReminderFormModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        entityType="LEAD"
        entityId={lead.id}
      />

      {/* Confirm: convertir a cliente */}
      <AlertDialog open={convertOpen} onOpenChange={setConvertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Convertir a cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{lead.name}</strong> pasará a ser un cliente registrado y
              serás redirigido a su perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={handleConvert}
              disabled={convertLead.isPending}
            >
              {convertLead.isPending ? 'Convirtiendo…' : 'Convertir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm: eliminar seguimiento */}
      <AlertDialog
        open={!!deleteFollowUp}
        onOpenChange={(v) => !v && setDeleteFollowUp(null)}
      >
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
              className="bg-destructive text-destructive-foreground"
              onClick={handleDeleteFollowUp}
              disabled={deleteFollowUpMutation.isPending}
            >
              {deleteFollowUpMutation.isPending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
