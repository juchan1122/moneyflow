# 운영용 화면 이미지: React 빌드 파일 + nginx (시스템 구조 v1.0 5장)
# nginx 설정은 이미지에 넣지 않고 deploy/nginx 에서 붙인다 (도메인 · HTTPS 여부가 서버마다 달라서)
#   docker build -t moneyflow-web:local moneyflow-web
# 보통은 deploy/compose.yml 이 대신 빌드한다

# ---------- 1. 빌드 ----------
# alpine 대신 slim: TypeScript 7 · oxlint 같은 네이티브 도구가 glibc 용으로 나와서
FROM node:24-slim AS build
WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- 2. 실행 ----------
FROM nginx:1.28-alpine
COPY --from=build /src/dist /usr/share/nginx/html
