// API 명세 v1.0 1장 공통 모양. 금액은 원 단위 number

export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'EMAIL_TAKEN'
  | 'DUPLICATE_NAME'
  | 'PAST_MONTH_LOCKED'
  | 'DAY_HAS_TRANSACTIONS'
  | 'NOT_PENDING'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR' // 프론트 전용: 서버에 닿지 못함 (오프라인 등)

export interface FieldError {
  field: string
  message: string
}

export interface ErrorResponse {
  code: ErrorCode
  message: string
  fieldErrors: FieldError[]
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
