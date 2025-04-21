#!/usr/bin/env node
// src/cli/index.js
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 명령어 모듈 불러오기
import { runCommand } from './commands/run.js';
import { setupCommand } from './commands/setup.js';
import { infoCommand } from './commands/info.js';
import { ciCommand } from './commands/ci.js';
import { pluginCommand } from './commands/plugin.js';

// ESM에서는 __dirname이 없으므로 대체 방법 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// package.json 로드
const packagePath = path.join(dirname(dirname(__dirname)), 'package.json');
const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
const { version } = packageJson;

// 타이틀 표시
console.log(chalk.cyan(figlet.textSync('LLM Test Tool', { horizontalLayout: 'full' })));

// 프로그램 정의
const program = new Command();
program
  .version(version)
  .description('자연어 기반 E2E 테스트 자동화 도구');

// 설정 명령
program
  .command('setup')
  .description('설정 마법사 실행')
  .action(setupCommand);

// 테스트 실행 명령
program
  .command('run')
  .description('자연어 테스트 시나리오 실행')
  .option('-t, --test <description>', '자연어로 작성된 테스트 시나리오')
  .option('-f, --file <filePath>', '자연어 테스트 시나리오 파일 경로')
  .option('-o, --output <outputDir>', '결과 출력 디렉토리')
  .option('-b, --browser <browserType>', '브라우저 타입 (chromium, firefox, webkit)')
  .option('-n, --no-headless', '헤드리스 모드 비활성화 (브라우저 표시)')
  .option('-l, --language <lang>', '사용할 언어 (ko, en, ja, zh)')
  .action(runCommand);

// CI/CD 명령
program
  .command('ci')
  .description('CI/CD 환경에서 테스트 실행 (환경 변수 기반)')
  .option('-f, --file <filePath>', '자연어 테스트 시나리오 파일 경로')
  .option('-o, --output <outputDir>', '결과 출력 디렉토리')
  .action(ciCommand);

// 도움말 명령
program
  .command('info')
  .description('지원되는 언어 및 브라우저 정보 표시')
  .action(infoCommand);

// 플러그인 생성 명령
program
  .command('generate-plugin')
  .description('CI/CD 플랫폼용 플러그인 생성')
  .option('-p, --platform <platform>', '플랫폼 (jenkins, github, gitlab, azure)')
  .option('-o, --output <outputDir>', '출력 디렉토리')
  .action(pluginCommand);

// 유효하지 않은 명령 처리
program.on('command:*', () => {
  console.error(chalk.red('유효하지 않은 명령: %s'), program.args.join(' '));
  console.log('도움말을 보려면: %s --help', program.name());
  process.exit(1);
});

// 인자가 없으면 도움말 표시
if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);