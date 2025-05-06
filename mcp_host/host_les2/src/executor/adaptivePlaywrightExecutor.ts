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
  pageSnapshot?: string;
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

export class AdaptivePlaywrightExecutor {
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

  private async getPageSnapshot(): Promise<string> {
    // 페이지의 현재 상태를 분석하기 위한 정보 수집
    const url = this.page!.url();
    const title = await this.page!.title();

    // 모든 인터렉티브 요소 찾기
    const elements = await this.page!.evaluate(() => {
      const interactive = Array.from(
        document.querySelectorAll('input, button, textarea, select, a')
      );
      return interactive.map((el) => ({
        tagName: el.tagName.toLowerCase(),
        type: (el as HTMLInputElement).type || '',
        name: (el as HTMLInputElement).name || '',
        id: el.id || '',
        className: el.className || '',
        placeholder: (el as HTMLInputElement).placeholder || '',
        text: el.textContent?.trim() || '',
        value: (el as HTMLInputElement).value || '',
        visible: el.getBoundingClientRect().height > 0,
      }));
    });

    return JSON.stringify(
      {
        url,
        title,
        elements,
      },
      null,
      2
    );
  }

  private async getSelectorForElement(
    step: TestStep,
    pageSnapshot: string
  ): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `현재 페이지 상태와 실행하려는 단계를 분석하여 적절한 선택자를 찾아주세요.

실행하려는 단계:
- 액션: ${step.action}
- 설명: ${step.description}
- 대상: ${step.target || ''}
- 값: ${step.value || ''}

현재 페이지 상태:
${pageSnapshot}

다음 JSON 형식으로만 응답해주세요. 다른 설명은 포함하지 마세요:
{"selector": "적절한CSS선택자"}

YouTube의 경우:
- 검색창: input[name="search_query"]
- 검색 버튼: button[id="search-icon-legacy"]
- 비디오 항목: ytd-video-renderer

응답은 반드시 위의 JSON 형식으로만 해주세요.`,
        },
      ],
    });

    try {
      const content = response.content[0];
      if (content.type === 'text') {
        // JSON 부분만 추출
        const jsonMatch = content.text.match(/\{.*\}/s);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return result.selector;
        }
      }
    } catch (error) {
      console.error('선택자 파싱 실패:', error);

      // 폴백: 기본 선택자 사용
      if (step.action === 'fill' || step.action === 'click') {
        if (step.description.includes('검색')) {
          return 'input[name="search_query"]'; // YouTube 검색창
        }
        if (step.description.includes('버튼')) {
          return 'button[id="search-icon-legacy"]'; // YouTube 검색 버튼
        }
      }
    }

    return step.target || '';
  }

  async executeSteps(steps: TestStep[]) {
    console.log('Starting adaptive test execution...');
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
        // 현재 페이지 상태 캡처
        const pageSnapshot = await this.getPageSnapshot();
        stepResult.pageSnapshot = pageSnapshot;

        switch (step.action) {
          case 'navigate':
            const url = step.target || step.value;
            if (!url) {
              throw new Error('URL이 지정되지 않았습니다.');
            }
            await this.page!.goto(url);
            await this.page!.waitForLoadState('networkidle');
            // YouTube 로딩 대기
            await this.page!.waitForTimeout(2000);
            break;

          case 'fill':
            const fillValue = step.value;
            if (!fillValue) {
              throw new Error('입력할 값이 지정되지 않았습니다.');
            }

            // YouTube 특별 처리
            if (this.page!.url().includes('youtube.com')) {
              try {
                // YouTube 검색창 선택자들
                const youtubeSelectors = [
                  'input[name="search_query"]',
                  'input#search',
                  '#search-input input',
                  'input[placeholder*="검색"]',
                  'input[placeholder*="Search"]',
                ];

                let element = null;
                for (const selector of youtubeSelectors) {
                  try {
                    element = await this.page!.waitForSelector(selector, {
                      timeout: 3000,
                    });
                    if (element) {
                      console.log(`YouTube 검색창 찾음: ${selector}`);
                      break;
                    }
                  } catch {
                    continue;
                  }
                }

                if (element) {
                  await element.click();
                  await this.page!.waitForTimeout(500);
                  await element.fill(fillValue);
                  await this.page!.waitForTimeout(500);
                  // Enter 키 대신 검색 버튼 클릭 시도
                  const searchButton = await this.page!.$(
                    'button[id="search-icon-legacy"]'
                  );
                  if (searchButton) {
                    await searchButton.click();
                  } else {
                    await this.page!.keyboard.press('Enter');
                  }
                  await this.page!.waitForLoadState('networkidle');
                } else {
                  throw new Error('YouTube 검색창을 찾을 수 없습니다.');
                }
              } catch (error) {
                console.error('YouTube 검색 실패:', error);
                throw error;
              }
            } else {
              // 일반 사이트 처리
              const selector = await this.getSelectorForElement(
                step,
                pageSnapshot
              );
              console.log(`AI가 찾은 선택자: ${selector}`);

              const element = await this.page!.waitForSelector(selector, {
                timeout: 5000,
              });
              if (element) {
                await element.click();
                await element.fill(fillValue);
                await this.page!.keyboard.press('Enter');
                await this.page!.waitForLoadState('networkidle');
              }
            }
            break;

          case 'click':
            const selector = await this.getSelectorForElement(
              step,
              pageSnapshot
            );
            console.log(`AI가 찾은 선택자: ${selector}`);

            await this.page!.click(selector);
            await this.page!.waitForLoadState('networkidle');
            break;

          case 'wait':
            // wait 액션 구현
            if (step.target) {
              await this.page!.waitForSelector(step.target, { timeout: 10000 });
            } else {
              await this.page!.waitForTimeout(2000);
            }
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
        stepResult.aiComment = await this.getAIComment(step, stepResult);
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

        stepResult.aiComment = await this.getAIComment(step, stepResult);
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

    // Playwright HTML 리포트 생성
    await this.generatePlaywrightReport();

    // 테스트 리포트 저장
    const reportPath = path.join(
      this.outputDir,
      `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(this.testReport, null, 2));

    console.log(`\nTest report saved to: ${reportPath}`);

    // 콘솔에 요약 출력
    console.log('\n=== Test Summary ===');
    console.log(`Total steps: ${this.testReport.totalSteps}`);
    console.log(`Passed: ${this.testReport.passedSteps}`);
    console.log(`Failed: ${this.testReport.failedSteps}`);
    console.log(`Duration: ${this.testReport.duration}ms`);
    console.log('\nAI Final Comment:');
    console.log(this.testReport.finalComment);
  }

  private async generatePlaywrightReport() {
    // Playwright HTML 리포트 생성
    const { test } = require('@playwright/test');
    const { chromium } = require('playwright');

    // Playwright 테스트 스타일의 리포트 생성
    const playwrightReportPath = path.join(this.outputDir, 'playwright-report');

    // HTML 리포트 설정
    process.env.PLAYWRIGHT_HTML_REPORT = playwrightReportPath;

    console.log(
      `Playwright HTML report will be generated at: ${playwrightReportPath}`
    );
  }

  private async getAIComment(
    step: TestStep,
    stepResult: StepResult
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
- 결과: ${stepResult.status}
${stepResult.error ? `- 에러: ${stepResult.error}` : ''}

이 단계의 실행 결과에 대해 간단히 평가해주세요. 실패한 경우 개선 방안을 제시해주세요.`,
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

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
