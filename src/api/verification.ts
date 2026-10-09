import { request } from './http'

export interface VerificationQuestion {
  id: number
  question: string
  /** 多个答案用 | 分隔（来自后端 answer 字段） */
  answer: string
  /** 1启用 0停用 */
  enabled: number
  createTime?: string
  updateTime?: string
}

export interface QuestionCreateRequest {
  question: string
  answer: string
  enabled?: number
}

export interface AnswerSubmitRequest {
  questionId: number
  answer: string
}

export interface AnswerSubmitResult {
  correct: boolean
  verified: boolean
}

/** 管理员：列出全部问题（含已停用） */
export function listQuestions(): Promise<VerificationQuestion[]> {
  return request<VerificationQuestion[]>('/verification/questions')
}

/** 管理员：新增问题 */
export function createQuestion(req: QuestionCreateRequest): Promise<VerificationQuestion> {
  return request<VerificationQuestion>('/verification/questions', { method: 'POST', body: req })
}

/** 管理员：编辑问题 */
export function updateQuestion(id: number, req: QuestionCreateRequest): Promise<VerificationQuestion> {
  return request<VerificationQuestion>(`/verification/questions/${id}`, { method: 'PUT', body: req })
}

/** 管理员：删除问题 */
export function deleteQuestion(id: number): Promise<void> {
  return request<void>(`/verification/questions/${id}`, { method: 'DELETE' })
}

/** 用户端：随机抽一道启用的题 */
export function fetchRandomQuestion(): Promise<VerificationQuestion> {
  return request<VerificationQuestion>('/verification/random')
}

/** 用户端：提交答案 */
export function submitAnswer(req: AnswerSubmitRequest): Promise<AnswerSubmitResult> {
  return request<AnswerSubmitResult>('/verification/submit', { method: 'POST', body: req })
}
