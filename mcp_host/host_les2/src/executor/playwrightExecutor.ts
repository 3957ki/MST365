import { chromium, Browser, Page } from 'playwright';
import { TestStep } from '../parser/scenarioParser';
import * as path from 'path';
import * as fs from 'fs/promises';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

interface StepResult {
  step: TestStep;
  status: 'success' | 'failed';
  startTime: string;
  endTime: string;
  duration: number;
  screenshot?: string;
  error?: string;
  aiComment?: string;
}

interface TestReport {
  testName: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  steps: StepResult[];
  finalComment?: string;
}

export class PlaywrightExecutor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private testReport: TestReport;
  private anthropic: Anthropic;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'test-results');
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.testReport = {
      testName: 'Natural Language Test',
      startTime: '',
      endTime: '',
      duration: 0,
      totalSteps: 0,
      passedSteps: 0,
      failedSteps: 0,
      steps: [],
    };
  }

  async initialize() {
    await fs.mkdir(this.outputDir, { recursive: true });
    this.browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized'],
    });
    this.page = await this.browser.newPage();
  }

  async executeSteps(steps: TestStep[]) {
    console.log('Starting test execution...');
    console.log(`Results will be saved to: ${this.outputDir}`);

    this.testReport.startTime = new Date().toISOString();
    this.testReport.totalSteps = steps.length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`\nExecuting Step ${i + 1}: ${step.description}`);

      const stepResult: StepResult = {
        step: step,
        status: 'success',
        startTime: new Date().toISOString(),
        endTime: '',
        duration: 0,
      };

      try {
        switch (step.action) {
          case 'navigate':
            const url = step.target || step.value;
            if (!url) {
              throw new Error('URL이 지정되지 않았습니다.');
            }
            await this.page!.goto(url);
            await this.page!.waitForLoadState('networkidle');
            break;

          case 'fill':
            const fillValue = step.value;
            if (!fillValue) {
              throw new Error('입력할 값이 지정되지 않았습니다.');
            }

            // 여러 가능한 검색창 선택자 시도
            const searchSelectors = [
              '#query', // 네이버 메인 검색창
              'input[name="query"]',
              'input[type="search"]',
              '.search_input',
              'input[placeholder*="검색"]',
            ];

            let searchInput = null;
            for (const selector of searchSelectors) {
              try {
                searchInput = await this.page!.waitForSelector(selector, {
                  timeout: 5000,
                });
                if (searchInput) break;
              } catch {
                continue;
              }
            }

            if (searchInput) {
              await searchInput.click();
              await searchInput.fill(fillValue);
              // Enter 키를 눌러 검색 실행
              await this.page!.keyboard.press('Enter');
              await this.page!.waitForLoadState('networkidle');
            } else {
              throw new Error('검색창을 찾을 수 없습니다.');
            }
            break;

          case 'click':
            const clickTarget = step.target;
            if (!clickTarget) {
              throw new Error('클릭할 대상이 지정되지 않았습니다.');
            }
            await this.page!.click(clickTarget);
            await this.page!.waitForLoadState('networkidle');
            break;

          case 'screenshot':
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(
              this.outputDir,
              `step-${i + 1}-${timestamp}.png`
            );
            await this.page!.screenshot({
              path: screenshotPath,
              fullPage: true,
            });
            stepResult.screenshot = screenshotPath;
            console.log(`Screenshot saved: ${screenshotPath}`);
            break;

          default:
            console.warn(`Unknown action: ${step.action}`);
        }

        stepResult.status = 'success';
        this.testReport.passedSteps++;

        // 각 단계 후 스크린샷 캡처
        if (step.action !== 'screenshot') {
          const autoScreenshotPath = path.join(
            this.outputDir,
            `auto-step-${i + 1}-${new Date()
              .toISOString()
              .replace(/[:.]/g, '-')}.png`
          );
          await this.page!.screenshot({ path: autoScreenshotPath });
          stepResult.screenshot = autoScreenshotPath;
        }

        // AI에게 결과 분석 요청
        stepResult.aiComment = await this.getAIComment(step, stepResult.status);
      } catch (error) {
        console.error(`Error executing step "${step.description}":`, error);
        stepResult.status = 'failed';
        stepResult.error =
          error instanceof Error ? error.message : String(error);
        this.testReport.failedSteps++;

        // 에러 발생 시 스크린샷
        const errorScreenshotPath = path.join(
          this.outputDir,
          `error-step-${i + 1}-${new Date()
            .toISOString()
            .replace(/[:.]/g, '-')}.png`
        );
        await this.page!.screenshot({ path: errorScreenshotPath });
        stepResult.screenshot = errorScreenshotPath;

        stepResult.aiComment = await this.getAIComment(
          step,
          stepResult.status,
          error
        );
      }

      stepResult.endTime = new Date().toISOString();
      stepResult.duration =
        new Date(stepResult.endTime).getTime() -
        new Date(stepResult.startTime).getTime();
      this.testReport.steps.push(stepResult);

      // 각 단계 사이에 대기
      await this.page!.waitForTimeout(1000);
    }

    this.testReport.endTime = new Date().toISOString();
    this.testReport.duration =
      new Date(this.testReport.endTime).getTime() -
      new Date(this.testReport.startTime).getTime();

    // 최종 테스트 결과에 대한 AI 코멘트
    this.testReport.finalComment = await this.getFinalTestComment();

    // 테스트 리포트 저장
    const reportPath = path.join(
      this.outputDir,
      `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(this.testReport, null, 2));

    // HTML 리포트 생성
    const htmlReport = this.generateHTMLReport();
    const htmlPath = path.join(
      this.outputDir,
      `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.html`
    );
    await fs.writeFile(htmlPath, htmlReport);

    console.log(`\nTest report saved to: ${reportPath}`);
    console.log(`HTML report saved to: ${htmlPath}`);

    // 콘솔에 요약 출력
    console.log('\n=== Test Summary ===');
    console.log(`Total steps: ${this.testReport.totalSteps}`);
    console.log(`Passed: ${this.testReport.passedSteps}`);
    console.log(`Failed: ${this.testReport.failedSteps}`);
    console.log(`Duration: ${this.testReport.duration}ms`);
    console.log('\nAI Final Comment:');
    console.log(this.testReport.finalComment);
  }

  private async getAIComment(
    step: TestStep,
    status: string,
    error?: any
  ): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `테스트 단계를 분석해주세요:
- 단계 설명: ${step.description}
- 액션: ${step.action}
- 대상: ${step.target || step.value}
- 결과: ${status}
${error ? `- 에러: ${error.message || error}` : ''}

이 단계의 실행 결과에 대해 간단히 평가해주세요.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
      return '평가를 생성할 수 없습니다.';
    } catch (error) {
      console.error('AI 코멘트 생성 실패:', error);
      return '평가를 생성할 수 없습니다.';
    }
  }

  private async getFinalTestComment(): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `전체 테스트 결과를 분석해주세요:
- 총 단계: ${this.testReport.totalSteps}
- 성공: ${this.testReport.passedSteps}
- 실패: ${this.testReport.failedSteps}
- 실행 시간: ${this.testReport.duration}ms

각 단계:
${this.testReport.steps
  .map((step, i) => `${i + 1}. ${step.step.description} - ${step.status}`)
  .join('\n')}

전체 테스트에 대한 종합적인 평가와 개선 사항을 제시해주세요.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
      return '평가를 생성할 수 없습니다.';
    } catch (error) {
      console.error('최종 평가 생성 실패:', error);
      return '평가를 생성할 수 없습니다.';
    }
  }

  private generateHTMLReport(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Report - ${new Date().toLocaleString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { margin: 20px 0; }
        .step { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .success { background: #dff0d8; }
        .failed { background: #f2dede; }
        .screenshot { max-width: 600px; margin: 10px 0; border: 1px solid #ddd; }
        .comment { background: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 3px solid #337ab7; }
    </style>
</head>
<body>
    <div class="header">
        <h1>테스트 실행 보고서</h1>
        <p>실행 시간: ${new Date(
          this.testReport.startTime
        ).toLocaleString()}</p>
        <p>소요 시간: ${this.testReport.duration}ms</p>
    </div>
    
    <div class="summary">
        <h2>요약</h2>
        <p>총 단계: ${this.testReport.totalSteps}</p>
        <p>성공: ${this.testReport.passedSteps}</p>
        <p>실패: ${this.testReport.failedSteps}</p>
    </div>
    
    <div class="steps">
        <h2>상세 단계</h2>
        ${this.testReport.steps
          .map(
            (step, i) => `
            <div class="step ${step.status}">
                <h3>단계 ${i + 1}: ${step.step.description}</h3>
                <p>상태: ${step.status}</p>
                <p>액션: ${step.step.action}</p>
                <p>대상: ${step.step.target || step.step.value || ''}</p>
                ${step.error ? `<p>에러: ${step.error}</p>` : ''}
                ${
                  step.screenshot
                    ? `<img class="screenshot" src="${path.basename(
                        step.screenshot
                      )}" alt="Screenshot">`
                    : ''
                }
                ${
                  step.aiComment
                    ? `<div class="comment"><strong>AI 평가:</strong> ${step.aiComment}</div>`
                    : ''
                }
            </div>
        `
          )
          .join('')}
    </div>
    
    ${
      this.testReport.finalComment
        ? `
    <div class="final-comment">
        <h2>최종 평가</h2>
        <div class="comment">${this.testReport.finalComment}</div>
    </div>
    `
        : ''
    }
</body>
</html>
    `;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
