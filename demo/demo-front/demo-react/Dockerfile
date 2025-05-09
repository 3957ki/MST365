# 1. 빌드 스테이지
FROM node:22.13.0-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. 실행 스테이지
FROM node:22.13.0-alpine AS runner

WORKDIR /app

# http-server 설치
RUN npm install -g http-server

# 빌드된 정적 파일 복사
COPY --from=builder /app/dist /app/dist

# 한국 시간 설정
RUN apk add --no-cache tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apk del tzdata

# 포트 설정 (컨테이너 내부 포트)
ENV PORT=3000
EXPOSE 3000

# http-server 실행 (SPA 대응 포함, 포트 3000)
CMD ["http-server", "dist", "-p", "3000", "-s"]