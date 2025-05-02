# 1. Gradle 빌드를 위한 기본 이미지 (Gradle 8.11.1)
FROM gradle:8.11.1-jdk17 AS build

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 프로젝트 파일 복사
COPY . .

# 4. Gradle Wrapper에 실행 권한 부여
RUN chmod +x ./gradlew

# 5. Gradle Wrapper로 Spring Boot 애플리케이션 빌드
RUN ./gradlew clean bootJar --no-daemon

# 6. 경량화된 JDK 이미지 사용
FROM openjdk:17-jdk-slim

# 7. 작업 디렉토리 설정
WORKDIR /app

# 8. JVM 타임존을 KST(Asia/Seoul)로 설정
ENV JAVA_TOOL_OPTIONS="-Duser.timezone=Asia/Seoul"

# 9. 빌드된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 10. 컨테이너에서 사용할 포트 노출
EXPOSE 8081

# 11. 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
