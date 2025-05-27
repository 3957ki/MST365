# MST365

LLM과 Playwright MCP를 활용한 자연어 기반 E2E 자동화 테스트 프로그램

## 📅 프로젝트 기간

2025.04.18 ~ 2025.05.22

## 🚀 주요 기능

### 1. Jenkins Plugin

- Jenkins에 마운트 가능한 hpi 형태의 플러그인 개발
- Jenkins UI를 통한 자연어 테스트 시나리오 작성 및 관리
- 테스트 결과 리포트 생성 및 관리

### 2. 자연어 기반 E2E 테스트

- Playwright MCP로 브라우저 제어를 통한 E2E 테스트 구현
- LLM(ChatGPT, Claude 등)과 Playwright MCP를 활용해서 LLM이 테스트를 진행
- 사용자의 자연어 시나리오를 기반으로 LLM이 판단
- 세부 스텝별 결과 및 피드백 산출

### 3. 데모 웹사이트

- 다양한 프레임워크(React, Next.js, Vue.js)로 구현된 테스트용 웹사이트
- 기본적인 CRUD 기능과 무한 스크롤 등 기능 제공
- LLM 토큰 비교를 위한 CSS 분리구조와 인라인구조 구분 테스트

## 📁 프로젝트 구조

```
MST365/
├── plugin/           # Jenkins 플러그인 소스 코드
├── host/            # MCP 호스트 구현
│   ├── python/      # Python 버전 호스트
│   └── typescript/  # TypeScript 버전 호스트
├── demo/            # 데모 웹사이트
│   ├── demo-front/  # 프론트엔드 데모 (React, Next.js, Vue.js)
│   └── demo-back/   # 백엔드 데모 (Spring Boot)
├── exec/            # 실행 관련 파일
└── assets/          # 이미지 및 기타 리소스
```

## 🖥 화면 예시

### Jenkins UI

- 플러그인 설치 후 생성되는 탭
  ![ui.png](assets/ui.png)
- 자연어 테스트케이스 목록
  ![script_list.png](assets/script_list.png)
- 테스트케이스 시나리오 생성,작성 및 수정
  ![make_script.png](assets/make_script.png)
- 결과 리포트 목록
  ![reports.png](assets/reports.png)
- 리포트 (python)
  ![report_v1.png](assets/report_v1.png)
- 리포트 (typescript)
  ![report_v2.png](assets/report_v2.png)

### 데모 웹사이트

- 데모 메인 화면
  ![demo_main.png](assets/demo_main.png)
- 데모 로그인 화면
  ![demo_login.png](assets/demo_login.png)
- 데모 회원가입 화면
  ![demo_signup.png](assets/demo_signup.png)
- 데모 게시판 화면
  ![demo_list.png](assets/demo_list.png)
- 데모 게시글 화면
  ![demo_text.png](assets/demo_text.png)
- 데모 마이페이지 화면
  ![demo_mypage.png](assets/demo_mypage.png)

## 👥 팀원 소개

| **김정우**                              | **백승훈**      | **전희성**      | **장은정**         | **이은선**                       | **김우영**         |
| --------------------------------------- | --------------- | --------------- | ------------------ | -------------------------------- | ------------------ |
| - 팀장 <br>- MCP Host 개발 <br>- 인프라 | - 플러그인 개발 | - 플러그인 개발 | - Demo 페이지 개발 | <br>- MCP Host 개발 <br>- 인프라 | - Demo 페이지 개발 |

## 🛠 기술 스택

### Frontend

<img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white" alt="JavaScript"><img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"><img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">

### Backend

<img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot"><img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT"><img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white" alt="Spring Security"><img src="https://img.shields.io/badge/JPA-59666C?style=for-the-badge&logo=hibernate&logoColor=white" alt="JPA">

### DB

<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">

### Infra & DevOps

<img src="https://img.shields.io/badge/Amazon_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Amazon EC2"><img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"><img src="https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white" alt="Jenkins"><img src="https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux">

### Collaboration Tools

<img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white" alt="Notion"> <img src="https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white" alt="Jira"> <img src="https://img.shields.io/badge/Mattermost-0058CC?style=for-the-badge&logo=mattermost&logoColor=white" alt="Mattermost">
