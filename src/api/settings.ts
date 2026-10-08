import { request } from './http'

/** 站点可配置文案（后端 Redis 存，零数据库依赖，GET 公开、PUT 需登录） */

export interface HomePoem {
  line1: string
  line2: string
  source: string
}

export function getHomePoem(): Promise<HomePoem> {
  return request<HomePoem>('/settings/home-poem')
}

/**
 * 修改首页诗句文案。前端只传需要改的字段（后端做 merge，空字段跳过）。
 * PUT /settings/home-poem 需要登录。
 */
export function updateHomePoem(patch: Partial<HomePoem>): Promise<HomePoem> {
  return request<HomePoem>('/settings/home-poem', {
    method: 'PUT',
    body: patch,
  })
}
