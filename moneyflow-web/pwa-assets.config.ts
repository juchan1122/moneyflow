import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// public/logo.svg 하나로 favicon · 앱 아이콘(192 · 512 · maskable) · 아이폰 아이콘을 만든다
//   npm run generate-pwa-assets
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: minimal2023Preset,
  images: ['public/logo.svg'],
})
