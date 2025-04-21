// src/cli/commands/setup.js
import chalk from 'chalk';
import { runSetupWizard } from '../../utils/config.js';

/**
 * 설정 마법사 명령 처리 함수
 */
export async function setupCommand() {
  try {
    await runSetupWizard();
  } catch (error) {
    console.error(chalk.red('설정 중 오류 발생:'), error);
    process.exit(1);
  }
}