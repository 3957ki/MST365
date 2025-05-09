# 1. 빌드 스테이지
FROM node:22.13.0-alpine AS builder

WORKDIR /app

# 2. 의존성 설치
COPY package*.json ./
RUN npm install

# 3. 소스 복사 및 빌드
COPY . .
RUN npm run build

# 4. 런타임 스테이지 (http-server 사용)
FROM node:22.13.0-alpine AS runner

WORKDIR /app

# http-server 설치
RUN npm install -g http-server

# 빌드된 정적 파일 복사
COPY --from=builder /app/dist /app/dist

# 한국 시간대 설정
RUN apk add --no-cache tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apk del tzdata

# 포트 설정 (컨테이너 내부 3000)
ENV PORT=3000
EXPOSE 3000

# http-server 실행 (SPA 대응 위해 -s 옵션 추가)
CMD ["http-server", "dist", "-p", "3000", "-s"]
