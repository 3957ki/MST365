import { TestStep } from '../parser/scenarioParser';
import * as path from 'path';
import * as fs from 'fs/promises';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as os from 'os';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { MCPClient } from '../mcp/mcpClient';


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
  htmlReportURL?: string;
}


async function saveScreenshot(screenshotResult: any, filePath: string): Promise<boolean> {
  try {
    // 작업할 데이터가 있는지 확인
    if (!screenshotResult) {
      console.error('스크린샷 데이터가 없습니다');
      return false;
    }
    
    // 디버그 정보 - 받은 데이터의 구조 로깅
    console.log('스크린샷 결과 타입:', typeof screenshotResult);
    if (typeof screenshotResult === 'object') {
      console.log('스크린샷 결과 키:', Object.keys(screenshotResult));
    }

    // 바이너리 데이터 직접 접근 방식
    if (screenshotResult.binary) {
      let imageData = screenshotResult.binary;
      
      // 문자열인지 확인
      if (typeof imageData === 'string') {
        // base64 데이터 URL인지 확인
        const base64Prefix = /^data:image\/[a-zA-Z]+;base64,/;
        if (base64Prefix.test(imageData)) {
          imageData = imageData.replace(base64Prefix, '');
        }
        
        // 버퍼를 파일로 쓰기
        await fs.writeFile(filePath, Buffer.from(imageData, 'base64'));
        console.log(`바이너리 데이터를 사용하여 스크린샷 저장됨: ${filePath}`);
        return true;
      }
    }
    
    // content 배열 접근 방식
    if (screenshotResult.content && Array.isArray(screenshotResult.content)) {
      for (const item of screenshotResult.content) {
        if (item.type === 'image' && item.data) {
          let data = item.data;
          
          // 문자열인 경우만 처리
          if (typeof data === 'string') {
            // base64 접두사가 있으면 제거
            const base64Prefix = /^data:image\/[a-zA-Z]+;base64,/;
            if (base64Prefix.test(data)) {
              data = data.replace(base64Prefix, '');
            }
            
            await fs.writeFile(filePath, Buffer.from(data, 'base64'));
            console.log(`content 배열에서 스크린샷 저장됨: ${filePath}`);
            return true;
          }
        }
      }
    }
    
    // 원시 버퍼 데이터 시도
    if (Buffer.isBuffer(screenshotResult)) {
      await fs.writeFile(filePath, screenshotResult);
      console.log(`원시 버퍼로 스크린샷 저장됨: ${filePath}`);
      return true;
    }
    
    // 마지막 수단: 결과에서 base64 인코딩된 문자열 찾기
    const resultString = JSON.stringify(screenshotResult);
    const base64Pattern = /"data":"([A-Za-z0-9+/=]+)"/;
    const base64Match = resultString.match(base64Pattern);
    
    if (base64Match && base64Match[1]) {
      await fs.writeFile(filePath, Buffer.from(base64Match[1], 'base64'));
      console.log(`추출된 base64 데이터로 스크린샷 저장됨: ${filePath}`);
      return true;
    }
    
    // 아무것도 작동하지 않으면 디버그 정보 저장
    console.error('유효한 스크린샷 데이터를 추출하지 못했습니다');
    const debugPath = `${filePath}.debug.json`;
    await fs.writeFile(debugPath, JSON.stringify(screenshotResult, null, 2));
    console.log(`디버그 정보가 저장됨: ${debugPath}`);
    
    return false;
  } catch (error) {
    console.error('스크린샷 저장 오류:', error);
    return false;
  }
}
export class AdaptivePlaywrightExecutor {
  private mcpClient: MCPClient;
  private outputDir: string;
  private testRunDir: string; // 테스트 실행별 디렉토리
  private screenshotsDir: string; // 스크린샷 디렉토리
  private testReport: TestReport;
  private anthropic: Anthropic;
  private browserContextId: string | null = null;
  private pageId: string | null = null;

  constructor() {
    // 기본 출력 디렉토리
    this.outputDir = path.join(process.cwd(), 'test-results');
    
    // 타임스탬프가 포함된 테스트 실행 폴더 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.testRunDir = path.join(this.outputDir, `test-run-${timestamp}`);
    
    // 스크린샷 디렉토리
    this.screenshotsDir = path.join(this.testRunDir, 'screenshots');
    
    this.mcpClient = new MCPClient();
    
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
    
    try {
      // MCP 클라이언트 연결
      await this.mcpClient.connect();
      
      // 브라우저 시작
      const launchResult = await this.mcpClient.executeAction('browserLaunch', {
        name: 'chromium',
        headless: false,
        args: ['--start-maximized']
      });
      
      // 브라우저 컨텍스트 생성
      const contextResult = await this.mcpClient.executeAction('browserNewContext', {
        browser: launchResult.browserId
      });
      this.browserContextId = contextResult.contextId;
      
      // 페이지 생성
      const pageResult = await this.mcpClient.executeAction('contextNewPage', {
        context: this.browserContextId
      });
      this.pageId = pageResult.pageId;
      
      console.log('브라우저와 페이지 초기화 완료');
    } catch (error) {
      console.error('브라우저 초기화 실패:', error);
      throw error;
    }
  }

