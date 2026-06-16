import { AxiosError } from 'axios'

/**
 * Extrae el mensaje del backend (ApiResponse.message) o cae a un fallback.
 * Funciona porque el interceptor de client.ts pone backendMessage en el error.
 */
export function extractError(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const withMsg = error as AxiosError & { backendMessage?: string }
    if (withMsg.backendMessage) return withMsg.backendMessage

    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}
