import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads',     icon: Users,           label: 'Leads'     },
  { to: '/customers', icon: UserCheck,       label: 'Clientes'  },
  { to: '/quotes',    icon: FileText,        label: 'Cotizaciones' },
]

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

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
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
        ))}
      </nav>

      <Separator />

      {/* Footer: usuario + logout */}
      <div className="p-4 space-y-3">
        <div className="px-1">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <NavLink to="/settings" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Settings size={14} /> Config
            </Button>
          </NavLink>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-2"
          >
            <LogOut size={14} />
          </Button>
        </div>
      </div>
    </aside>
  )
}
