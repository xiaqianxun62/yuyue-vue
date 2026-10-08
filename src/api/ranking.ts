import { request } from './http'

/** 积分榜条目（后端 RankingItem） */
export interface RankingItem {
  userId: number
  name: string
  rating: number
  win: number
  loss: number
  /** 名次，从 1 开始 */
  rank: number
  /** 用户头像相对路径（/uploads/xxx），为空时前端显示首字母占位 */
  avatar?: string
}

/** 积分榜 Top N：官网与小程序同源，读 Redis ZSet */
export function fetchRanking(n = 10): Promise<RankingItem[]> {
  return request<RankingItem[]>(`/ranking?n=${n}`)
}
