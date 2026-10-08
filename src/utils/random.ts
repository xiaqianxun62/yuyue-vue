// 通用工具函数
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

// 头像色板
export const AVATAR_COLORS = [
  '#14665B',
  '#2E8B57',
  '#5A726D',
  '#8B7355',
  '#A0522D',
  '#6B8E23',
  '#4682B4',
  '#8B4513',
] as const
