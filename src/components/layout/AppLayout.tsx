import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '../ui/sidebar'
import { Separator } from '../ui/separator'
import { useLocation } from 'react-router-dom'

// ── Títulos por ruta ──────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/leads':      'Leads',
  '/customers':  'Clientes',
  '/quotes':     'Cotizaciones',
  '/profile':    'Mi perfil',
  '/settings':   'Configuración',
  '/team':       'Equipo',
}

function usePageTitle() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  return PAGE_TITLES[base] ?? 'Solventa'
}

export default function AppLayout() {
  const title = usePageTitle()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>

        {/* ── Topbar ──────────────────────────────────────────────────────── */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium text-foreground">{title}</h1>
        </header>

        {/* ── Contenido ───────────────────────────────────────────────────── */}
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>

      </SidebarInset>
    </SidebarProvider>
  )
}
