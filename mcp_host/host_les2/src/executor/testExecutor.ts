import { MCPClient } from '../mcp/mcpClient';
import { TestStep } from '../parser/scenarioParser';
import * as path from 'path';
import * as fs from 'fs/promises';

interface StepResult {
  step: TestStep;
  status: 'success' | 'failed';
  startTime: string;
  endTime: string;
  duration: number;
  result?: any;
  error?: string;
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
}

export class TestExecutor {
  private mcpClient: MCPClient;
  private outputDir: string;
  private testReport: TestReport;

  constructor() {
    this.mcpClient = new MCPClient();
    this.outputDir = path.join(process.cwd(), 'test-results');
    this.testReport = {
      testName: '',
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
    // 결과 디렉토리 생성
    await fs.mkdir(this.outputDir, { recursive: true });
    await this.mcpClient.connect();
  }

  async executeSteps(steps: TestStep[]) {
    console.log('Starting test execution...');
    console.log(`Results will be saved to: ${this.outputDir}`);

    this.testReport.testName = 'Natural Language Test';
    this.testReport.startTime = new Date().toISOString();
    this.testReport.totalSteps = steps.length;

    for (const step of steps) {
      console.log(`\nExecuting: ${step.description}`);

      const stepResult: StepResult = {
        step: step,
        status: 'success',
        startTime: new Date().toISOString(),
        endTime: '',
        duration: 0,
      };

      try {
        let actionResult: any;

        switch (step.action) {
          case 'navigate':
            actionResult = await this.mcpClient.executeAction(
              'browser_navigate',
              {
                url: step.value || step.target,
              }
            );
            break;

          case 'click':
            // 먼저 페이지 스냅샷을 가져옴
            const clickSnapshot = await this.mcpClient.executeAction(
              'browser_snapshot',
              {}
            );
            stepResult.result = { snapshot: clickSnapshot };

            actionResult = await this.mcpClient.executeAction('browser_click', {
              element: step.description,
              ref: step.target,
            });
            break;

          case 'fill':
            // 먼저 페이지 스냅샷을 가져옴
            const fillSnapshot = await this.mcpClient.executeAction(
              'browser_snapshot',
              {}
            );
            stepResult.result = { snapshot: fillSnapshot };

            actionResult = await this.mcpClient.executeAction('browser_type', {
              element: step.description,
              ref: step.target,
              text: step.value,
              submit: true, // 검색 실행
            });
            break;

          case 'screenshot':
            const screenshotResult = await this.mcpClient.executeAction(
              'browser_take_screenshot',
              {}
            );
            actionResult = screenshotResult;

            // 스크린샷 데이터를 파일로 저장 시도
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(
              this.outputDir,
              `${timestamp}-screenshot.png`
            );

            if (screenshotResult && screenshotResult.content) {
              try {
                if (typeof screenshotResult.content === 'string') {
                  const buffer = Buffer.from(
                    screenshotResult.content,
                    'base64'
                  );
                  await fs.writeFile(screenshotPath, buffer);
                  stepResult.result = { screenshotPath };
                }
              } catch (err) {
                console.error('Failed to save screenshot:', err);
              }
            }
            break;

          default:
            console.warn(`Unknown action: ${step.action}`);
        }

        stepResult.result = { ...stepResult.result, actionResult };
        stepResult.status = 'success';
        this.testReport.passedSteps++;

        // 각 단계 사이에 약간의 대기 시간 추가
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error executing step "${step.description}":`, error);
        stepResult.status = 'failed';
        stepResult.error =
          error instanceof Error ? error.message : String(error);
        this.testReport.failedSteps++;
      }

      stepResult.endTime = new Date().toISOString();
      stepResult.duration =
        new Date(stepResult.endTime).getTime() -
        new Date(stepResult.startTime).getTime();
      this.testReport.steps.push(stepResult);
    }

    this.testReport.endTime = new Date().toISOString();
    this.testReport.duration =
      new Date(this.testReport.endTime).getTime() -
      new Date(this.testReport.startTime).getTime();

    // 테스트 리포트를 JSON 파일로 저장
    const reportPath = path.join(
      this.outputDir,
      `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(this.testReport, null, 2));
    console.log(`\nTest report saved to: ${reportPath}`);

    // 콘솔에도 요약 출력
    console.log('\n=== Test Summary ===');
    console.log(`Total steps: ${this.testReport.totalSteps}`);
    console.log(`Passed: ${this.testReport.passedSteps}`);
    console.log(`Failed: ${this.testReport.failedSteps}`);
    console.log(`Duration: ${this.testReport.duration}ms`);
  }

  async cleanup() {
    await this.mcpClient.disconnect();
  }
}
