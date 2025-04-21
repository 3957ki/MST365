// src/cli/commands/run.js
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { runNaturalLanguageTest } from '../../core/test/index.js';
import { loadConfig } from '../../utils/config.js';
import { setLanguage, tSync } from '../../utils/i18n.js';

/**
 * 테스트 실행 명령어 처리 함수
 * @param {Object} options 명령어 옵션
 */
export async function runCommand(options) {
  try {
    // 설정 로드
    const config = await loadConfig();
    
    // 언어 설정
    const lang = options.language || config.language || 'ko';
    setLanguage(lang);
    
    // 테스트 설명 로드
    let testDescription;
    
    if (options.file) {
      try {
        testDescription = await fs.readFile(path.resolve(options.file), 'utf8');
      } catch (error) {
        console.error(chalk.red(`파일을 읽을 수 없습니다: ${options.file}`), error);
        process.exit(1);
      }
    } else if (options.test) {
      testDescription = options.test;
    } else {
      console.error(chalk.red('테스트 시나리오를 입력해주세요 (-t 또는 -f 옵션 사용)'));
      process.exit(1);
    }
    
    // 출력 디렉토리 설정
    const outputDir = options.output 
      ? path.resolve(options.output) 
      : config.outputDir || './test-results';
    
    await fs.ensureDir(outputDir);
    
    console.log(chalk.cyan(tSync('test_running')));
    console.log(chalk.yellow('---'));
    console.log(testDescription);
    console.log(chalk.yellow('---'));
    
    // 테스트 실행
    const report = await runNaturalLanguageTest(testDescription, {
      outputDir,
      browserType: options.browser || config.browser,
      headless: options.headless !== false,
      config
    });
    
    // 결과 출력
    console.log(chalk.green('\n=== 테스트 결과 ===\n'));
    console.log(chalk.cyan(`성공 여부: ${report.testResults.success 
      ? chalk.green(tSync('test_success') + ' ✓') 
      : chalk.red(tSync('test_failure') + ' ✗')}`));
    console.log(chalk.cyan(`${tSync('test_duration')}: ${report.testResults.duration / 1000} 초`));
    
    if (report.testResults.errors.length > 0) {
      console.log(chalk.red('\n=== 오류 ===\n'));
      report.testResults.errors.forEach((error, i) => {
        console.log(chalk.yellow(`${i+1}. ${error.message}`));
      });
    }
    
    console.log(chalk.green('\n=== 분석 결과 ===\n'));
    console.log(report.analysis);
    
    if (report.testResults.screenshots.length > 0) {
      const screenshotDir = path.join(report.testDir, 'screenshots');
      console.log(chalk.cyan(`\n${tSync('screenshots_saved')}: ${screenshotDir}`));
    }
    
    console.log(chalk.cyan(`\n전체 보고서: ${path.join(report.testDir, 'report.md')}`));
    
    // 결과 반환
    return report;
    
  } catch (error) {
    console.error(chalk.red('오류 발생:'), error);
    process.exit(1);
  }
}