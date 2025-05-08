# 1. Node.js 공식 빌드 이미지를 사용
FROM node:22.13.0-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 의존성 파일 복사 및 설치
COPY package.json package-lock.json ./
RUN npm install

# 4. 소스 코드 복사 및 React 앱 빌드
COPY . .
RUN npm run build

# 5. 실행을 위한 경량 Node.js 이미지 사용
FROM node:22.13.0-alpine AS runner

# 6. 작업 디렉토리 설정
WORKDIR /app

# 7. 빌드된 결과물과 필요한 파일만 복사
# Vite는 일반적으로 'dist' 폴더에 빌드 결과물을 생성합니다.
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
# public 폴더가 있다면 복사합니다. (선택 사항)
# COPY --from=builder /app/public /app/public

# 8. 서버시간 한국시간 설정
RUN apk add --no-cache tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apk del tzdata

# 9. 환경 변수 및 포트 설정
# vite preview의 기본 포트는 4173이지만, 3000으로 통일합니다.
ENV PORT=3000
EXPOSE 3000

# 10. React 앱 실행 (vite preview 사용, 포트 지정)
# package.json의 preview 스크립트를 사용하거나 직접 vite preview를 실행할 수 있습니다.
# 여기서는 vite preview를 직접 실행하고 포트를 지정합니다.
CMD ["npm", "run", "preview", "--", "--port", "3000"]
