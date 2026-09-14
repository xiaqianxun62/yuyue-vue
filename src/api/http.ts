/**
 * 统一请求层：把后端 ApiResponse{code,message,data} 解包成业务数据。
 * 约定：HTTP 状态码始终是 200，code === 0 才算成功（见后端 GlobalExceptionHandler）。
 */

/** 后端统一响应体 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/** 业务异常：带后端错误码，便于上层区分「学号已注册」「密码错误」等场景 */
export class ApiError extends Error {
  readonly code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/** 后端地址：可在 .env.local 里用 VITE_API_BASE_URL 覆盖 */
const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'

const TOKEN_KEY = 'yuyue_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const init: RequestInit = { method: options.method ?? 'GET', headers }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(options.body)
  }

  let res: Response
  try {
    res = await fetch(BASE_URL + path, init)
  } catch {
    throw new ApiError(-1, `无法连接服务器，请确认后端已启动（${BASE_URL}）`)
  }

  if (!res.ok) {
    throw new ApiError(res.status, `请求失败（HTTP ${res.status}）`)
  }

  const payload = (await res.json()) as ApiResponse<T>
  if (payload.code !== 0) {
    // token 失效：清掉本地凭证，避免后续请求继续 401
    if (payload.code === 401) {
      clearToken()
    }
    throw new ApiError(payload.code, payload.message || '请求失败')
  }
  return payload.data
}
