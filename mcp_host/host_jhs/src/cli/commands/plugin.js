// src/cli/commands/plugin.js
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { loadConfig } from '../../utils/config.js';
import { tSync } from '../../utils/i18n.js';

/**
 * 플러그인 생성 명령어 처리 함수
 * @param {Object} options 명령어 옵션
 */
export async function pluginCommand(options) {
  try {
    const config = await loadConfig();
    const platform = options.platform || 'jenkins';
    const outputDir = options.output || './plugins';
    
    console.log(chalk.cyan(`${platform} 플러그인 생성 중...`));
    
    // 출력 디렉토리 생성
    await fs.ensureDir(outputDir);
    
    // 플랫폼별 플러그인 생성 로직
    switch (platform.toLowerCase()) {
      case 'jenkins':
        await generateJenkinsPlugin(outputDir);
        break;
      case 'github':
        await generateGithubPlugin(outputDir);
        break;
      case 'gitlab':
        await generateGitlabPlugin(outputDir);
        break;
      case 'azure':
        await generateAzurePlugin(outputDir);
        break;
      default:
        console.log(chalk.yellow(`지원되지 않는 플랫폼: ${platform}`));
        console.log(chalk.cyan('지원되는 플랫폼: jenkins, github, gitlab, azure'));
    }
    
    console.log(chalk.yellow('이 기능은 아직 개발 중입니다. 기본 템플릿만 생성됩니다.'));
    
  } catch (error) {
    console.error(chalk.red('플러그인 생성 중 오류 발생:'), error);
    process.exit(1);
  }
}

/**
 * Jenkins 플러그인 생성
 * @param {string} outputDir 출력 디렉토리
 */
async function generateJenkinsPlugin(outputDir) {
  const pluginDir = path.join(outputDir, 'jenkins-plugin');
  await fs.ensureDir(pluginDir);
  
  // Jenkinsfile 생성
  const jenkinsfilePath = path.join(pluginDir, 'Jenkinsfile');
  const jenkinsfileContent = `pipeline {
    agent any
    
    environment {
        LLM_API_KEY = credentials('llm-api-key')
    }
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npx llm-test run -f test-scenarios/basic.txt --headless'
            }
            post {
                always {
                    junit 'test-results/reports/*.xml'
                    archiveArtifacts artifacts: 'test-results/screenshots/**', allowEmptyArchive: true
                }
            }
        }
    }
}`;
  
  await fs.writeFile(jenkinsfilePath, jenkinsfileContent);
  console.log(chalk.green(`Jenkinsfile 생성됨: ${jenkinsfilePath}`));
  
  // README 생성
  const readmePath = path.join(pluginDir, 'README.md');
  const readmeContent = `# LLM-Driven Test Jenkins 플러그인

Jenkins 파이프라인에서 LLM-Driven Test를 실행하기 위한 설정입니다.

## 사용 방법

1. Jenkins 서버에 Node.js 설치
2. API 키를 Jenkins Credentials에 'llm-api-key' 이름으로 저장
3. 이 디렉토리의 Jenkinsfile을 파이프라인 설정에 사용

## 환경 변수

- LLM_TEST_FILE: 테스트 시나리오 파일 경로
- LLM_TEST_OUTPUT: 결과 출력 디렉토리
- LLM_TEST_BROWSER: 브라우저 (chromium, firefox, webkit)
- LLM_TEST_HEADLESS: 헤드리스 모드 (true/false)
- LLM_TEST_LANGUAGE: 언어 코드 (ko, en, ja, zh)
`;
  
  await fs.writeFile(readmePath, readmeContent);
  console.log(chalk.green(`README 생성됨: ${readmePath}`));
}

/**
 * GitHub Actions 플러그인 생성
 * @param {string} outputDir 출력 디렉토리
 */
async function generateGithubPlugin(outputDir) {
  const pluginDir = path.join(outputDir, 'github-actions');
  const workflowsDir = path.join(pluginDir, '.github', 'workflows');
  await fs.ensureDir(workflowsDir);
  
  // GitHub Actions 워크플로우 파일 생성
  const workflowPath = path.join(workflowsDir, 'llm-test.yml');
  const workflowContent = `name: LLM-Driven Test

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 16
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
    
    - name: Run LLM-Driven Tests
      run: npx llm-test run -f test-scenarios/basic.txt --headless
      env:
        LLM_API_KEY: \${{ secrets.LLM_API_KEY }}
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: test-results/
`;
  
  await fs.writeFile(workflowPath, workflowContent);
  console.log(chalk.green(`GitHub Actions 워크플로우 생성됨: ${workflowPath}`));
  
  // README 생성
  const readmePath = path.join(pluginDir, 'README.md');
  const readmeContent = `# LLM-Driven Test GitHub Actions 플러그인

GitHub Actions에서 LLM-Driven Test를 실행하기 위한 설정입니다.

## 사용 방법

1. 이 디렉토리의 .github 폴더를 프로젝트 루트에 복사
2. API 키를 GitHub 저장소 Secrets에 'LLM_API_KEY' 이름으로 저장
3. GitHub 저장소에 푸시하여 워크플로우 트리거

## 환경 변수

GitHub Secrets에 다음 환경 변수를 설정할 수 있습니다:
- LLM_API_KEY: LLM API 키 (필수)
- LLM_PROVIDER: LLM 제공자 (기본값: anthropic)
- LLM_MODEL: 사용할 모델
`;
  
  await fs.writeFile(readmePath, readmeContent);
  console.log(chalk.green(`README 생성됨: ${readmePath}`));
}

