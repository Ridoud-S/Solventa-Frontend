import apiClient from './client'
import type { FollowUp, Reminder, EntityType } from '../types'

// ── FollowUps DTOs ─────────────────────────────────────────────────────────────
export interface CreateFollowUpDto {
  entityType: EntityType
  entityId: string
  type: FollowUp['type']
  interactionDate: string
  notes: string
  result?: string
}

// ── Reminders DTOs ─────────────────────────────────────────────────────────────
export interface CreateReminderDto {
  entityType: EntityType
  entityId: string
  remindAt: string
  description: string
}

// ── FollowUps API ──────────────────────────────────────────────────────────────
export const followUpsApi = {
  listByEntity: (entityType: EntityType, entityId: string) =>
    apiClient
      .get<FollowUp[]>('/follow-ups', { params: { entityType, entityId } })
      .then((r) => r.data),

  create: (data: CreateFollowUpDto) =>
    apiClient.post<FollowUp>('/follow-ups', data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<void>(`/follow-ups/${id}`).then((r) => r.data),
}

// ── Reminders API ──────────────────────────────────────────────────────────────
export const remindersApi = {
  listByEntity: (entityType: EntityType, entityId: string) =>
    apiClient
      .get<Reminder[]>('/reminders', { params: { entityType, entityId } })
      .then((r) => r.data),

  today: () =>
    apiClient.get<Reminder[]>('/reminders/today').then((r) => r.data),

  create: (data: CreateReminderDto) =>
    apiClient.post<Reminder>('/reminders', data).then((r) => r.data),

  complete: (id: string) =>
    apiClient.patch<Reminder>(`/reminders/${id}/complete`).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<void>(`/reminders/${id}`).then((r) => r.data),
}
