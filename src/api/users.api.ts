import apiClient from './client'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  tenantId: string
  companyName: string
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'SELLER'
  isActive: boolean
  invitationAccepted: boolean
  createdAt: string
}

export interface CompanyInfo {
  id: string
  name: string
  industry?: string
  rfc?: string
  logoUrl?: string
  plan: string
  status: string
}

export interface UpdateProfileDto  { name: string }
export interface ChangePasswordDto { currentPassword: string; newPassword: string }
export interface UpdateCompanyDto  { name: string; industry?: string; rfc?: string }
export interface InviteUserDto     { name: string; email: string; role: 'ADMIN' | 'SELLER' }

export const usersApi = {
  // Perfil
  getMe:          () => apiClient.get<UserProfile>('/users/me').then(r => r.data),
  updateMe:       (d: UpdateProfileDto) => apiClient.put<UserProfile>('/users/me', d).then(r => r.data),
  changePassword: (d: ChangePasswordDto) => apiClient.put<void>('/users/me/password', d).then(r => r.data),

  // Empresa
  getCompany:    () => apiClient.get<CompanyInfo>('/company').then(r => r.data),
  updateCompany: (d: UpdateCompanyDto) => apiClient.put<CompanyInfo>('/company', d).then(r => r.data),

  // Equipo
  getTeam:        () => apiClient.get<TeamMember[]>('/users').then(r => r.data),
  inviteUser:     (d: InviteUserDto) => apiClient.post<TeamMember>('/users/invite', d).then(r => r.data),
  deactivateUser: (id: string) => apiClient.patch<TeamMember>(`/users/${id}/deactivate`).then(r => r.data),
  activateUser:   (id: string) => apiClient.patch<TeamMember>(`/users/${id}/activate`).then(r => r.data),
}
