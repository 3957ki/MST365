import chalk from 'chalk';
import { loadConfig } from '../../utils/config.js';
import { setLanguage, tSync, getSupportedLanguages } from '../../utils/i18n.js';

/**
 * 정보 표시 명령어 처리 함수
 */
export async function infoCommand() {
  try {
    const config = await loadConfig();
    setLanguage(config.language || 'ko');
    
    console.log(chalk.green('\n=== 지원되는 언어 ===\n'));
    const languages = getSupportedLanguages();
    languages.forEach(lang => {
      console.log(chalk.cyan(`- ${lang.name} (${lang.code})`));
    });
    
    console.log(chalk.green('\n=== 지원되는 브라우저 ===\n'));
    console.log(chalk.cyan('- Chromium'));
    console.log(chalk.cyan('- Firefox'));
    console.log(chalk.cyan('- WebKit'));
    
    console.log(chalk.green('\n=== 지원되는 AI 모델 ===\n'));
    console.log(chalk.cyan('Anthropic (Claude):'));
    console.log(chalk.yellow('  - claude-3-7-sonnet-20250219'));
    console.log(chalk.yellow('  - claude-3-5-sonnet'));
    console.log(chalk.yellow('  - claude-3-opus'));
    
    console.log(chalk.cyan('\nOpenAI (ChatGPT):'));
    console.log(chalk.yellow('  - gpt-4-turbo'));
    console.log(chalk.yellow('  - gpt-4o'));
    console.log(chalk.yellow('  - gpt-3.5-turbo'));
    
    console.log(chalk.green('\n=== 지원되는 CI/CD 플랫폼 ===\n'));
    console.log(chalk.cyan('- Jenkins'));
    console.log(chalk.cyan('- GitHub Actions'));
    console.log(chalk.cyan('- GitLab CI'));
    console.log(chalk.cyan('- Azure DevOps'));
    
  } catch (error) {
    console.error(chalk.red('정보를 표시하는 중 오류 발생:'), error);
    process.exit(1);
  }
}