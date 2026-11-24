import type { ErrorCode, ErrorResponse, FieldError } from './types'

/**
 * 서버 API 호출. 화면과 API가 같은 주소라 쿠키(세션 · remember-me)가 그대로 붙는다.
 * - GET이 아닌 요청에는 XSRF-TOKEN 쿠키 값을 X-XSRF-TOKEN 헤더로 보낸다 (Spring Security CSRF)
 * - 실패하면 서버의 {code, message, fieldErrors}를 담은 ApiError를 던진다
 */
export const API_BASE = '/api/v1'

export class ApiError extends Error {
  readonly status: number
  readonly code: ErrorCode
  readonly fieldErrors: FieldError[]

  constructor(status: number, body: ErrorResponse) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.fieldErrors = body.fieldErrors ?? []
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  body?: unknown
  signal?: AbortSignal
}

export function readCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.slice(name.length + 1)
}

export async function request<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (method !== 'GET') {
    const token = readCookie('XSRF-TOKEN')
    if (token) headers['X-XSRF-TOKEN'] = decodeURIComponent(token)
  }

  let response: Response
  try {
    // path는 '/home'처럼 /api/v1 뒤 부분만 넘긴다
    response = await fetch(API_BASE + path, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'same-origin',
      signal: options.signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(0, { code: 'NETWORK_ERROR', message: '인터넷 연결을 확인해 주세요.', fieldErrors: [] })
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data: unknown = await response.json().catch(() => undefined)
  if (!response.ok) {
    throw new ApiError(response.status, toErrorResponse(data))
  }
  return data as T
}

function toErrorResponse(data: unknown): ErrorResponse {
  if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
    return data as ErrorResponse
  }
  return { code: 'INTERNAL_ERROR', message: '잠시 후 다시 시도해 주세요.', fieldErrors: [] }
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, { signal }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
}
