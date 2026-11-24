import { QueryClient } from '@tanstack/react-query'

import { ApiError } from './client'

/** 4xx(입력 오류 · 로그인 필요 등)는 다시 시도해도 같으니 재시도하지 않는다 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
