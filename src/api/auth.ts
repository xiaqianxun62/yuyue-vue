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
  /** 学号：校园认证后才有，未绑定时为 null */
  studentNo: string | null
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

/** 编辑个人信息：字段留空表示不修改 */
export interface ProfilePayload {
  name?: string
  gender?: number
  college?: string
  studentNo?: string
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

/** 编辑个人信息（PUT /auth/profile） */
export function updateProfile(payload: ProfilePayload): Promise<AuthResult> {
  return request<AuthResult>('/auth/profile', { method: 'PUT', body: payload })
}

export function logout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' })
}
