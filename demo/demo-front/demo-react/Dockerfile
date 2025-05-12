# 1. 빌드 스테이지
FROM node:22.13.0-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. 실행 스테이지 (Nginx 사용)
FROM nginx:stable-alpine AS runner

# 시간대 설정 (선택)
RUN apk add --no-cache tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apk del tzdata

# Nginx 설정 복사 (SPA fallback 처리 포함)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000