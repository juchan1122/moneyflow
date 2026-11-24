# 운영용 서버 이미지 (시스템 구조 v1.0 5장)
# arm64(Oracle 무료 서버) · amd64(AWS · 내 PC) 둘 다 이 파일 하나로 빌드된다
#   docker build -t moneyflow-server:local moneyflow-server
# 보통은 deploy/compose.yml 이 대신 빌드한다

# ---------- 1. 빌드 ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /src

# 의존성을 먼저 받아 두면, 코드만 바뀌었을 때 이 층을 다시 쓰므로 빌드가 빠르다
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
RUN chmod +x gradlew && ./gradlew --no-daemon -q dependencies > /dev/null

COPY src src
# 테스트는 CI(server-ci.yml)에서 이미 돌렸으므로 여기서는 건너뜀
RUN ./gradlew --no-daemon -q bootJar -x test \
 && cp "$(ls build/libs/*.jar | grep -v -- '-plain.jar' | head -n 1)" app.jar \
 && java -Djarmode=tools -jar app.jar extract --layers --launcher --destination /extracted

# ---------- 2. 실행 ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# root 가 아닌 사용자로 실행
RUN groupadd --system app && useradd --system --gid app --no-create-home app

# 잘 안 바뀌는 층(라이브러리)부터 복사 → 배포할 때 바뀐 층만 내려받음
COPY --from=build /extracted/dependencies/ ./
COPY --from=build /extracted/spring-boot-loader/ ./
COPY --from=build /extracted/snapshot-dependencies/ ./
COPY --from=build /extracted/application/ ./

USER app
ENV TZ=Asia/Seoul \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""
EXPOSE 8080

# 서버 시간대는 항상 한국 시간 (build.gradle 의 bootRun · test 와 같게)
ENTRYPOINT ["sh", "-c", "exec java -Duser.timezone=Asia/Seoul $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
