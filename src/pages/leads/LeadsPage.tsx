import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, MoreHorizontal, Eye, Pencil, Trash2, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { leadsApi, type LeadFilters } from '../../api/leads'
import type { Lead } from '../../types'
import { LeadStatusBadge, LeadPriorityBadge } from '../../components/leads/LeadStatusBadge'
import LeadFormModal from '../../components/leads/LeadFormModal'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../../components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog'

// ── Datos de demo (mientras el backend no esté) ────────────────────────────────
const DEMO_LEADS: Lead[] = [
  { id: '1', name: 'Carlos Mendoza',  company: 'Ferretería López',    email: 'carlos@lopez.mx',   phone: '55 1234 5678', source: 'WHATSAPP', status: 'NEW',       priority: 'HIGH',   notes: 'Interesado en cotización de material de construcción', createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-01T10:00:00Z' },
  { id: '2', name: 'Ana Rodríguez',   company: 'Despacho Contable AR', email: 'ana@despacholar.mx', phone: '55 8765 4321', source: 'REFERRAL', status: 'CONTACTED', priority: 'MEDIUM', notes: 'Referida por cliente existente', createdAt: '2026-06-02T09:00:00Z', updatedAt: '2026-06-03T11:00:00Z' },
  { id: '3', name: 'Roberto Vega',    company: 'Constructora Vega',    email: 'rvega@cvega.mx',    phone: '55 2345 6789', source: 'EMAIL',    status: 'QUALIFIED', priority: 'HIGH',   notes: 'Proyecto de 2M. Necesita cotización detallada', createdAt: '2026-06-03T08:00:00Z', updatedAt: '2026-06-05T14:00:00Z' },
  { id: '4', name: 'María Torres',    company: 'Taller Torres',        email: 'mtorres@taller.mx', phone: '55 3456 7890', source: 'PHONE',    status: 'NEW',       priority: 'LOW',    notes: 'Llamó preguntando precios', createdAt: '2026-06-04T15:00:00Z', updatedAt: '2026-06-04T15:00:00Z' },
  { id: '5', name: 'Jorge Fuentes',   company: 'Agencia Fuentes',      email: 'jfuentes@af.mx',    phone: '55 4567 8901', source: 'WEBSITE',  status: 'CONVERTED', priority: 'HIGH',   notes: 'Convertido a cliente el 8 de junio', createdAt: '2026-06-05T10:00:00Z', updatedAt: '2026-06-08T10:00:00Z' },
]

export default function LeadsPage() {
  const navigate   = useNavigate()
  const qc         = useQueryClient()

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [filters,       setFilters]       = useState<LeadFilters>({ page: 0, size: 20 })
  const [search,        setSearch]        = useState('')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editLead,      setEditLead]      = useState<Lead | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<Lead | null>(null)
  const [convertTarget, setConvertTarget] = useState<Lead | null>(null)

  // ── Query ─────────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn:  () => leadsApi.getAll(filters),
    placeholderData: {
      content:       DEMO_LEADS,
      totalElements: DEMO_LEADS.length,
      totalPages:    1,
      number:        0,
      size:          20,
    },
  })

  const leads = data?.content ?? []

  // ── Filtrado local (para demo) ────────────────────────────────────────────────
  const filtered = leads.filter((l) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      l.name.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q)
    )
  })

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead eliminado')
      setDeleteTarget(null)
    },
    onError: () => toast.error('No se pudo eliminar el lead'),
  })

  const convertMutation = useMutation({
    mutationFn: (id: string) => leadsApi.convertToCustomer(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Lead convertido a cliente')
      setConvertTarget(null)
      navigate(`/customers/${data.customerId}`)
    },
    onError: () => toast.error('No se pudo convertir el lead'),
  })

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleEdit    = (lead: Lead) => { setEditLead(lead); setModalOpen(true) }
  const handleNew     = ()           => { setEditLead(null);  setModalOpen(true) }
  const handleClose   = ()           => { setModalOpen(false); setEditLead(null) }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Leads</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.totalElements ?? 0} prospectos registrados
          </p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus size={16} /> Nuevo lead
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, empresa o correo..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={filters.status ?? 'ALL'}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, status: v === 'ALL' ? undefined : v as Lead['status'] }))
          }
        >
          <SelectTrigger className="w-40">
            <Filter size={14} className="mr-2 text-muted-foreground" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="NEW">Nuevo</SelectItem>
            <SelectItem value="CONTACTED">Contactado</SelectItem>
            <SelectItem value="QUALIFIED">Calificado</SelectItem>
            <SelectItem value="CONVERTED">Convertido</SelectItem>
            <SelectItem value="DISCARDED">Descartado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.priority ?? 'ALL'}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, priority: v === 'ALL' ? undefined : v as Lead['priority'] }))
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
            <SelectItem value="MEDIUM">Media</SelectItem>
            <SelectItem value="LOW">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {search ? 'No se encontraron leads con ese criterio.' : 'No hay leads registrados aún.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.company ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{lead.source}</TableCell>
                  <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
                  <TableCell><LeadPriorityBadge priority={lead.priority} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(lead.createdAt).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                          <Eye size={14} className="mr-2" /> Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(lead)}>
                          <Pencil size={14} className="mr-2" /> Editar
                        </DropdownMenuItem>
                        {lead.status !== 'CONVERTED' && (
                          <DropdownMenuItem
                            onClick={() => setConvertTarget(lead)}
                            className="text-green-600"
                          >
                            <UserCheck size={14} className="mr-2" /> Convertir a cliente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(lead)}
                          className="text-destructive"
                        >
                          <Trash2 size={14} className="mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal crear/editar */}
      <LeadFormModal
        open={modalOpen}
        onClose={handleClose}
        lead={editLead}
      />

      {/* Confirm eliminar */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deleteTarget?.name}</strong> de forma permanente.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm convertir */}
      <AlertDialog open={!!convertTarget} onOpenChange={(v) => !v && setConvertTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Convertir a cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{convertTarget?.name}</strong> pasará a ser un cliente registrado.
              Serás redirigido al perfil del nuevo cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => convertTarget && convertMutation.mutate(convertTarget.id)}
            >
              Convertir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
