# moneyflow-web

moneyflow 화면 (React + Vite + TypeScript PWA). 구조는 Notion "시스템 구조 v1.0" 6장.

## 실행

```bash
npm install
npm run dev          # http://localhost:5173
```

- `/api`와 `/actuator` 요청은 Vite가 `http://localhost:8080`(Spring 서버)으로 넘긴다. 화면과 API가 같은 주소처럼 동작해서 CORS 없이 로그인 쿠키가 붙는다.
- 서버는 `moneyflow-server`에서 `./gradlew bootRun` (기본 `local` 프로필, H2).

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run lint` | oxlint |
| `npm test` | Vitest (jsdom) |
| `npm run build` | 타입 검사 + 빌드 (`dist/`, 서비스 워커 포함) |
| `npm run preview` | 빌드 결과 미리보기 (PWA 설치 · 오프라인 확인용) |
| `npm run generate-pwa-assets` | `public/logo.svg`로 앱 아이콘 다시 만들기 |

## 폴더

```txt
src/
├── api/      서버 호출 (client: CSRF 헤더 · ApiError), TanStack Query 설정, 응답 타입
├── app/      라우터 · 공통 레이아웃 · 업데이트 알림
├── pages/    화면
└── test/     테스트 설정
```

## 메모

- 로고(`public/logo.svg`)는 임시. 디자인이 정해지면 바꾸고 아이콘을 다시 만든다.
- 서비스 워커는 화면 파일만 캐시한다. API 응답은 캐시하지 않는다 (오프라인 입력은 IndexedDB 큐로 따로).