/**
 * GitLab CI 플러그인 생성
 * @param {string} outputDir 출력 디렉토리
 */
async function generateGitlabPlugin(outputDir) {
  const pluginDir = path.join(outputDir, 'gitlab-ci');
  await fs.ensureDir(pluginDir);
  
  // GitLab CI 설정 파일 생성
  const ciConfigPath = path.join(pluginDir, '.gitlab-ci.yml');
  const ciConfigContent = `stages:
  - test

llm-test:
  stage: test
  image: node:16
  before_script:
    - npm ci
    - npx playwright install --with-deps
  script:
    - npx llm-test run -f test-scenarios/basic.txt --headless
  artifacts:
    paths:
      - test-results/
    reports:
      junit: test-results/reports/*.xml
  variables:
    LLM_API_KEY: $LLM_API_KEY
`;
  
  await fs.writeFile(ciConfigPath, ciConfigContent);
  console.log(chalk.green(`GitLab CI 설정 파일 생성됨: ${ciConfigPath}`));
  
  // README 생성
  const readmePath = path.join(pluginDir, 'README.md');
  const readmeContent = `# LLM-Driven Test GitLab CI 플러그인

GitLab CI/CD에서 LLM-Driven Test를 실행하기 위한 설정입니다.

## 사용 방법

1. 이 디렉토리의 .gitlab-ci.yml 파일을 프로젝트 루트에 복사
2. API 키를 GitLab CI/CD 변수에 'LLM_API_KEY' 이름으로 저장 (보호됨 & 마스킹됨 옵션 활성화)
3. GitLab 저장소에 푸시하여 파이프라인 트리거

## 환경 변수

GitLab CI/CD 변수에 다음 값을 설정할 수 있습니다:
- LLM_API_KEY: LLM API 키 (필수)
- LLM_TEST_FILE: 테스트 시나리오 파일 경로
- LLM_TEST_OUTPUT: 결과 출력 디렉토리
- LLM_TEST_BROWSER: 브라우저 (chromium, firefox, webkit)
`;
  
  await fs.writeFile(readmePath, readmeContent);
  console.log(chalk.green(`README 생성됨: ${readmePath}`));
}

/**
 * Azure DevOps 플러그인 생성
 * @param {string} outputDir 출력 디렉토리
 */
async function generateAzurePlugin(outputDir) {
  const pluginDir = path.join(outputDir, 'azure-devops');
  await fs.ensureDir(pluginDir);
  
  // Azure Pipelines 설정 파일 생성
  const pipelinePath = path.join(pluginDir, 'azure-pipelines.yml');
  const pipelineContent = `trigger:
- main
- master

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '16.x'
  displayName: 'Install Node.js'

- script: npm ci
  displayName: 'Install dependencies'

- script: npx playwright install --with-deps
  displayName: 'Install Playwright browsers'

- script: npx llm-test run -f test-scenarios/basic.txt --headless
  displayName: 'Run LLM-Driven Tests'
  env:
    LLM_API_KEY: $(LLM_API_KEY)

- task: PublishTestResults@2
  condition: succeededOrFailed()
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'test-results/reports/*.xml'
    mergeTestResults: true
    testRunTitle: 'LLM-Driven Tests'

- task: PublishBuildArtifacts@1
  condition: succeededOrFailed()
  inputs:
    pathToPublish: 'test-results'
    artifactName: 'test-results'
`;
  
  await fs.writeFile(pipelinePath, pipelineContent);
  console.log(chalk.green(`Azure Pipelines 설정 파일 생성됨: ${pipelinePath}`));
  
  // README 생성
  const readmePath = path.join(pluginDir, 'README.md');
  const readmeContent = `# LLM-Driven Test Azure DevOps 플러그인

Azure DevOps 파이프라인에서 LLM-Driven Test를 실행하기 위한 설정입니다.

## 사용 방법

1. 이 디렉토리의 azure-pipelines.yml 파일을 프로젝트 루트에 복사
2. Azure DevOps 파이프라인 변수에 'LLM_API_KEY' 변수 추가 (비밀 옵션 활성화)
3. Azure DevOps 파이프라인 설정에서 이 YAML 파일을 선택

## 환경 변수

Azure DevOps 파이프라인 변수에 다음 값을 설정할 수 있습니다:
- LLM_API_KEY: LLM API 키 (필수)
- LLM_TEST_FILE: 테스트 시나리오 파일 경로
- LLM_TEST_OUTPUT: 결과 출력 디렉토리
- LLM_TEST_BROWSER: 브라우저 (chromium, firefox, webkit)
`;
  
  await fs.writeFile(readmePath, readmeContent);
  console.log(chalk.green(`README 생성됨: ${readmePath}`));
}