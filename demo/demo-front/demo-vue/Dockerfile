# 1. Node.js로 빌드 (Vue CLI 프로젝트)
FROM node:22.13.0-alpine AS builder

WORKDIR /app

# 2. 의존성 설치
COPY package*.json ./
RUN npm install

# 3. 소스 복사 및 빌드
COPY . .
RUN npm run build

# 4. Nginx 기반 런타임 이미지 사용
FROM nginx:stable-alpine AS runner

# 5. 한국 시간대 설정
RUN apk add --no-cache tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apk del tzdata

# 6. Vue Router history 모드를 위한 custom nginx.conf 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 7. 정적 빌드 결과물을 nginx의 html 경로로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 8. 포트 노출
EXPOSE 80

# Nginx는 기본 entrypoint로 실행됨
