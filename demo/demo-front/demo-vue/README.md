# vue-project

## 프로젝트 설치
```
npm install
```

### 프로젝트 실행
```
npm run serve
```

### 컴파일 및 최적화
```
npm run build
```

## Docker 이미지 빌드
```
docker build -t vue-app .
```
## 컨테이너 실행
```
docker run -d -p 3000:80 --name vue-container vue-app
```

## 페이지 구성

- 회원 기능: 로그인, 로그아웃, 마이페이지
- 커뮤니티 기능: 게시물, 댓글, 좋아요, 싫어요

