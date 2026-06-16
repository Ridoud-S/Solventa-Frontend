import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, LoginRequest, RegisterRequest } from '../types'
import { authApi } from '../api/auth'
import { tokenStorage } from '../api/client'

// ── Clave local sólo para el objeto User (los tokens los maneja tokenStorage) ──
const USER_KEY = 'solventa_user'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login:    (data: LoginRequest)    => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout:   () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehidratar sesión al recargar
  useEffect(() => {
    const token      = tokenStorage.getAccess()
    const storedUser = localStorage.getItem(USER_KEY)
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        tokenStorage.clear()
        localStorage.removeItem(USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const persist = (res: { accessToken: string; refreshToken: string; user: User }) => {
    tokenStorage.set(res.accessToken, res.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setUser(res.user)
  }

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data)
    persist(res)
  }

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data)
    persist(res)
  }

  const logout = () => {
    tokenStorage.clear()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
