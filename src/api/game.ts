import { request } from './http'

/** 球局报名人 */
export interface RegistrationItem {
  userId: number
  /** 展示名：真实姓名 */
  displayName?: string
  /** 个人头像 URL */
  avatar?: string
  /** 1男 2女 0未知 */
  gender: number
  rating: number
}

/** 球局（后端 GameResponse） */
export interface Game {
  id: number
  title: string
  /** 0 预报名 1 现场报名 */
  mode?: number
  location: string | null
  /** 关联 court 表 ID */
  courtId?: number | null
  /** 球场名称（court 表回填） */
  courtName?: string | null
  /** 球场纬度（WGS84） */
  courtLat?: number | null
  /** 球场经度（WGS84） */
  courtLng?: number | null
  /** 球局备注 */
  remark?: string | null
  /** LocalDate，如 2026-09-20 */
  playDate: string
  /** LocalTime，如 19:00:00 */
  startTime: string | null
  endTime: string | null
  maxPlayers: number
  /** 场地数量 */
  courtCount?: number
  /** 0 报名中 1 已编排 2 已结束（见后端 Constants） */
  status: number
  creatorId: number
  /** 1=已隐藏 */
  hidden?: number
  creatorName?: string | null
  creatorAvatar?: string | null
  creatorGender?: number | null
  creatorRating?: number | null
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
  /** 0 预报名 1 现场报名（默认 0） */
  mode?: number
  courtCount?: number
  cover?: string
}

export function listGames(): Promise<Game[]> {
  return request<Game[]>('/games')
}

export function getGame(id: number): Promise<Game> {
  return request<Game>(`/games/${id}`)
}

/**
 * 报名：写入报名记录并刷新报名计数（统一实名报名）
 */
export function registerGame(id: number): Promise<Game> {
  return request<Game>(`/games/${id}/register`, { method: 'POST' })
}

/** 取消报名：删除报名记录并刷新报名计数（仅报名中的球局可取消） */
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

/**
 * 编辑球局。仅发起人可调用、仅限报名中（status=0）状态。
 * 复用 create 的 payload 结构（后端同 GameCreateRequest）。
 */
export function updateGame(id: number, payload: GameCreatePayload): Promise<Game> {
  return request<Game>(`/games/${id}`, { method: 'PUT', body: payload })
}

/**
 * 删除球局。仅发起人可调用、仅限报名中（status=0）状态。级联软删报名记录。
 */
export function deleteGame(id: number): Promise<void> {
  return request<void>(`/games/${id}`, { method: 'DELETE' })
}
