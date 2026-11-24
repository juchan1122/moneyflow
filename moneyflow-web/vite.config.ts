/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// 시스템 구조 v1.0 6장
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 새 버전이 나오면 바로 바꾸지 않고 "업데이트" 알림을 띄운다 (UpdatePrompt)
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      manifest: {
        name: 'moneyflow',
        short_name: 'moneyflow',
        description: '오늘 쓸 수 있는 돈을 알려주는 가계부',
        lang: 'ko',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1f6f5c',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 화면 파일만 캐시. API 응답은 캐시하지 않는다 (오프라인 입력은 IndexedDB 큐로, TASK-51)
        navigateFallbackDenylist: [/^\/api\//, /^\/actuator\//],
      },
    }),
  ],
  server: {
    // 개발 때도 화면과 API를 같은 주소처럼: /api → Spring Boot (CORS 없이 쿠키 그대로)
    proxy: {
      '/api': 'http://localhost:8080',
      '/actuator': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
