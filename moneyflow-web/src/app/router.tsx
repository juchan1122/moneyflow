import { createBrowserRouter, type RouteObject } from 'react-router'

import { RootLayout } from './RootLayout'
import { HomePage } from '../pages/HomePage'
import { MiniPage } from '../pages/MiniPage'
import { NotFoundPage } from '../pages/NotFoundPage'

// 폰 화면과 웹 화면은 같은 주소를 쓰고 화면 너비로 나눈다 (시스템 구조 6장)
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // 미니 창 (PC에서 작게 띄우는 전용 화면). 공통 레이아웃 없이
  { path: '/mini', element: <MiniPage /> },
]

export const router = createBrowserRouter(routes)
