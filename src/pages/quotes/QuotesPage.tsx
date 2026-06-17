import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus, Search, Filter, MoreHorizontal, Eye, Trash2,
} from 'lucide-react'
import type { Quote, QuoteStatus } from '../../types'
import { useQuotes } from '../../hooks/quotes/useQuotes'
import { useDeleteQuote } from '../../hooks/quotes/useDeleteQuote'
import { QuoteStatusBadge } from '../../components/quotes/QuoteStatusBadge'
import QuoteFormModal from '../../components/quotes/QuoteFormModal'
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

const formatMXN = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

export default function QuotesPage() {
  const navigate = useNavigate()

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = (searchParams.get('status') as QuoteStatus | null) ?? 'ALL'

  const [search,       setSearch]       = useState('')
  const [modalOpen,    setModalOpen]    = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null)

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuotes({
    q:      search || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page: 0,
    size: 20,
  })
  const deleteQuote = useDeleteQuote()

  const quotes = data?.content ?? []

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteQuote.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Cotizaciones</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.totalElements ?? 0} cotizaciones registradas
            {isFetching && !isLoading && (
              <span className="ml-2 animate-pulse">· Actualizando…</span>
            )}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus size={16} /> Nueva cotización
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o cliente..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            if (v === 'ALL') {
              searchParams.delete('status')
            } else {
              searchParams.set('status', v)
            }
            setSearchParams(searchParams)
          }}
        >
          <SelectTrigger className="w-40">
            <Filter size={14} className="mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="DRAFT">Borrador</SelectItem>
            <SelectItem value="SENT">Enviada</SelectItem>
            <SelectItem value="WON">Ganada</SelectItem>
            <SelectItem value="LOST">Perdida</SelectItem>
            <SelectItem value="EXPIRED">Vencida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead>Creada</TableHead>
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
            ) : quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {search || statusFilter !== 'ALL'
                    ? 'No se encontraron cotizaciones.'
                    : 'No hay cotizaciones registradas aún.'}
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((q) => (
                <TableRow
                  key={q.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => navigate(`/quotes/${q.id}`)}
                >
                  <TableCell className="font-medium max-w-48 truncate">{q.title}</TableCell>
                  <TableCell className="text-muted-foreground">{q.customer.name}</TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={q.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMXN(q.total)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(q.expiresAt).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(q.createdAt).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={15} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/quotes/${q.id}`)}>
                          <Eye size={14} className="mr-2" /> Ver detalle
                        </DropdownMenuItem>
                        {q.status === 'DRAFT' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(q)}
                              className="text-destructive"
                            >
                              <Trash2 size={14} className="mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal crear */}
      <QuoteFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Confirm eliminar */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{deleteTarget?.title}</strong>. Solo se
              pueden eliminar cotizaciones en borrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteQuote.isPending}
            >
              {deleteQuote.isPending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
