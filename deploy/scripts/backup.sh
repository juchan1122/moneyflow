#!/usr/bin/env bash
# DB 백업: mysqldump → deploy/backups/ 에 14일치 (시스템 구조 5-3, 8장)
# 서버 cron 에 매일 03:00 으로 등록 (deploy/README.md)
#   0 3 * * * /home/ubuntu/moneyflow/deploy/scripts/backup.sh >> /home/ubuntu/moneyflow-backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p backups
file="backups/moneyflow-$(date +%Y%m%d-%H%M).sql.gz"

# 비밀번호는 db 컨테이너 안의 환경변수로 (명령줄 · 로그에 남지 않게)
docker compose exec -T db sh -c \
  'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump -uroot --single-transaction --routines --triggers --set-gtid-purged=OFF moneyflow' \
  | gzip > "$file.tmp"
mv "$file.tmp" "$file"

# 14일 지난 것은 지움
find backups -name 'moneyflow-*.sql.gz' -mtime +13 -delete

echo "$(date '+%F %T') 백업 완료: $file ($(du -h "$file" | cut -f1))"

# TODO 서버 밖으로 복사 (무료 서버가 회수돼도 살아남게). 예: rclone copy "$file" remote:moneyflow-backup
