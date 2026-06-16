import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '../types/api'

// ── Config base ────────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Helpers de token ───────────────────────────────────────────────────────────
const TOKEN_KEY   = 'solventa_access_token'
const REFRESH_KEY = 'solventa_refresh_token'

export const tokenStorage = {
  getAccess:  () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

// ── Request: inyectar JWT ──────────────────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: desempaquetar ApiResponse + refresh automático en 401 ─────────────
let isRefreshing  = false
let refreshQueue: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  // Caso éxito: el backend retorna { success, data } → devolvemos solo data
  (response) => {
    const body = response.data as ApiResponse<unknown>
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = body.data
    }
    return response
  },

  // Caso error
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // ── 401: intentar refresh una vez ─────────────────────────────────────────
    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = tokenStorage.getRefresh()
      if (!refreshToken) {
        tokenStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Ya hay un refresh en curso — encolar este request
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`
            resolve(apiClient(original))
          })
        })
      }

      original._retry = true
      isRefreshing    = true

      try {
        const res = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken },
        )
        const { accessToken, refreshToken: newRefresh } = res.data.data
        tokenStorage.set(accessToken, newRefresh)

        refreshQueue.forEach((cb) => cb(accessToken))
        refreshQueue = []

        original.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(original)
      } catch (refreshError) {
        tokenStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Cualquier otro error: extraer el mensaje del backend si existe
    const apiBody = error.response?.data as ApiResponse<unknown> | undefined
    if (apiBody?.message) {
      ;(error as AxiosError & { backendMessage?: string }).backendMessage = apiBody.message
    }

    return Promise.reject(error)
  },
)

export default apiClient
