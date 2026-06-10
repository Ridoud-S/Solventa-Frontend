// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  companyName: string
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// ── User ──────────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'SELLER'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  tenantId: string
}

// ── Lead ──────────────────────────────────────────────────────────────────────
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'DISCARDED'
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type LeadSource = 'WHATSAPP' | 'EMAIL' | 'REFERRAL' | 'WEBSITE' | 'PHONE' | 'OTHER'

export interface Lead {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  source: LeadSource
  status: LeadStatus
  priority: LeadPriority
  assignedTo?: User
  notes?: string
  createdAt: string
  updatedAt: string
}

// ── Customer ──────────────────────────────────────────────────────────────────
export interface Customer {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  assignedTo?: User
  leadId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// ── Quote ─────────────────────────────────────────────────────────────────────
export type QuoteStatus = 'DRAFT' | 'SENT' | 'WON' | 'LOST' | 'EXPIRED'

export interface QuoteLine {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Quote {
  id: string
  customerId: string
  customer?: Customer
  title: string
  status: QuoteStatus
  lines: QuoteLine[]
  discountPct: number
  taxPct: number
  subtotal: number
  total: number
  issuedAt: string
  expiresAt: string
  notes?: string
  createdAt: string
}

// ── FollowUp ──────────────────────────────────────────────────────────────────
export type FollowUpType = 'CALL' | 'EMAIL' | 'MEETING' | 'WHATSAPP' | 'OTHER'
export type EntityType = 'LEAD' | 'CUSTOMER'

export interface FollowUp {
  id: string
  entityType: EntityType
  entityId: string
  type: FollowUpType
  interactionDate: string
  notes: string
  result?: string
  createdAt: string
}

export interface Reminder {
  id: string
  entityType: EntityType
  entityId: string
  remindAt: string
  description: string
  isDone: boolean
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalLeads: number
  totalCustomers: number
  openQuotesCount: number
  openQuotesValue: number
  todayReminders: number
  quotesByStatus: Record<QuoteStatus, { count: number; total: number }>
}

// ── API helpers ───────────────────────────────────────────────────────────────
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ApiError {
  message: string
  status: number
  timestamp: string
}
