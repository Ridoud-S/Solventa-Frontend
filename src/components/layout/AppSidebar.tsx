import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, FileText,
  User, Settings, UsersRound, LogOut,
  ChevronsUpDown, Zap,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../hooks/users/useProfile'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '../ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'

// ── Datos de navegación ───────────────────────────────────────────────────────
const NAV_MAIN = [
  { label: 'Dashboard',    href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Leads',        href: '/leads',      icon: Users            },
  { label: 'Clientes',     href: '/customers',  icon: UserCheck        },
  { label: 'Cotizaciones', href: '/quotes',     icon: FileText         },
]

const NAV_SETTINGS = [
  { label: 'Mi perfil',     href: '/profile',  icon: User       },
  { label: 'Configuración', href: '/settings', icon: Settings   },
  { label: 'Equipo',        href: '/team',     icon: UsersRound },
]

// ── Helper: iniciales ─────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ══════════════════════════════════════════════════════════════════════════════
export function AppSidebar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { logout }   = useAuth()
  const { data: profile } = useProfile()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <Sidebar collapsible="icon">

      {/* ── Header: logo ────────────────────────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link to="/dashboard" />}
              className="hover:bg-sidebar-accent"
            >
              {/* Ícono del logo — cuadrado con la S */}
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Zap className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Solventa</span>
                <span className="truncate text-xs text-muted-foreground">
                  {profile?.companyName ?? 'CRM'}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <SidebarContent>

        {/* Nav principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_MAIN.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link to={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Nav configuración */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_SETTINGS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link to={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* ── Footer: usuario con dropdown ─────────────────────────────────────── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {profile?.name ? getInitials(profile.name) : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile?.name ?? 'Usuario'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {profile?.email ?? ''}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                {/* Info del usuario */}
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                        {profile?.name ? getInitials(profile.name) : '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{profile?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {profile?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Plan */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => navigate('/settings')}
                  >
                    <Zap className="size-4 text-muted-foreground" />
                    <span>Plan {profile?.role === 'ADMIN' ? 'Admin' : 'Seller'}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Acciones */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="size-4 text-muted-foreground" />
                    Mi perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => navigate('/team')}
                  >
                    <UsersRound className="size-4 text-muted-foreground" />
                    Equipo
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="size-4" />
                  Cerrar sesión
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
