// src/cli/commands/ci.js
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { runNaturalLanguageTest } from '../../core/test/index.js';
import { loadConfig } from '../../utils/config.js';
import { setLanguage, tSync } from '../../utils/i18n.js';

/**
 * CI/CD 환경에서 테스트 실행 명령어 처리 함수
 * @param {Object} options 명령어 옵션
 */
export async function ciCommand(options) {
  try {
    // 환경 변수에서 설정 로드
    const testFile = options.file || process.env.LLM_TEST_FILE;
    const outputDir = options.output || process.env.LLM_TEST_OUTPUT || './test-results';
    const browserType = process.env.LLM_TEST_BROWSER || 'chromium';
    const headless = process.env.LLM_TEST_HEADLESS !== 'false';
    const language = process.env.LLM_TEST_LANGUAGE || 'ko';
    
    // 언어 설정
    setLanguage(language);
    
    if (!testFile) {
      console.error(chalk.red('테스트 파일을 지정해주세요 (-f 옵션 또는 LLM_TEST_FILE 환경 변수)'));
      process.exit(1);
    }
    
    // 테스트 설명 로드
    let testDescription;
    try {
      testDescription = await fs.readFile(path.resolve(testFile), 'utf8');
    } catch (error) {
      console.error(chalk.red(`파일을 읽을 수 없습니다: ${testFile}`), error);
      process.exit(1);
    }
    
    // 출력 디렉토리 생성
    await fs.ensureDir(outputDir);
    
    // 기본 설정 로드 & 환경 변수 오버라이드
    const config = await loadConfig();
    const runConfig = {
      ...config,
      browser: browserType,
      headless: headless,
      language: language
    };
    
    console.log(chalk.cyan('CI/CD 환경에서 테스트 실행 중...'));
    console.log(chalk.yellow(`- 테스트 파일: ${testFile}`));
    console.log(chalk.yellow(`- 브라우저: ${browserType} (headless: ${headless})`));
    console.log(chalk.yellow(`- 언어: ${language}`));
    console.log(chalk.yellow(`- 출력 디렉토리: ${outputDir}`));
    
    // 테스트 실행
    const report = await runNaturalLanguageTest(testDescription, {
      outputDir,
      browserType,
      headless,
      language,
      config: runConfig
    });
    
    // 결과에 따라 종료 코드 설정
    console.log(chalk.cyan(`테스트 완료: ${report.testResults.success ? chalk.green(tSync('test_success')) : chalk.red(tSync('test_failure'))}`));
    
    // 보고서 경로 출력
    console.log(chalk.cyan(`보고서 경로: ${path.join(report.testDir, 'report.md')}`));
    
    // JUnit 보고서 생성 (CI/CD 통합용)
    try {
      const junitContent = generateJUnitReport(report);
      const junitPath = path.join(report.testDir, 'junit-report.xml');
      await fs.writeFile(junitPath, junitContent, 'utf8');
      console.log(chalk.cyan(`JUnit 보고서 생성: ${junitPath}`));
    } catch (junitError) {
      console.warn(chalk.yellow('JUnit 보고서 생성 중 오류:'), junitError.message);
    }
    
    // CI/CD 환경에서 결과 코드 설정
    if (!report.testResults.success) {
      process.exit(1);
    }
    
    return report;
    
  } catch (error) {
    console.error(chalk.red('CI 테스트 실행 중 오류 발생:'), error);
    process.exit(1);
  }
}

/**
 * JUnit XML 보고서 생성
 * @param {Object} report 테스트 보고서
 * @returns {string} JUnit XML 문자열
 */
function generateJUnitReport(report) {
  const timestamp = new Date().toISOString();
  const testCase = report.testResults;
  const duration = testCase.duration / 1000; // 밀리초 -> 초
  
  // 기본 JUnit XML 구조
  let junitXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="LLM-Driven Tests" tests="1" failures="${testCase.success ? 0 : 1}" errors="0" time="${duration}">
  <testsuite name="LLM Test Suite" tests="1" failures="${testCase.success ? 0 : 1}" errors="0" time="${duration}" timestamp="${timestamp}">
    <testcase name="${escapeXml(report.naturalLanguageTest.substring(0, 60))}" classname="LLMTest" time="${duration}">`;
  
  // 실패한 경우 오류 정보 추가
  if (!testCase.success && testCase.errors.length > 0) {
    const errorMsg = testCase.errors[0].message;
    junitXml += `\n      <failure message="${escapeXml(errorMsg)}" type="AssertionError">
        ${escapeXml(testCase.errors[0].stack || errorMsg)}
      </failure>`;
  }
  
  // XML 닫기
  junitXml += `\n    </testcase>
  </testsuite>
</testsuites>`;
  
  return junitXml;
}

/**
 * XML 특수 문자 이스케이프
 * @param {string} str 입력 문자열
 * @returns {string} 이스케이프된 문자열
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}