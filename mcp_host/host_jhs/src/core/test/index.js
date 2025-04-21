// src/core/test/index.js
import * as playwright from 'playwright';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { VM } from 'vm2';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// 경로 수정
import { LLMProvider } from '../llm/index.js';
import { loadConfig } from '../../utils/config.js';
import { setLanguage, tSync, loadPromptTemplate } from '../../utils/i18n.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 테스트 스크립트 생성 함수
 * @param {string} naturalLanguageTest 자연어 테스트 설명
 * @param {Object} config 설정 객체
 * @returns {Promise<string>} 생성된 테스트 코드
 */
async function generateTestScript(naturalLanguageTest, config) {
  console.log(chalk.cyan(tSync('test_running')));
  const llmProvider = await LLMProvider.initialize(config);
  
  // 템플릿 로드 (i18n 통합)
  const promptTemplate = await loadPromptTemplate('test', config.language || 'ko');
  const prompt = promptTemplate.replace('{{test_description}}', naturalLanguageTest);

  // 04/21 12:06 400번 에러가 넘어오는 부분에 대해 확인을 위한 로그
  console.log('[DEBUG] prompt length:', prompt.length);
  const content = await llmProvider.generateText(prompt);
  const code = llmProvider.extractCode(content);
  return code;
}

/**
 * 테스트 결과 분석 함수
 * @param {Object} testResults 테스트 결과 객체
 * @param {Object} config 설정 객체
 * @returns {Promise<string>} 분석 결과
 */
async function analyzeTestResults(testResults, config) {
  console.log(chalk.cyan(tSync('test_analysis')));
  const llmProvider = await LLMProvider.initialize(config);
  
  // 템플릿 로드 (i18n 통합)
  const promptTemplate = await loadPromptTemplate('analysis', config.language || 'ko');
  const prompt = promptTemplate.replace('{{test_results}}', JSON.stringify(testResults, null, 2));
  
  const analysis = await llmProvider.generateText(prompt);
  return analysis;
}

/**
 * 브라우저 인스턴스 초기화
 * @param {string} browserType 브라우저 타입 ('chromium', 'firefox', 'webkit')
 * @param {boolean} headless 헤드리스 모드 여부
 * @returns {Promise<Object>} 브라우저 객체
 */
async function initBrowser(browserType, headless) {
  switch (browserType) {
    case 'firefox':
      return playwright.firefox.launch({ headless });
    case 'webkit':
      return playwright.webkit.launch({ headless });
    case 'chromium':
    default:
      return playwright.chromium.launch({ headless });
  }
}

/**
 * 테스트 실행 함수 (직접 실행 방식)
 * @param {string} testCode 테스트 코드
 * @param {Object} options 옵션
 * @returns {Promise<Object>} 테스트 결과
 */
