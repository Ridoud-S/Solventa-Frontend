// Wrapper estándar de toda respuesta del backend
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

// Page<T> de Spring Data — viene anidado dentro de data en listados
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number          // página actual (0-indexed)
  size: number
  first: boolean
  last: boolean
  empty: boolean
  numberOfElements: number
}

// Error del backend (cuando success: false)
export interface ApiError {
  success: false
  message: string
}