  private async getPageSnapshot(): Promise<string> {
    try {
      // 현재 URL 가져오기
      const urlResult = await this.mcpClient.executeAction('pageUrl', {
        page: this.pageId
      });
      const url = urlResult.url;
      
      // 페이지 제목 가져오기
      const titleResult = await this.mcpClient.executeAction('pageTitle', {
        page: this.pageId
      });
      const title = titleResult.title;
      
      // 페이지의 인터랙티브 요소 가져오기
      const elementsResult = await this.mcpClient.executeAction('pageEvaluate', {
        page: this.pageId,
        expression: `() => {
          const interactive = Array.from(
            document.querySelectorAll('input, button, textarea, select, a')
          );
          return interactive.map(el => ({
            tagName: el.tagName.toLowerCase(),
            type: el.type || '',
            name: el.name || '',
            id: el.id || '',
            className: el.className || '',
            placeholder: el.placeholder || '',
            text: el.textContent?.trim() || '',
            value: el.value || '',
            visible: el.getBoundingClientRect().height > 0,
          }));
        }`
      });
      
      return JSON.stringify(
        {
          url,
          title,
          elements: elementsResult.result
        },
        null,
        2
      );
    } catch (error) {
      console.error('페이지 스냅샷 가져오기 실패:', error);
      return JSON.stringify(
        {
          url: 'unknown',
          title: 'unknown',
          elements: []
        },
        null,
        2
      );
    }
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
    console.log('테스트 실행을 시작합니다...');
    console.log(`결과는 다음 위치에 저장됩니다: ${this.testRunDir}`);

    this.testReport.startTime = new Date().toISOString();
    this.testReport.totalSteps = steps.length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`\n단계 ${i + 1} 실행: ${step.description}`);

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
            
            console.log(`${url}로 이동 중...`);
            await this.mcpClient.executeAction('pageGoto', {
              page: this.pageId,
              url: url
            });
            
            await this.mcpClient.executeAction('pageWaitForLoadState', {
              page: this.pageId,
              state: 'networkidle'
            });
            
            // 페이지 로딩 대기
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(`페이지 이동 완료: ${url}`);
            break;

          case 'fill':
            const fillValue = step.value;
            if (!fillValue) {
              throw new Error('입력할 값이 지정되지 않았습니다.');
            }

