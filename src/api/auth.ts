import { request } from './http'

/** 注册 / 登录 / 我的信息 的统一返回结构 */
export interface AuthResult {
  /** 仅注册、登录时返回；/auth/me 返回 null */
  token: string | null
  userId: number
  name: string
  /** 1男 2女 0未知 */
  gender: number
  college: string | null
  rating: number
  gamesPlayed: number
}

export interface LoginPayload {
  studentNo: string
  password: string
}

export interface RegisterPayload {
  studentNo: string
  name: string
  /** 1男 2女 */
  gender: number
  college?: string
  password: string
}

export function login(payload: LoginPayload): Promise<AuthResult> {
  return request<AuthResult>('/auth/login', { method: 'POST', body: payload })
}

export function register(payload: RegisterPayload): Promise<AuthResult> {
  return request<AuthResult>('/auth/register', { method: 'POST', body: payload })
}

export function fetchMe(): Promise<AuthResult> {
  return request<AuthResult>('/auth/me')
}

export function logout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' })
}