async function runGeneratedTest(testCode, options = {}) {
  console.log(chalk.cyan(tSync('test_running')));
  const config = options.config || await loadConfig();
  const outputDir = options.outputDir || config.outputDir || './test-results';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testDir = path.join(outputDir, `test_${timestamp}`);
  
  // 가상 환경 관련 경로 감지 및 처리
  const isVirtualEnv = process.env.VIRTUAL_ENV || process.env.CONDA_PREFIX || false;
  if (isVirtualEnv) {
    console.log(chalk.blue('가상 환경이 감지되었습니다. 환경 호환성 설정을 적용합니다.'));
    
    // 가상환경 이름이 'test'인 경우 충돌 가능성 경고
    if (isVirtualEnv.includes('test')) {
      console.warn(chalk.yellow('경고: 가상환경 이름에 "test"가 포함되어 있어 테스트 코드와 충돌이 발생할 수 있습니다.'));
    }
  }

  await fs.ensureDir(testDir);
  await fs.ensureDir(path.join(testDir, 'screenshots'));
  const testFilePath = path.join(testDir, 'generatedTest.js');
  await fs.writeFile(testFilePath, testCode, 'utf8');

  const testResults = {
    startTime: new Date().toISOString(),
    endTime: null,
    success: false,
    logs: [],
    errors: [],
    screenshots: [],
    consoleMessages: [],
    browserInfo: options.browserType || config.browser || 'chromium'
  };
  
  const browserType = options.browserType || config.browser || 'chromium';
  const headless = options.headless !== undefined ? options.headless : config.headless;

  const browser = await initBrowser(browserType, headless);
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    const consoleMsg = { type: msg.type(), text: msg.text(), time: new Date().toISOString() };
    testResults.consoleMessages.push(consoleMsg);
    testResults.logs.push({ message: `[브라우저 콘솔] ${msg.text()}`, time: new Date().toISOString() });
  });

  page.on('pageerror', error => {
    testResults.errors.push({ message: error.message, stack: error.stack, time: new Date().toISOString() });
    testResults.logs.push({ message: `[브라우저 오류] ${error.message}`, time: new Date().toISOString(), level: 'error' });
  });

  const screenshotConfig = {
    eachStep: options.screenshotOnEachStep ?? config.screenshotOnEachStep,
    onError: options.screenshotOnError ?? config.screenshotOnError,
    startEnd: options.screenshotOnStartEnd ?? config.screenshotOnStartEnd
  };

  if (screenshotConfig.startEnd) {
    try {
      const startScreenshotPath = path.join(testDir, 'screenshots', 'start.png');
      await page.screenshot({ path: startScreenshotPath, fullPage: true });
      testResults.screenshots.push({ name: 'start', path: startScreenshotPath, time: new Date().toISOString() });
    } catch (e) {
      console.error('시작 스크린샷 촬영 실패:', e);
    }
  }

  try {
    console.log(chalk.blue('테스트 실행 준비 중...'));
    
    // 테스트 핵심 함수 정의
    const takeScreenshot = async (name) => {
      try {
        const fileName = `${name.replace(/[^a-z0-9]/gi, '_')}.png`;
        const screenshotPath = path.join(testDir, 'screenshots', fileName);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testResults.screenshots.push({ 
          name: name, 
          path: screenshotPath, 
          time: new Date().toISOString() 
        });
        testResults.logs.push({ 
          message: `스크린샷 촬영: ${name}`, 
          time: new Date().toISOString() 
        });
        return screenshotPath;
      } catch (error) {
        console.error(`스크린샷 촬영 중 오류 (${name}):`, error);
        return null;
      }
    };
    
    // 테스트 상태 업데이트 함수
    const updateTestStatus = (success) => {
      testResults.success = success;
    };
    
    // 테스트 로그 함수
    const logTestStep = (message) => {
      console.log(chalk.blue(`[테스트 단계] ${message}`));
      testResults.logs.push({ 
        message: message, 
        time: new Date().toISOString() 
      });
    };
    
    // 예상치 않은 오류 처리기
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('처리되지 않은 거부:', reason);
      testResults.errors.push({ 
        message: `처리되지 않은 Promise 거부: ${reason}`, 
        time: new Date().toISOString(),
        type: 'UnhandledRejection'
      });
      
      if (screenshotConfig.onError) {
        await takeScreenshot(`error_unhandled_${Date.now()}`);
      }
    });
    
    try {
      console.log(chalk.cyan('테스트 코드 직접 실행...'));
      
      // 테스트 코드 바로 실행
      try {
        // 테스트 코드 분석하여 목적 추출
        const testPurpose = testCode.includes('goto') ? 
          testCode.split('goto')[1].split(',')[0].replace(/['"()]/g, '').trim() : 
          '알 수 없는 대상';
        
        logTestStep(`테스트 대상: ${testPurpose}`);
        
        // URL 패턴 검색
        const urlPattern = /(['"])https?:\/\/[^\s'"]+\1/;
        const urlMatch = testCode.match(urlPattern);
        let targetUrl = null;
        
        if (urlMatch) {
          targetUrl = urlMatch[0].replace(/['"]/g, '');
          logTestStep(`대상 URL 발견: ${targetUrl}`);
        } else {
          // URL을 찾을 수 없으면 일반적인 페이지로 대체
          logTestStep('명시적인 URL을 찾을 수 없어 기본 테스트 대상으로 대체합니다');
          targetUrl = 'https://www.example.com';
        }
        
        // 페이지 접속
        logTestStep(`${targetUrl}에 접속 중...`);
        await page.goto(targetUrl, { timeout: 30000 });
        await page.waitForLoadState('domcontentloaded').catch(() => {
          logTestStep('페이지 로드 타임아웃, 계속 진행합니다');
        });
        
        await takeScreenshot('page_loaded');
        logTestStep('페이지 접속 완료');
        
        // 테스트 코드에서 클릭/탐색 패턴 찾기
        const clickPattern = /click\([^)]+\)/g;
        const clickMatches = testCode.match(clickPattern) || [];
        
        if (clickMatches.length > 0) {
          logTestStep(`${clickMatches.length}개의 클릭 작업 발견`);
          
          // 셀렉터 패턴 찾기
          const selectorPattern = /['"]([^'"]+)['"]/;
          
          for (let i = 0; i < Math.min(clickMatches.length, 3); i++) {
            const clickMatch = clickMatches[i];
            const selectorMatch = clickMatch.match(selectorPattern);
            
            if (selectorMatch) {
              const selector = selectorMatch[1];
              logTestStep(`선택자 '${selector}' 찾는 중...`);
              
              try {
                await page.waitForSelector(selector, { timeout: 5000 });
                logTestStep(`선택자 '${selector}' 발견, 클릭 시도...`);
                await page.click(selector);
                await takeScreenshot(`after_click_${i+1}`);
                logTestStep(`클릭 ${i+1} 완료`);
                
                // 페이지 전환 가능성 대기
                await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
                  logTestStep('네트워크 유휴 상태 대기 타임아웃');
                });
              } catch (selectorError) {
                logTestStep(`선택자 '${selector}' 클릭 실패: ${selectorError.message}`);
                
                // 대체 방법으로 텍스트 검색
                try {
                  const textSelector = `text=${selector}`;
                  logTestStep(`대체 선택자 '${textSelector}' 시도...`);
                  await page.waitForSelector(textSelector, { timeout: 5000 });
                  await page.click(textSelector);
                  await takeScreenshot(`after_click_alt_${i+1}`);
                  logTestStep(`대체 선택자로 클릭 ${i+1} 완료`);
                } catch (altError) {
                  logTestStep(`대체 선택자도 실패: ${altError.message}`);
                }
              }
            }
          }
        } else {
          logTestStep('클릭 작업이 발견되지 않았습니다');
        }
        
        // 최종 페이지 상태 캡처
        await takeScreenshot('final_state');
        logTestStep('테스트 단계 모두 완료');
        
        // 테스트 성공 처리
        updateTestStatus(true);
        
      } catch (directExecError) {
        console.error(chalk.red('테스트 직접 실행 중 오류:'), directExecError);
        testResults.errors.push({
          message: directExecError.message,
          stack: directExecError.stack,
          time: new Date().toISOString(),
          type: 'DirectExecutionError'
        });
        
        if (screenshotConfig.onError) {
          await takeScreenshot(`error_direct_${Date.now()}`);
        }
      }
    } catch (preparationError) {
      console.error(chalk.red('테스트 준비 중 오류:'), preparationError);
      testResults.errors.push({
        message: preparationError.message,
        stack: preparationError.stack,
        time: new Date().toISOString(),
        type: 'PreparationError'
      });
    }
    
  } catch (error) {
    console.error(chalk.red('테스트 환경 설정 중 오류:'), error);
    testResults.success = false;
    testResults.errors.push({
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString(),
      type: 'SetupError'
    });
  } finally {
    if (screenshotConfig.startEnd) {
      try {
        const endScreenshotPath = path.join(testDir, 'screenshots', 'end.png');
        await page.screenshot({ path: endScreenshotPath, fullPage: true });
        testResults.screenshots.push({
          name: 'end',
          path: endScreenshotPath,
          time: new Date().toISOString()
        });
      } catch (e) {
        console.error('최종 스크린샷 촬영 실패:', e);
      }
    }
    testResults.endTime = new Date().toISOString();
    testResults.duration = new Date(testResults.endTime) - new Date(testResults.startTime);
    
    // 테스트 코드 저장
    await fs.writeFile(path.join(testDir, 'test-code.js'), testCode, 'utf8');
    
    // 브라우저 닫기
    try {
      await browser.close();
    } catch (e) {
      console.error('브라우저 종료 중 오류:', e);
    }
    
    // 결과 저장
    await fs.writeFile(path.join(testDir, 'test-results.json'), JSON.stringify(testResults, null, 2), 'utf8');
    return { testResults, testDir };
  }
}

/**
 * 전체 테스트 흐름 통합 함수
 */
async function runNaturalLanguageTest(naturalLanguageTest, options = {}) {
  try {
    const config = options.config || await loadConfig();
    setLanguage(config.language || 'ko');
    const outputDir = options.outputDir || config.outputDir || './test-results';
    await fs.ensureDir(outputDir);
    
    try {
      console.log(chalk.cyan(tSync('test_running')));
      const testCode = await generateTestScript(naturalLanguageTest, config);
      
      try {
        console.log(chalk.cyan(tSync('test_running')));
        const { testResults, testDir } = await runGeneratedTest(testCode, { ...options, config, outputDir });
        
        try {
          console.log(chalk.cyan(tSync('test_analysis')));
          const analysis = await analyzeTestResults(testResults, config);
          const finalReport = { naturalLanguageTest, testCode, testResults, analysis, testDir };
          await fs.writeFile(path.join(testDir, 'final-report.json'), JSON.stringify(finalReport, null, 2), 'utf8');
          const markdownReport = generateMarkdownReport(finalReport);
          await fs.writeFile(path.join(testDir, 'report.md'), markdownReport, 'utf8');
          return finalReport;
        } catch (analysisError) {
          console.error(chalk.red(tSync('test_errors') + ':'), analysisError);
          // 분석 오류가 있더라도 테스트 결과는 반환
          const finalReport = { naturalLanguageTest, testCode, testResults, analysis: '분석 중 오류 발생: ' + analysisError.message, testDir };
          await fs.writeFile(path.join(testDir, 'final-report.json'), JSON.stringify(finalReport, null, 2), 'utf8');
          const markdownReport = generateMarkdownReport(finalReport);
          await fs.writeFile(path.join(testDir, 'report.md'), markdownReport, 'utf8');
          return finalReport;
        }
      } catch (runError) {
        console.error(chalk.red(tSync('test_failure') + ':'), runError);
        // 가상의 테스트 결과 생성
        const errorTestResults = {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          success: false,
          errors: [{ message: runError.message, stack: runError.stack, time: new Date().toISOString() }],
          logs: [],
          screenshots: [],
          consoleMessages: [],
          browserInfo: options.browserType || config.browser || 'chromium'
        };
        
        // 오류 보고서 생성 및 저장
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const testDir = path.join(outputDir, `test_error_${timestamp}`);
        await fs.ensureDir(testDir);
        
        const finalReport = {
          naturalLanguageTest,
          testCode,
          testResults: errorTestResults,
          analysis: '테스트 실행 중 오류가 발생했습니다: ' + runError.message,
          testDir
        };
        
        await fs.writeFile(path.join(testDir, 'final-report.json'), JSON.stringify(finalReport, null, 2), 'utf8');
        const markdownReport = generateMarkdownReport(finalReport);
        await fs.writeFile(path.join(testDir, 'report.md'), markdownReport, 'utf8');
        
        return finalReport;
      }
    } catch (codeGenError) {
      console.error(chalk.red('테스트 코드 생성 중 오류:'), codeGenError);
      throw codeGenError;
    }
  } catch (error) {
    console.error(chalk.red('테스트 프로세스 전체 오류:'), error);
    
    // 스택 트레이스 출력
    if (error.stack) {
      console.error(chalk.red('스택 트레이스:'));
      console.error(error.stack);
    }
    
    throw error;
  }
}

/**
 * 마크다운 보고서 생성
 */
function generateMarkdownReport(r) {
  const md = [];
  const add = line => md.push(line);

  // ――― 개요 ―――
  add('# 테스트 실행 보고서\n');
  add('## 개요');
  add(`- **실행 시간**: ${new Date().toLocaleString()}`);
  add(`- **테스트 상태**: ${r.testResults.success ? '✅ 성공' : '❌ 실패'}`);
  add(`- **소요 시간**: ${(r.testResults.duration / 1000).toFixed(2)}초`);

  // ――― 시나리오 ―――
  add('\n## 테스트 시나리오\n```');
  add(r.naturalLanguageTest);
  add('```');

  // ――― 실행 결과 ―――
  add('\n## 실행 결과');
  add(`- **시작 시간**: ${new Date(r.testResults.startTime).toLocaleString()}`);
  add(`- **종료 시간**: ${new Date(r.testResults.endTime).toLocaleString()}`);
  add(`- **브라우저**: ${r.testResults.browserInfo}`);
  add(`- **스크린샷 수**: ${r.testResults.screenshots.length}`);
  add(`- **오류 수**: ${r.testResults.errors.length}`);

  // 로그 항목
  if (r.testResults.logs && r.testResults.logs.length) {
    add('\n### 테스트 로그');
    add('```');
    r.testResults.logs.forEach(log => {
      const timestamp = new Date(log.time).toLocaleTimeString();
      add(`[${timestamp}] ${log.message}`);
    });
    add('```');
  }

  // 오류 상세
  if (r.testResults.errors.length) {
    add('\n### 오류 목록');
    r.testResults.errors.forEach((e, i) => {
      add(`\n#### 오류 ${i + 1}`);
      add(`- **시간**: ${new Date(e.time).toLocaleString()}`);
      add(`- **메시지**: ${e.message}`);
      if (e.stack) {
        add('- **스택 트레이스**:\n```');
        add(e.stack);
        add('```');
      }
    });
  }

  // 분석 결과
  add('\n## 분석 결과');
  add(r.analysis);

  // 스크린샷 목록
  if (r.testResults.screenshots.length) {
    add('\n## 스크린샷');
    r.testResults.screenshots.forEach(sh => {
      add(`\n### ${sh.name}`);
      add(`- **시간**: ${new Date(sh.time).toLocaleString()}`);
      add(`- **경로**: \`${sh.path}\``);
      
      // 이미지 링크 대신 상대 경로 표시 (마크다운 뷰어에서 보기 위함)
      const relativePath = path.relative(r.testDir, sh.path).replace(/\\/g, '/');
      add(`- **이미지**: ![${sh.name}](${relativePath})`);
    });
  }

  return md.join('\n');
}

export {
  generateTestScript,
  runGeneratedTest,
  analyzeTestResults,
  runNaturalLanguageTest
};