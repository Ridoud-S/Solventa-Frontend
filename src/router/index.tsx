import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

import AppLayout from '../components/layout/AppLayout'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import LeadsPage from '../pages/leads/LeadsPage'
import CustomersPage from '../pages/customers/CustomersPage'
import QuotesPage from '../pages/quotes/QuotesPage'
import LeadDetailPage from '../pages/leads/LeadDetailPage'
import NotFoundPage from '../pages/NotFoundPage'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export const router = createBrowserRouter([
  // ── Rutas públicas ──────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/register',
    element: <PublicRoute><RegisterPage /></PublicRoute>,
  },
  {
    path: '/forgot-password',
    element: <PublicRoute><ForgotPasswordPage /></PublicRoute>,
  },
  // ── Rutas protegidas ────────────────────────────────────────────────────────
  {
    path: '/',
    element: <PrivateRoute><AppLayout /></PrivateRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'leads', element: <LeadsPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'quotes', element: <QuotesPage /> },
      { path: 'leads/:id', element: <LeadDetailPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
