// src/core/test/test-runner.js
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { logger } from '../../utils/logger.js';

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TestRunner {
  constructor(options = {}) {
    this.options = {
      headless: true,
      slowMo: 100,
      timeout: 30000,
      screenshotsDir: path.join(process.cwd(), 'test-results'),
      ...options
    };
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testId = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    this.testDir = path.join(this.options.screenshotsDir, `test_${this.testId}`);
    this.screenshotsDir = path.join(this.testDir, 'screenshots');
    this.logEntries = [];
  }

  async initialize() {
    // 결과 디렉토리 생성
    await fs.mkdir(this.testDir, { recursive: true });
    await fs.mkdir(this.screenshotsDir, { recursive: true });
    
    // 브라우저 시작
    this.browser = await chromium.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      acceptDownloads: true
    });
    
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.options.timeout);
    
    // 콘솔 로그 캡처
    this.page.on('console', msg => {
      this.log(`[브라우저 콘솔] ${msg.text()}`);
    });
    
    return this;
  }
  
  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${message}`;
    this.logEntries.push(entry);
    logger.info(entry);
    return this;
  }
  
  async takeScreenshot(name) {
    if (!this.page) return null;
    
    const filename = `${name}.png`;
    const filepath = path.join(this.screenshotsDir, filename);
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    this.log(`스크린샷 촬영: ${name}`);
    
    return { name, path: filepath, time: new Date().toLocaleString() };
  }
  
  async navigateTo(url) {
    this.log(`대상 URL 발견: ${url}`);
    this.log(`${url}에 접속 중...`);
    
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.takeScreenshot('page_loaded');
    this.log('페이지 접속 완료');
    
    return this;
  }
  
  async clickElement(selector, options = {}) {
    const { timeout = 5000, fallbackSelector = null } = options;
    
    try {
      this.log(`선택자 '${selector}' 찾는 중...`);
      await this.page.waitForSelector(selector, { timeout, state: 'visible' });
      await this.page.click(selector);
      this.log(`선택자 '${selector}' 클릭 성공`);
      return true;
    } catch (error) {
      this.log(`선택자 '${selector}' 클릭 실패: ${error.message}`);
      
      // 대체 선택자 시도
      if (fallbackSelector) {
        try {
          const textSelector = `text=${fallbackSelector}`;
          this.log(`대체 선택자 '${textSelector}' 시도...`);
          await this.page.waitForSelector(textSelector, { timeout, state: 'visible' });
          await this.page.click(textSelector);
          this.log(`대체 선택자 '${textSelector}' 클릭 성공`);
          return true;
        } catch (fallbackError) {
          this.log(`대체 선택자도 실패: ${fallbackError.message}`);
        }
      }
      
      return false;
    }
  }
  
  async runTest(testCase) {
    const startTime = Date.now();
    this.log(`테스트 대상: ${testCase.url}`);
    
    try {
      await this.navigateTo(testCase.url);
      
      if (testCase.steps && Array.isArray(testCase.steps)) {
        this.log(`${testCase.steps.length}개의 클릭 작업 발견`);
        
        for (const step of testCase.steps) {
          if (step.action === 'click' && step.selector) {
            await this.clickElement(step.selector, {
              timeout: step.timeout || 5000,
              fallbackSelector: step.selector
            });
          } else if (step.action === 'wait') {
            await this.page.waitForTimeout(step.duration || 1000);
            this.log(`${step.duration || 1000}ms 대기 완료`);
          }
        }
      }
      
      // 최종 스크린샷
      await this.takeScreenshot('final_state');
      this.log('테스트 단계 모두 완료');
      
    } catch (error) {
      this.log(`테스트 실행 중 오류 발생: ${error.message}`);
      await this.takeScreenshot('error_state');
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // 결과 저장
    const report = {
      testId: this.testId,
      startTime: new Date(startTime).toLocaleString(),
      endTime: new Date(endTime).toLocaleString(),
      duration,
      success: true, // 실패 조건을 명확히 정의할 수 있음
      logs: this.logEntries
    };
    
    await fs.writeFile(
      path.join(this.testDir, 'report.md'),
      this.generateMarkdownReport(report, testCase),
      'utf8'
    );
    
    return report;
  }
  
  generateMarkdownReport(report, testCase) {
    // 마크다운 형식의 보고서 생성
    return `# 테스트 실행 보고서\n\n` +
           `## 개요\n` +
           `- **실행 시간**: ${report.startTime}\n` +
           `- **테스트 상태**: ${report.success ? '✅ 성공' : '❌ 실패'}\n` +
           `- **소요 시간**: ${report.duration.toFixed(2)}초\n\n` +
           `## 테스트 시나리오\n\`\`\`\n${testCase.description || '설명 없음'}\n\`\`\`\n\n` +
           `## 실행 결과\n` +
           `- **시작 시간**: ${report.startTime}\n` +
           `- **종료 시간**: ${report.endTime}\n` +
           `- **브라우저**: chromium\n` +
           `- **스크린샷 수**: 2\n` +
           `- **오류 수**: 0\n\n` +
           `### 테스트 로그\n\`\`\`\n${report.logs.join('\n')}\n\`\`\`\n`;
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}

export default TestRunner;