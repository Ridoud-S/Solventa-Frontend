import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Lock, Mail } from 'lucide-react'
import { useProfile }       from '../../hooks/users/useProfile'
import { useUpdateProfile } from '../../hooks/users/useUpdateProfile'
import { useChangePassword } from '../../hooks/users/useChangePassword'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input }  from '../../components/ui/input'
import { Label }  from '../../components/ui/label'
import { Badge }  from '../../components/ui/badge'

// ── Schemas ───────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Requerido'),
  newPassword:     z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(8, 'Mínimo 8 caracteres'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type ProfileForm  = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile  = useUpdateProfile()
  const changePassword = useChangePassword()

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (profile) profileForm.reset({ name: profile.name })
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Mi perfil</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Administra tu información personal
        </p>
      </div>

      {/* Info del usuario */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User size={22} className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{profile?.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Mail size={12} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{profile?.email}</span>
                <Badge variant="outline" className="text-xs">{profile?.role}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="profile-name">Nombre completo</Label>
              <Input
                id="profile-name"
                {...profileForm.register('name')}
                placeholder="Tu nombre"
              />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Correo electrónico</Label>
              <Input value={profile?.email ?? ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                El correo no se puede cambiar desde aquí
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Cambiar contraseña */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-primary" />
            <CardTitle className="text-base">Cambiar contraseña</CardTitle>
          </div>
          <CardDescription>
            Usa una contraseña segura de al menos 8 caracteres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((d) =>
              changePassword.mutate(
                { currentPassword: d.currentPassword, newPassword: d.newPassword },
                { onSuccess: () => passwordForm.reset() },
              )
            )}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register('newPassword')}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Actualizando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
