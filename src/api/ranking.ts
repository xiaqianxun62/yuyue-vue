import { request } from './http'

/** 积分榜条目（后端 RankingItem） */
export interface RankingItem {
  userId: number
  /** 对外展示的匿名名（如「陈**」） */
  anonymousName: string
  name: string
  college: string | null
  rating: number
  win: number
  loss: number
  /** 名次，从 1 开始 */
  rank: number
}

/** 积分榜 Top N：官网与小程序同源，读 Redis ZSet */
export function fetchRanking(n = 10): Promise<RankingItem[]> {
  return request<RankingItem[]>(`/ranking?n=${n}`)
}
