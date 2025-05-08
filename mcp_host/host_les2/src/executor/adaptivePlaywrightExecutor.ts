import { chromium, Browser, Page } from 'playwright';
import { TestStep } from '../parser/scenarioParser';
import * as path from 'path';
import * as fs from 'fs/promises';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as os from 'os';
import * as childProcess from 'child_process';
import { promisify } from 'util';

const exec = promisify(childProcess.exec);
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
  htmlReportURL?: string; // HTML 리포트 경로 추가
}

export class AdaptivePlaywrightExecutor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private testRunDir: string; // 테스트 실행별 디렉토리
  private screenshotsDir: string; // 스크린샷 디렉토리
  private testReport: TestReport;
  private anthropic: Anthropic;

  constructor() {
    // 기본 출력 디렉토리
    this.outputDir = path.join(process.cwd(), 'test-results');
    
    // 타임스탬프가 포함된 테스트 실행 폴더 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.testRunDir = path.join(this.outputDir, `test-run-${timestamp}`);
    
    // 스크린샷 디렉토리
    this.screenshotsDir = path.join(this.testRunDir, 'screenshots');
    
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
    // 디렉토리 구조 생성
    await fs.mkdir(this.testRunDir, { recursive: true });
    await fs.mkdir(this.screenshotsDir, { recursive: true });
    
    console.log(`테스트 실행 디렉토리: ${this.testRunDir}`);
    console.log(`스크린샷 디렉토리: ${this.screenshotsDir}`);
    
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
      model: 'claude-3-haiku-20240307',
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
    console.log(`Results will be saved to: ${this.testRunDir}`);

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
            // 스크린샷 시간 타임스탬프
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(
              this.screenshotsDir,
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
            this.screenshotsDir,
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
          this.screenshotsDir,
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
    const htmlReportPath = await this.generatePlaywrightReport();
    this.testReport.htmlReportURL = htmlReportPath;

    // 테스트 리포트 저장
    const reportPath = path.join(
      this.testRunDir,
      `test-report.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(this.testReport, null, 2));

    console.log(`\nTest report saved to: ${reportPath}`);

    // 콘솔에 요약 출력
    console.log('\n=== Test Summary ===');
    console.log(`Total steps: ${this.testReport.totalSteps}`);
    console.log(`Passed: ${this.testReport.passedSteps}`);
    console.log(`Failed: ${this.testReport.failedSteps}`);
    console.log(`Duration: ${this.testReport.duration}ms`);
    console.log(`HTML Report: ${this.testReport.htmlReportURL}`);
    console.log('\nAI Final Comment:');
    console.log(this.testReport.finalComment);
  }

  private async generatePlaywrightReport(): Promise<string> {
    const htmlReportDir = path.join(this.testRunDir, 'html-report');
    await fs.mkdir(htmlReportDir, { recursive: true });
    
    console.log(`Generating Playwright HTML report at: ${htmlReportDir}`);
    
    try {
      // 테스트 실행 결과를 HTML 파일로 변환
      const stepsHtml = this.testReport.steps.map((step, index) => {
        const statusClass = step.status === 'success' ? 'success' : 'failure';
        const screenshotHtml = step.screenshot 
          ? `<div class="screenshot"><img src="${path.relative(htmlReportDir, step.screenshot)}" alt="Screenshot" width="800" /></div>` 
          : '';
          
        return `
          <div class="test-step ${statusClass}">
            <h3>Step ${index + 1}: ${step.step.description}</h3>
            <div class="step-details">
              <p><strong>Action:</strong> ${step.step.action}</p>
              <p><strong>Target:</strong> ${step.step.target || 'N/A'}</p>
              <p><strong>Value:</strong> ${step.step.value || 'N/A'}</p>
              <p><strong>Status:</strong> ${step.status}</p>
              <p><strong>Duration:</strong> ${step.duration}ms</p>
              ${step.error ? `<p class="error"><strong>Error:</strong> ${step.error}</p>` : ''}
            </div>
            ${screenshotHtml}
            <div class="ai-comment">
              <h4>AI Analysis:</h4>
              <p>${step.aiComment || 'No analysis available'}</p>
            </div>
          </div>
        `;
      }).join('');
      
      // HTML 템플릿 생성
      const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.testReport.testName} - 테스트 결과</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          .test-summary {
            background-color: #f8f9fa;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 30px;
          }
          .test-step {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .success {
            border-left: 5px solid #28a745;
          }
          .failure {
            border-left: 5px solid #dc3545;
          }
          .step-details {
            margin-bottom: 15px;
          }
          .screenshot {
            margin: 15px 0;
            text-align: center;
          }
          .screenshot img {
            max-width: 100%;
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .ai-comment {
            background-color: #f0f7ff;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
          }
          .error {
            color: #dc3545;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
            text-align: left;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
        </style>
      </head>
      <body>
        <h1>${this.testReport.testName}</h1>
        
        <div class="test-summary">
          <h2>테스트 요약</h2>
          <table>
            <tr>
              <th>시작 시간</th>
              <td>${new Date(this.testReport.startTime).toLocaleString()}</td>
            </tr>
            <tr>
              <th>종료 시간</th>
              <td>${new Date(this.testReport.endTime).toLocaleString()}</td>
            </tr>
            <tr>
              <th>실행 시간</th>
              <td>${this.testReport.duration}ms</td>
            </tr>
            <tr>
              <th>총 단계</th>
              <td>${this.testReport.totalSteps}</td>
            </tr>
            <tr>
              <th>성공</th>
              <td>${this.testReport.passedSteps}</td>
            </tr>
            <tr>
              <th>실패</th>
              <td>${this.testReport.failedSteps}</td>
            </tr>
          </table>
          
          <h3>최종 분석</h3>
          <div class="ai-comment">
            <p>${this.testReport.finalComment || '분석 정보가 없습니다.'}</p>
          </div>
        </div>
        
        <h2>테스트 단계</h2>
        <div class="test-steps">
          ${stepsHtml}
        </div>
      </body>
      </html>
      `;
      
      // HTML 파일 저장
      const htmlFilePath = path.join(htmlReportDir, 'index.html');
      await fs.writeFile(htmlFilePath, htmlTemplate);
      
      // 스크린샷 파일 복사 - 상대 경로 처리를 위해
      // 실제 운영 환경에서는 이미지를 복사하거나 심볼릭 링크를 만드는 것이 좋음
      // 여기서는 상대 경로로 참조하는 예시만 포함
      
      // 브라우저에서 HTML 보고서 열기 (선택 사항)
      const openReport = async () => {
        const url = `file://${htmlFilePath}`;
        const command = os.platform() === 'win32' 
          ? `start "${url}"` 
          : os.platform() === 'darwin' 
            ? `open "${url}"` 
            : `xdg-open "${url}"`;
            
        try {
          await exec(command);
          console.log(`HTML report opened in default browser: ${url}`);
        } catch (error) {
          console.error('Failed to open HTML report in browser:', error);
        }
      };
      
      // 선택적으로 브라우저에서 열기
      // await openReport();
      
      return htmlFilePath;
    } catch (error) {
      console.error('HTML 리포트 생성 실패:', error);
      return `Failed to generate HTML report: ${error}`;
    }
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