            // YouTube 특별 처리
            if (pageSnapshot.includes('youtube.com')) {
              try {
                // YouTube 검색창 선택자들
                const youtubeSelectors = [
                  'input[name="search_query"]',
                  'input#search',
                  '#search-input input',
                  'input[placeholder*="검색"]',
                  'input[placeholder*="Search"]',
                ];

                let selectorFound = false;
                for (const selector of youtubeSelectors) {
                  try {
                    // 요소 존재 확인
                    const visibleResult = await this.mcpClient.executeAction('pageIsVisible', {
                      page: this.pageId,
                      selector: selector,
                      timeout: 3000
                    });
                    
                    if (visibleResult.visible) {
                      console.log(`YouTube 검색창 찾음: ${selector}`);
                      
                      // 요소 클릭
                      await this.mcpClient.executeAction('pageClick', {
                        page: this.pageId,
                        selector: selector
                      });
                      
                      // 대기
                      await new Promise(resolve => setTimeout(resolve, 500));
                      
                      // 필드 채우기
                      await this.mcpClient.executeAction('pageFill', {
                        page: this.pageId,
                        selector: selector,
                        value: fillValue
                      });
                      
                      // 대기
                      await new Promise(resolve => setTimeout(resolve, 500));
                      
                      // 검색 버튼 클릭 시도
                      const searchButtonVisible = await this.mcpClient.executeAction('pageIsVisible', {
                        page: this.pageId,
                        selector: 'button[id="search-icon-legacy"]',
                        timeout: 1000
                      });
                      
                      if (searchButtonVisible.visible) {
                        await this.mcpClient.executeAction('pageClick', {
                          page: this.pageId,
                          selector: 'button[id="search-icon-legacy"]'
                        });
                      } else {
                        // Enter 키 입력
                        await this.mcpClient.executeAction('pagePress', {
                          page: this.pageId,
                          selector: selector,
                          key: 'Enter'
                        });
                      }
                      
                      await this.mcpClient.executeAction('pageWaitForLoadState', {
                        page: this.pageId,
                        state: 'networkidle'
                      });
                      
                      selectorFound = true;
                      break;
                    }
                  } catch {
                    continue;
                  }
                }

                if (!selectorFound) {
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

              // 요소 기다리기
              await this.mcpClient.executeAction('pageWaitForSelector', {
                page: this.pageId,
                selector: selector,
                timeout: 5000
              });
              
              // 요소 클릭
              await this.mcpClient.executeAction('pageClick', {
                page: this.pageId,
                selector: selector
              });
              
              // 값 입력
              await this.mcpClient.executeAction('pageFill', {
                page: this.pageId,
                selector: selector,
                value: fillValue
              });
              console.log(`입력 완료: "${fillValue}"`);
              
              // Enter 키 입력이 필요한 경우
              if (step.description.includes('검색') || step.description.includes('로그인')) {
                await this.mcpClient.executeAction('pagePress', {
                  page: this.pageId,
                  selector: selector,
                  key: 'Enter'
                });
                console.log('Enter 키 입력 완료');
              }
              
              // 페이지 로딩 대기
              await this.mcpClient.executeAction('pageWaitForLoadState', {
                page: this.pageId,
                state: 'networkidle'
              });
            }
            break;

          case 'click':
            const selector = await this.getSelectorForElement(
              step,
              pageSnapshot
            );
            console.log(`클릭할 선택자: ${selector}`);

            // 요소 클릭
            await this.mcpClient.executeAction('pageClick', {
              page: this.pageId,
              selector: selector
            });
            console.log(`선택자 ${selector} 클릭 완료`);
            
            // 페이지 로딩 대기
            await this.mcpClient.executeAction('pageWaitForLoadState', {
              page: this.pageId,
              state: 'networkidle'
            });
            break;

          case 'wait':
            // wait 액션 구현
            if (step.target) {
              console.log(`요소 대기 중: ${step.target}`);
              await this.mcpClient.executeAction('pageWaitForSelector', {
                page: this.pageId,
                selector: step.target,
                timeout: 10000
              });
              console.log(`요소 발견: ${step.target}`);
            } else {
              console.log(`${step.value || 2000}ms 동안 대기 중...`);
              const waitTime = step.value ? parseInt(step.value) : 2000;
              await new Promise(resolve => setTimeout(resolve, waitTime));
              console.log(`대기 완료`);
            }
            break;

          case 'screenshot':
            // 스크린샷 시간 타임스탬프
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(
              this.screenshotsDir,
              `step-${i + 1}-${timestamp}.png`
            );
            
            console.log('스크린샷 촬영 중...');
            
            // 스크린샷 촬영
            const screenshotResult = await this.mcpClient.executeAction('pageScreenshot', {
              page: this.pageId,
              fullPage: true
            });
            
            // 향상된 스크린샷 저장 함수 사용
            const saved = await saveScreenshot(screenshotResult, screenshotPath);
            if (saved) {
              stepResult.screenshot = screenshotPath;
              console.log(`스크린샷 저장됨: ${screenshotPath}`);
            } else {
              console.error('스크린샷 저장 실패');
            }
            break;

          default:
            console.warn(`알 수 없는 액션: ${step.action}`);
        }

        stepResult.status = 'success';
        this.testReport.passedSteps++;
        console.log(`단계 성공: ${step.description}`);

        // 각 단계 후 스크린샷 캡처 (screenshot 액션이 아닌 경우)
        if (step.action !== 'screenshot') {
          const autoScreenshotPath = path.join(
            this.screenshotsDir,
            `auto-step-${i + 1}-${new Date()
              .toISOString()
              .replace(/[:.]/g, '-')}.png`
          );
          
          // 스크린샷 촬영 (로그 출력 없이)
          const autoScreenshotResult = await this.mcpClient.executeAction('pageScreenshot', {
            page: this.pageId,
            fullPage: true
          });
          
          // 향상된 스크린샷 저장 함수 사용
          const saved = await saveScreenshot(autoScreenshotResult, autoScreenshotPath);
          if (saved) {
            stepResult.screenshot = autoScreenshotPath;
          } else {
            console.error('자동 스크린샷 저장 실패');
          }
        }

        // AI에게 결과 분석 요청
        stepResult.aiComment = await this.getAIComment(step, stepResult);
      } catch (error) {
        console.error(`단계 "${step.description}" 실행 오류:`, error);
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
        
        try {
          // 스크린샷 촬영
          const errorScreenshotResult = await this.mcpClient.executeAction('pageScreenshot', {
            page: this.pageId,
            fullPage: true
          });
          
          // 향상된 스크린샷 저장 함수 사용
          const saved = await saveScreenshot(errorScreenshotResult, errorScreenshotPath);
          if (saved) {
            stepResult.screenshot = errorScreenshotPath;
          } else {
            console.error('오류 스크린샷 저장 실패');
          }
        } catch (screenshotError) {
          console.error('에러 발생 후 스크린샷 촬영 실패:', screenshotError);
        }

        stepResult.aiComment = await this.getAIComment(step, stepResult);
      }

