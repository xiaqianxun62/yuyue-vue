import { request } from './http'

/** 球局报名人（对外匿名，不含真实姓名学号） */
export interface RegistrationItem {
  userId: number
  anonymousName: string
  /** 展示名：实名报名且查看者已登录=真实姓名，否则=匿名昵称 */
  displayName?: string
  /** 1 匿名 / 0 实名 */
  anonymous?: number
  /** 1男 2女 0未知 */
  gender: number
  rating: number
}

/** 球局（后端 GameResponse） */
export interface Game {
  id: number
  title: string
  location: string | null
  /** LocalDate，如 2026-09-20 */
  playDate: string
  /** LocalTime，如 19:00:00 */
  startTime: string | null
  endTime: string | null
  maxPlayers: number
  /** 0 报名中 1 已编排 2 已结束（见后端 Constants） */
  status: number
  creatorId: number
  /** 当前报名人数 */
  registeredCount: number
  registrations: RegistrationItem[]
}

/** 编排结果（后端 ArrangeResponse） */
export interface ArrangeResult {
  gameId: number
  schemeId: number
  schemeName: string
  matches: ArrangeMatch[]
}

/** 一场对阵：format 1单打 2双打 */
export interface ArrangeMatch {
  format: number
  teamA: number[]
  teamB: number[]
}

export interface GameCreatePayload {
  title: string
  location?: string
  playDate: string
  startTime: string
  endTime?: string
  maxPlayers?: number
}

export function listGames(): Promise<Game[]> {
  return request<Game[]>('/games')
}

export function getGame(id: number): Promise<Game> {
  return request<Game>(`/games/${id}`)
}

/**
 * 报名：写入报名并投递 Kafka，由 clawbot 同步微信群接龙
 * @param anonymous true=匿名（默认），false=实名（名单对登录用户显示真实姓名）
 */
export function registerGame(id: number, anonymous = true): Promise<Game> {
  return request<Game>(`/games/${id}/register`, { method: 'POST', body: { anonymous } })
}

/** 取消报名：删除报名记录并投递 Kafka，由 clawbot 从微信群接龙移除 */
export function cancelRegisterGame(id: number): Promise<Game> {
  return request<Game>(`/games/${id}/register`, { method: 'DELETE' })
}

/** 自动编排：按报名人员性别构成过滤 6 套方案并生成对阵 */
export function arrangeGame(id: number): Promise<ArrangeResult> {
  return request<ArrangeResult>(`/games/${id}/arrange`, { method: 'POST' })
}

export function createGame(payload: GameCreatePayload): Promise<Game> {
  return request<Game>('/games', { method: 'POST', body: payload })
}
