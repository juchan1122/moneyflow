import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { createQueryClient } from '../api/queryClient'
import { routes } from './router'

// 서비스 워커 등록은 브라우저에서만. 테스트에서는 "업데이트 없음"으로
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, () => {}],
    offlineReady: [false, () => {}],
    updateServiceWorker: () => Promise.resolve(),
  }),
}))

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('router', () => {
  it('홈에서 서버 연결 상태를 보여준다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'UP' }))))

    renderAt('/')

    expect(await screen.findByText('정상')).toBeInTheDocument()
  })

  it('서버가 꺼져 있으면 연결 안 됨', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    renderAt('/')

    expect(await screen.findByText('연결 안 됨')).toBeInTheDocument()
  })

  it('없는 주소는 안내 화면', () => {
    renderAt('/no-such-page')

    expect(screen.getByRole('heading', { name: '페이지를 찾을 수 없어요' })).toBeInTheDocument()
  })

  it('미니 창 화면', () => {
    renderAt('/mini')

    expect(screen.getByRole('heading', { name: 'moneyflow 미니' })).toBeInTheDocument()
  })
})
