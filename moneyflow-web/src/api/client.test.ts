import { afterEach, describe, expect, it, vi } from 'vitest'

import { api, ApiError } from './client'

function mockFetch(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function sentHeaders(fetchMock: ReturnType<typeof vi.fn>): Record<string, string> {
  return (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>
}

afterEach(() => {
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
})

describe('api client', () => {
  it('경로 앞에 /api/v1을 붙이고 JSON을 돌려준다', async () => {
    const fetchMock = mockFetch(200, { todayAvailable: 57800 })

    const data = await api.get<{ todayAvailable: number }>('/home')

    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/home')
    expect(data.todayAvailable).toBe(57800)
  })

  it('GET이 아니면 XSRF-TOKEN 쿠키를 X-XSRF-TOKEN 헤더로 보낸다', async () => {
    document.cookie = 'XSRF-TOKEN=abc%3D123'
    const fetchMock = mockFetch(201, { id: 1 })

    await api.post('/transactions', { amount: 12000 })

    expect(sentHeaders(fetchMock)['X-XSRF-TOKEN']).toBe('abc=123')
  })

  it('GET에는 CSRF 헤더를 붙이지 않는다', async () => {
    document.cookie = 'XSRF-TOKEN=abc'
    const fetchMock = mockFetch(200, {})

    await api.get('/home')

    expect(sentHeaders(fetchMock)['X-XSRF-TOKEN']).toBeUndefined()
  })

  it('실패하면 서버의 code · fieldErrors를 담은 ApiError를 던진다', async () => {
    mockFetch(400, {
      code: 'VALIDATION_FAILED',
      message: '입력값을 확인해 주세요.',
      fieldErrors: [{ field: 'amount', message: '0보다 커야 해요' }],
    })

    const error = await api.post('/transactions', { amount: -1 }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' })
    expect((error as ApiError).fieldErrors[0].field).toBe('amount')
  })

  it('204는 본문 없이 끝난다', async () => {
    mockFetch(204)

    await expect(api.delete('/payment-methods/1')).resolves.toBeUndefined()
  })

  it('서버에 닿지 못하면 NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(api.get('/home')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })
})
