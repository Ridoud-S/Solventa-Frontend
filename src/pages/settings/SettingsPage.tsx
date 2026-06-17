import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2 } from 'lucide-react'
import { useCompany }       from '../../hooks/users/useProfile'
import { useUpdateCompany } from '../../hooks/users/useUpdateCompany'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input }  from '../../components/ui/input'
import { Label }  from '../../components/ui/label'
import { Badge }  from '../../components/ui/badge'

const schema = z.object({
  name:     z.string().min(2, 'El nombre es requerido'),
  industry: z.string().optional(),
  rfc:      z.string().max(13, 'RFC máximo 13 caracteres').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const PLAN_COLORS: Record<string, string> = {
  FREE:         'bg-slate-100 text-slate-700',
  BASIC:        'bg-blue-100  text-blue-700',
  PROFESSIONAL: 'bg-purple-100 text-purple-700',
}

export default function SettingsPage() {
  const { data: company, isLoading } = useCompany()
  const updateCompany = useUpdateCompany()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (company) {
      reset({
        name:     company.name,
        industry: company.industry ?? '',
        rfc:      company.rfc      ?? '',
      })
    }
  }, [company]) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-24 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">

      <div>
        <h2 className="text-2xl font-semibold">Configuración</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Datos de tu empresa
        </p>
      </div>

      {/* Plan actual */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Plan actual</p>
              <p className="text-lg font-semibold mt-0.5">{company?.plan ?? '—'}</p>
            </div>
            <Badge className={`text-sm px-3 py-1 ${PLAN_COLORS[company?.plan ?? 'FREE'] ?? PLAN_COLORS.FREE}`}>
              {company?.plan ?? 'FREE'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Para cambiar de plan contacta a soporte en{' '}
            <a href="mailto:hola@solventaio.com" className="underline underline-offset-2">
              hola@solventaio.com
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Datos de la empresa */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-primary" />
            <CardTitle className="text-base">Información de la empresa</CardTitle>
          </div>
          <CardDescription>
            Estos datos aparecerán en tus cotizaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((d) => updateCompany.mutate({
              ...d,
              rfc:      d.rfc      || undefined,
              industry: d.industry || undefined,
            }))}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="company-name">Nombre de la empresa *</Label>
              <Input
                id="company-name"
                {...register('name')}
                placeholder="Mi Empresa SA de CV"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="industry">Industria</Label>
                <Input
                  id="industry"
                  {...register('industry')}
                  placeholder="Comercio, Construcción..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  {...register('rfc')}
                  maxLength={13}
                  placeholder="ABC850315XY1"
                />
                {errors.rfc && (
                  <p className="text-xs text-destructive">{errors.rfc.message}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={updateCompany.isPending}>
                {updateCompany.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
