import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Badge } from '../ui/badge'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/leads':      'Leads',
  '/customers':  'Clientes',
  '/quotes':     'Cotizaciones',
  '/settings':   'Configuración',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const title = PAGE_TITLES[pathname] ?? 'Solventa'

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'}>
          {user?.role === 'ADMIN' ? 'Admin' : 'Vendedor'}
        </Badge>
        <span className="text-sm text-muted-foreground">{user?.name}</span>
      </div>
    </header>
  )
}
