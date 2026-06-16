import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Building2 } from 'lucide-react'
import type { Customer } from '../../types'
import { useCustomers } from '../../hooks/customers/useCustomers'
import { useDeleteCustomer } from '../../hooks/customers/useDeleteCustomer'
import CustomerFormModal from '../../components/customers/CustomerFormModal'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
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
import { Badge } from '../../components/ui/badge'

export default function CustomersPage() {
  const navigate = useNavigate()

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('')
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useCustomers({
    q: search || undefined,
    page: 0,
    size: 20,
  })
  const deleteCustomer = useDeleteCustomer()

  const customers = data?.content ?? []

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleNew   = ()              => { setEditCustomer(null); setModalOpen(true) }
  const handleEdit  = (c: Customer)  => { setEditCustomer(c);    setModalOpen(true) }
  const handleClose = ()              => { setModalOpen(false);   setEditCustomer(null) }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteCustomer.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Clientes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.totalElements ?? 0} clientes registrados
            {isFetching && !isLoading && (
              <span className="ml-2 animate-pulse">· Actualizando…</span>
            )}
          </p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus size={16} /> Nuevo cliente
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, empresa o correo..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {search
                    ? 'No se encontraron clientes con ese criterio.'
                    : 'No hay clientes registrados aún.'}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => navigate(`/customers/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.company ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{c.email ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{c.phone ?? '—'}</TableCell>
                  <TableCell>
                    {c.leadId ? (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Building2 size={11} /> Lead convertido
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Directo</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(c.createdAt).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/customers/${c.id}`)}>
                          <Eye size={14} className="mr-2" /> Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(c)}>
                          <Pencil size={14} className="mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(c)}
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
      <CustomerFormModal
        open={modalOpen}
        onClose={handleClose}
        customer={editCustomer}
      />

      {/* Confirm eliminar */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deleteTarget?.name}</strong>. Las cotizaciones
              y seguimientos asociados se conservarán para historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteCustomer.isPending}
            >
              {deleteCustomer.isPending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
