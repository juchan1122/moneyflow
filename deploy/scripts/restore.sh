#!/usr/bin/env bash
# 백업 파일로 DB 를 되살린다 (지금 데이터는 덮어씀). 한 달에 한 번 연습 (시스템 구조 5-3)
#   cd deploy && ./scripts/restore.sh backups/moneyflow-20261201-0300.sql.gz
set -euo pipefail
cd "$(dirname "$0")/.."

file="${1:?되살릴 백업 파일을 적어 주세요 (예: backups/moneyflow-20261201-0300.sql.gz)}"
[ -f "$file" ] || { echo "파일이 없어요: $file" >&2; exit 1; }

read -r -p "지금 DB 를 $file 로 덮어씁니다. 계속할까요? (yes) " answer
[ "$answer" = "yes" ] || { echo "취소했어요"; exit 1; }

docker compose stop server
gunzip -c "$file" | docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql -uroot moneyflow'
docker compose start server
echo "되살리기 완료. /actuator/health 를 확인하세요"
