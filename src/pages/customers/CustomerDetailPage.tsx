import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog'

// Hooks
import { useCustomer }      from '../../hooks/customers/useCustomer'
import { useFollowUps }     from '../../hooks/follow-ups/useFollowUps'
import { useDeleteFollowUp } from '../../hooks/follow-ups/useDeleteFollowUp'

// Componentes propios de Customer
import CustomerFormModal from '../../components/customers/CustomerFormModal'
import CustomerHeader    from '../../components/customers/detail/CustomerHeader'
import CustomerInfoCard  from '../../components/customers/detail/CustomerInfoCard'

// Componentes reusables de Leads
import FollowUpsTimeline from '../../components/leads/detail/FollowUpsTimeline'
import FollowUpFormModal from '../../components/leads/detail/FollowUpFormModal'
import ReminderFormModal from '../../components/reminders/ReminderFormModal'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()

  // ── Modales ──────────────────────────────────────────────────────────────────
  const [editOpen,       setEditOpen]       = useState(false)
  const [followUpOpen,   setFollowUpOpen]   = useState(false)
  const [reminderOpen,   setReminderOpen]   = useState(false)
  const [deleteFollowUp, setDeleteFollowUp] = useState<string | null>(null)

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: customer, isLoading }                       = useCustomer(id)
  const { data: followUps = [], isLoading: fuLoading }      = useFollowUps('CUSTOMER', id)
  const deleteFollowUpMutation = useDeleteFollowUp({
    entityType: 'CUSTOMER',
    entityId:   id ?? '',
  })

  // ── Loading / not found ───────────────────────────────────────────────────────
  if (isLoading && !customer) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Cliente no encontrado.
      </div>
    )
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleDeleteFollowUp = () => {
    if (!deleteFollowUp) return
    deleteFollowUpMutation.mutate(deleteFollowUp, {
      onSuccess: () => setDeleteFollowUp(null),
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-4xl">

      <CustomerHeader
        customer={customer}
        onEdit={() => setEditOpen(true)}
      />

      <CustomerInfoCard customer={customer} />

      <FollowUpsTimeline
        followUps={followUps}
        isLoading={fuLoading}
        onAddFollowUp={() => setFollowUpOpen(true)}
        onAddReminder={() => setReminderOpen(true)}
        onDeleteFollowUp={(id) => setDeleteFollowUp(id)}
      />

      {/* ── Modales ──────────────────────────────────────────────────────────── */}
      <CustomerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        customer={customer}
      />

      <FollowUpFormModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        entityType="CUSTOMER"
        entityId={customer.id}
      />

      <ReminderFormModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        entityType="CUSTOMER"
        entityId={customer.id}
      />

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
