import { request } from './http'

export interface UserItem {
  id: number
  account?: string
  name: string
  gender?: number
  avatar?: string
  isAdmin: number
  rating: number
  gamesPlayed: number
  winCount: number
  lossCount: number
  createTime?: string
}

export function listUsers(): Promise<UserItem[]> {
  return request<UserItem[]>('/users')
}

export function setAdmin(id: number, admin: boolean): Promise<UserItem> {
  return request<UserItem>(`/users/${id}/admin?admin=${admin}`, { method: 'PUT' })
}
