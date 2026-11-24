#!/usr/bin/env bash
# Let's Encrypt 인증서를 처음 받는다 (한 번만. 갱신은 certbot 컨테이너가 알아서 함)
# 먼저 http 모드로 서버가 떠 있고, 밖에서 http://SERVER_NAME 으로 접속되어야 한다
#   cd deploy && ./scripts/issue-cert.sh
set -euo pipefail
cd "$(dirname "$0")/.."

read_env() { grep -E "^$1=" .env | tail -n 1 | cut -d= -f2-; }
server_name="$(read_env SERVER_NAME)"
email="$(read_env CERT_EMAIL)"

if [ -z "$server_name" ] || [ -z "$email" ]; then
  echo ".env 에 SERVER_NAME 과 CERT_EMAIL 을 넣어 주세요" >&2
  exit 1
fi

echo "인증서 받기: $server_name"
docker compose --profile https run --rm --entrypoint certbot certbot \
  certonly --webroot -w /var/www/certbot \
  -d "$server_name" --email "$email" --agree-tos --no-eff-email --non-interactive

cat <<'EOF'

인증서를 받았어요. 이제 .env 를 이렇게 바꾸고 다시 띄우세요:
  NGINX_MODE=https
  COMPOSE_PROFILES=https
  COOKIE_SECURE=true
  docker compose up -d
EOF
