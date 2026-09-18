import { request, resolveUrl, uploadFile } from './http'

/** 头像展示视图（后端 AvatarView）：渲染优先级 imageUrl > emoji + bgColor > 姓名首字兜底 */
export interface AvatarView {
  id: number | null
  name?: string
  imageUrl?: string | null
  emoji?: string | null
  bgColor?: string | null
}

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
  /** 匿名昵称，如「球友#1111」 */
  anonymousName: string | null
  /** 个人头像 URL */
  avatar: string | null
  /** 选中的系统匿名头像 id */
  anonymousAvatarId: number | null
  /** 匿名头像视图（id 为空时回退默认头像） */
  anonymousAvatar: AvatarView | null
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
  /** 个人头像 URL（http(s):// 或 / 开头） */
  avatar?: string
  /** 选中的系统匿名头像 id */
  anonymousAvatarId?: number
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

/** 系统预置匿名头像列表 */
export function listAnonymousAvatars(): Promise<AvatarView[]> {
  return request<AvatarView[]>('/auth/anonymous-avatars')
}

/** 上传个人头像，返回 { avatar: url } */
export async function uploadAvatar(file: File): Promise<string> {
  const res = await uploadFile<{ avatar: string }>('/auth/avatar', file, 'file')
  return res?.avatar ?? ''
}

/** 把后端返回的头像 URL 补全为完整 URL */
export function resolveAvatarUrl(url: string | null | undefined): string {
  return resolveUrl(url)
}
