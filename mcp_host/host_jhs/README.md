# MCP-Playwright 테스트 자동화 도구

MCP(Model Context Protocol) 및 Playwright를 이용한 대화형 테스트 자동화 빌드 프로젝트입니다. 
LLM을 활용하여 웹사이트 최적화 분석 및 자동화 E2E 테스트 파이프라인을 구축합니다.

## 주요 기능

- LLM을 활용한 대화형 테스트 자동화
- 테스트 결과 자동 분석 및 리포팅
- Jenkins, GitHub Actions 등 CI/CD 플랫폼 통합
- 다국어 지원 (현재 영어, 한국어)
- 테스트 케이스 자동 생성 및 최적화

## 시스템 요구사항

- Node.js 16.0.0 이상
- Playwright 지원 브라우저
- LLM API 키 (Claude, OpenAI 등)

## 설치 방법

```bash
# 저장소 클론
git clone https://github.com/username/mcp-playwright-testing.git
cd mcp-playwright-testing

# 의존성 설치
npm install

# Playwright 브라우저 설치
npx playwright install

# 환경 설정 (API 키 등)
cp config/default.example.json config/default.json
# config/default.json 파일을 편집하여 API 키 등 설정
```

## 사용 방법

### 테스트 실행

```bash
# 기본 테스트 실행
npm test

# 헤드리스 모드 비활성화
npm test -- --headless=false

# 특정 타임아웃 설정
npm test -- --timeout=60000
```

### CLI 명령어

```bash
# 도구 정보 표시
node src/cli/index.js info

# 테스트 실행
node src/cli/index.js run

# 옵션 사용
node src/cli/index.js run --headless=false --logLevel=debug
```

## 디렉토리 구조

```
mcp-playwright-testing/
├── src/
│   ├── core/               # 핵심 기능
│   │   ├── mcp/            # MCP 통신 및 LLM 연동
│   │   └── test/           # Playwright 테스트 실행
│   ├── cli/                # 명령줄 인터페이스
│   │   └── commands/       # CLI 명령어
│   ├── utils/              # 유틸리티 함수
│   └── plugins/            # 플러그인 (Jenkins, GitHub 등)
├── config/                 # 설정 파일
├── templates/              # 템플릿
│   └── prompts/            # LLM 프롬프트 템플릿
├── test-results/           # 테스트 결과 저장
└── docs/                   # 문서
```

## 프롬프트 템플릿 사용자 정의

`templates/prompts` 디렉토리에 있는 Markdown 파일을 편집하여 LLM 프롬프트를 사용자 정의할 수 있습니다.
각 프롬프트 파일은 `{템플릿명}.{언어코드}.md` 형식으로 명명됩니다.

## CI/CD 통합

### Jenkins 통합

```bash
# Jenkins 파이프라인에서 사용 예
stage('E2E 테스트') {
  steps {
    sh 'npm install'
    sh 'npx playwright install'
    sh 'node src/cli/index.js run --reporter=jenkins'
  }
}
```

### GitHub Actions 통합

```yaml
# .github/workflows/test.yml 예시
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install
      - name: Run tests
        run: node src/cli/index.js run --reporter=github
```

## 라이선스

MIT