      stepResult.endTime = new Date().toISOString();
      stepResult.duration =
        new Date(stepResult.endTime).getTime() -
        new Date(stepResult.startTime).getTime();
      this.testReport.steps.push(stepResult);

      // 각 단계 사이에 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.testReport.endTime = new Date().toISOString();
    this.testReport.duration =
      new Date(this.testReport.endTime).getTime() -
      new Date(this.testReport.startTime).getTime();

    // 최종 테스트 결과에 대한 AI 코멘트
    console.log('\n테스트 실행 완료, AI 분석 결과 생성 중...');
    this.testReport.finalComment = await this.getFinalTestComment();

    // HTML 리포트 생성
    console.log('HTML 보고서 생성 중...');
    const htmlReportPath = await this.generatePlaywrightReport();
    this.testReport.htmlReportURL = htmlReportPath;

    // 테스트 리포트 저장
    const reportPath = path.join(
      this.testRunDir,
      `test-report.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(this.testReport, null, 2));

    console.log(`\n테스트 보고서 저장 완료: ${reportPath}`);

    // 콘솔에 요약 출력
    console.log('\n=== 테스트 요약 ===');
    console.log(`총 단계: ${this.testReport.totalSteps}`);
    console.log(`성공: ${this.testReport.passedSteps}`);
    console.log(`실패: ${this.testReport.failedSteps}`);
    console.log(`소요 시간: ${this.testReport.duration}ms`);
    console.log(`HTML 보고서: ${this.testReport.htmlReportURL}`);
    console.log('\nAI 최종 분석:');
    console.log(this.testReport.finalComment);
  }

  private async generatePlaywrightReport(): Promise<string> {
    const htmlReportDir = path.join(this.testRunDir, 'html-report');
    await fs.mkdir(htmlReportDir, { recursive: true });
    
    console.log(`HTML 리포트 생성 위치: ${htmlReportDir}`);
    
    try {
      // 테스트 실행 결과를 HTML 파일로 변환
      const stepsHtml = this.testReport.steps.map((step, index) => {
        const statusClass = step.status === 'success' ? 'success' : 'failure';
        const screenshotHtml = step.screenshot 
          ? `<div class="screenshot"><img src="${path.basename(step.screenshot)}" alt="Screenshot" width="800" /></div>` 
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
      
      // 스크린샷 파일을 HTML 리포트 디렉토리에 복사 (상대 경로 문제 해결)
      for (const step of this.testReport.steps) {
        if (step.screenshot) {
          const screenshotFileName = path.basename(step.screenshot);
          const destPath = path.join(htmlReportDir, screenshotFileName);
          
          try {
            await fs.copyFile(step.screenshot, destPath);
          } catch (error) {
            console.error(`스크린샷 파일 복사 실패: ${screenshotFileName}`, error);
          }
        }
      }
      
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
          console.log(`HTML 보고서가 기본 브라우저에서 열렸습니다: ${url}`);
        } catch (error) {
          console.error('HTML 보고서를 브라우저에서 열지 못했습니다:', error);
        }
      };
      
      // 선택적으로 브라우저에서 열기
      // await openReport();
      
      return htmlFilePath;
    } catch (error) {
      console.error('HTML 리포트 생성 실패:', error);
      return `HTML 리포트 생성 실패: ${error}`;
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
          },],
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
      try {
        if (this.pageId && this.browserContextId) {
          // 페이지 닫기
          await this.mcpClient.executeAction('pageClose', {
            page: this.pageId
          });
          
          // 브라우저 컨텍스트 닫기
          await this.mcpClient.executeAction('contextClose', {
            context: this.browserContextId
          });
        }
        
        // MCP 클라이언트 연결 해제
        await this.mcpClient.disconnect();
        
        console.log('브라우저 및 MCP 클라이언트 정리 완료');
      } catch (error) {
        console.error('정리 과정에서 오류 발생:', error);
      }
    }
  }