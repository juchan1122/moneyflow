# deploy — 운영 서버 올리기

시스템 구조 v1.0 5장대로 **서버 1대 + Docker Compose**로 올린다.
서버에 직접 설치하는 것은 Docker 하나뿐이다. nginx · 인증서 · MySQL은 모두 컨테이너 안에 있다.
그래서 Oracle에서 AWS로 옮길 때 이 폴더와 `.env`, DB 백업만 가져가면 된다.

| 파일 | 하는 일 |
| --- | --- |
| `compose.yml` | 운영: `web`(nginx) → `server`(Spring Boot) → `db`(MySQL 8.4) + `certbot`(https 모드에서만) |
| `compose.dev.yml` | 내 PC 개발용 MySQL (dev 프로필) |
| `.env.example` | 비밀값 · 설정 예시. 서버에서 `.env`로 복사해서 채운다 (`.env`는 저장소에 올리지 않음) |
| `nginx/app.conf` | 화면 파일 + `/api` 전달 + `/actuator/health`만 공개 |
| `nginx/http.conf.template` | 인증서를 받기 전 (http) |
| `nginx/https.conf.template` | 인증서를 받은 뒤 (https, 80 → 443) |
| `scripts/issue-cert.sh` | Let's Encrypt 인증서를 처음 받기 |
| `scripts/backup.sh` · `restore.sh` | DB 백업 (14일치) · 되살리기 |

이미지는 `moneyflow-server/Dockerfile`, `moneyflow-web/Dockerfile`로 만든다. 서버에서 바로 빌드하므로 ARM 서버에서는 ARM 이미지가 만들어진다.

## 도메인 없이 HTTPS 쓰기

PWA 설치 · Service Worker · 푸시는 HTTPS에서만 된다. 도메인을 사기 전에는 **sslip.io** 이름을 쓴다.
서버 IP가 `158.180.1.2`라면 `158-180-1-2.sslip.io`가 그 IP를 가리키고, 이 이름으로 Let's Encrypt 인증서를 받을 수 있다.
나중에 도메인을 사면 `SERVER_NAME`만 바꾸고 인증서를 다시 받으면 된다 (아래 "도메인을 산 뒤").

## 처음 올리기 (Oracle Cloud 무료 ARM 서버)

### 1. 서버 만들기 (Oracle 콘솔)

- Compute → Instances → Create
- 이미지: **Canonical Ubuntu 24.04** · 모양: **VM.Standard.A1.Flex** (Ampere ARM). 무료 범위(OCPU · 메모리)는 만들 때 Oracle 문서로 다시 확인
- SSH 키: 새로 만들어서 비밀 키를 내 PC에 저장
- 지역은 서울 · 춘천. 자리가 없다고 나오면 잠시 뒤 다시 하거나 다른 가용 영역

### 2. 80 · 443 포트 열기 (두 군데)

1. Oracle 콘솔: 인스턴스의 VCN → Security List → Ingress Rules에 TCP `80`, `443` (소스 `0.0.0.0/0`) 추가
2. 서버 안: Oracle의 Ubuntu 이미지는 iptables가 기본으로 막고 있다

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

### 3. Docker 설치

```bash
ssh -i 비밀키 ubuntu@서버IP
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu   # 그다음 로그아웃 → 다시 접속
```

### 4. 코드 받기 · `.env` 채우기

```bash
git clone https://github.com/juchan1122/moneyflow.git
cd moneyflow/deploy
cp .env.example .env
openssl rand -base64 24   # 두 번 실행해서 DB_PASSWORD, DB_ROOT_PASSWORD 에
nano .env
```

처음에는 이렇게 둔다: `SERVER_NAME=서버IP를-로-바꾼.sslip.io`, `NGINX_MODE=http`, `COMPOSE_PROFILES=`(비움), `COOKIE_SECURE=false`

### 5. 띄우기 (http 모드)

```bash
docker compose up -d --build   # 첫 빌드는 5~10분
docker compose ps              # db · server 가 healthy, web 이 running 이면 됨
curl http://localhost/actuator/health   # {"status":"UP"}
```

내 PC 브라우저에서 `http://158-180-1-2.sslip.io`가 열리면 다음 단계로 넘어간다.

### 6. HTTPS로 바꾸기

```bash
nano .env                    # CERT_EMAIL 에 만료 안내를 받을 메일
./scripts/issue-cert.sh      # 인증서 받기 (밖에서 80 포트로 접속돼야 함)
nano .env                    # NGINX_MODE=https, COMPOSE_PROFILES=https, COOKIE_SECURE=true
docker compose up -d
```

`https://158-180-1-2.sslip.io`가 열리면 끝이다. 이후 인증서는 `certbot` 컨테이너가 알아서 갱신한다.

### 7. 매일 백업 (서버를 올린 날부터)

```bash
crontab -e
# 아래 한 줄 추가 (매일 03:00)
0 3 * * * /home/ubuntu/moneyflow/deploy/scripts/backup.sh >> /home/ubuntu/moneyflow-backup.log 2>&1
```

백업은 `deploy/backups/`에 쌓인다. **서버 밖으로 복사하는 것은 아직 안 했다** (`backup.sh` 끝의 TODO). 무료 서버가 회수되면 서버 안 백업도 같이 사라지므로, 서버를 올리고 나서 바로 정한다.

## 자주 쓰는 명령 (`deploy` 폴더에서)

| 하고 싶은 것 | 명령 |
| --- | --- |
| 새 코드로 업데이트 | `git pull && docker compose up -d --build` |
| 상태 | `docker compose ps` |
| 서버 로그 | `docker compose logs -f server` |
| 다시 켜기 | `docker compose restart server` |
| 백업 지금 하기 | `./scripts/backup.sh` |
| 되살리기 | `./scripts/restore.sh backups/파일이름.sql.gz` |

## 도메인을 산 뒤

1. 도메인 DNS에 A 레코드: `@` → 서버 IP
2. `.env`: `SERVER_NAME=새도메인`, `NGINX_MODE=http`, `COMPOSE_PROFILES=` → `docker compose up -d`
3. `./scripts/issue-cert.sh` → `.env`를 다시 https 모드로 → `docker compose up -d`

주소가 바뀌면 PWA를 새 주소에서 다시 설치해야 한다 (브라우저는 주소마다 따로 본다).
