import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, MoreHorizontal, ShieldCheck, User } from 'lucide-react'
import { useTeam }                          from '../../hooks/users/useProfile'
import { useInviteUser, useToggleUser }     from '../../hooks/users/useTeamActions'
import type { TeamMember }                  from '../../api/users.api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button }   from '../../components/ui/button'
import { Input }    from '../../components/ui/input'
import { Label }    from '../../components/ui/label'
import { Badge }    from '../../components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '../../components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../../components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name:  z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Correo inválido'),
  role:  z.enum(['ADMIN', 'SELLER']),
})

type FormData = z.infer<typeof schema>

export default function TeamPage() {
  const [inviteOpen,   setInviteOpen]   = useState(false)
  const [toggleTarget, setToggleTarget] = useState<TeamMember | null>(null)

  const { data: team = [], isLoading } = useTeam()
  const inviteUser = useInviteUser()
  const toggleUser = useToggleUser()

  const { register, handleSubmit, watch, setValue, reset,
          formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'SELLER' },
  })

  const onSubmit = (data: FormData) => {
    inviteUser.mutate(data, {
      onSuccess: () => { reset(); setInviteOpen(false) },
    })
  }

  const handleToggle = () => {
    if (!toggleTarget) return
    toggleUser.mutate(
      { id: toggleTarget.id, active: !toggleTarget.isActive },
      { onSuccess: () => setToggleTarget(null) },
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Equipo</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {team.length} {team.length === 1 ? 'miembro' : 'miembros'}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setInviteOpen(true)}>
          <UserPlus size={16} /> Invitar usuario
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Miembros del equipo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : team.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <User size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay miembros en el equipo</p>
            </div>
          ) : (
            <div>
              {team.map((member, idx) => (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${
                    idx < team.length - 1 ? 'border-b border-border/50' : ''
                  } ${!member.isActive ? 'opacity-50' : ''}`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {member.role === 'ADMIN'
                      ? <ShieldCheck size={16} className="text-primary" />
                      : <User size={16} className="text-primary" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      {!member.isActive && (
                        <Badge variant="outline" className="text-xs">Inactivo</Badge>
                      )}
                      {!member.invitationAccepted && member.isActive && (
                        <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>

                  {/* Rol */}
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${
                      member.role === 'ADMIN'
                        ? 'border-purple-200 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {member.role === 'ADMIN' ? 'Admin' : 'Vendedor'}
                  </Badge>

                  {/* Acciones */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal size={15} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setToggleTarget(member)}
                        className={member.isActive ? 'text-destructive' : 'text-green-600'}
                      >
                        {member.isActive ? 'Desactivar usuario' : 'Reactivar usuario'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal invitar */}
      <Dialog open={inviteOpen} onOpenChange={(v) => !v && setInviteOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invitar usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nombre *</Label>
              <Input placeholder="Ana Martínez" {...register('name')} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Correo *</Label>
              <Input
                type="email"
                placeholder="ana@miempresa.mx"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Rol *</Label>
              <Select
                value={watch('role')}
                onValueChange={(v) => setValue('role', v as 'ADMIN' | 'SELLER')}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELLER">Vendedor</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Se creará el usuario y la contraseña temporal aparecerá en los logs del servidor.
              Cuando integres email, se enviará automáticamente.
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { reset(); setInviteOpen(false) }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteUser.isPending}>
                {inviteUser.isPending ? 'Invitando...' : 'Invitar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm toggle */}
      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={(v) => !v && setToggleTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.isActive ? '¿Desactivar usuario?' : '¿Reactivar usuario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.isActive
                ? `${toggleTarget?.name} no podrá iniciar sesión hasta que lo reactives.`
                : `${toggleTarget?.name} podrá volver a iniciar sesión.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggle}
              disabled={toggleUser.isPending}
              className={toggleTarget?.isActive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-green-600 text-white hover:bg-green-700'
              }
            >
              {toggleTarget?.isActive ? 'Desactivar' : 'Reactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
