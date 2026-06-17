import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Settings,
  LogOut,
  User,
  UsersRound,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/leads',     icon: Users,           label: 'Leads'         },
  { to: '/customers', icon: UserCheck,       label: 'Clientes'      },
  { to: '/quotes',    icon: FileText,        label: 'Cotizaciones'  },
]

const SETTINGS_ITEMS = [
  { to: '/profile',  icon: User,        label: 'Mi perfil'     },
  { to: '/settings', icon: Settings,    label: 'Configuración' },
  { to: '/team',     icon: UsersRound,  label: 'Equipo'        },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-60 border-r bg-card flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-semibold text-lg tracking-tight">
          <span className="text-primary">Solv</span>enta
        </span>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} />
        ))}
      </nav>

      <Separator />

      {/* Sección configuración */}
      <div className="px-3 py-3 space-y-1">
        <p className="text-xs font-medium text-muted-foreground px-3 pb-1 uppercase tracking-wider">
          Cuenta
        </p>
        {SETTINGS_ITEMS.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} />
        ))}
      </div>

      <Separator />

      {/* Footer: usuario + logout */}
      <div className="p-4 space-y-3">
        <div className="px-1">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full gap-2"
        >
          <LogOut size={14} /> Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
