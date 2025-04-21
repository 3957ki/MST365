// src/utils/config.js
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import CryptoJS from 'crypto-js';
import chalk from 'chalk';
import figlet from 'figlet';
import keytar from 'keytar';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { setLanguage, tSync, getSupportedLanguages } from './i18n.js';

// ESM에서는 __dirname이 없으므로 대체 방법 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 서비스 이름 (키체인/자격 증명 저장에 사용)
const SERVICE_NAME = 'llm-driven-test';

// 설정 파일 경로
const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.llm-driven-test');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const ENCRYPTED_KEYS_FILE = path.join(CONFIG_DIR, 'keys.enc');

// 프로젝트 루트 경로
const PROJECT_ROOT = path.resolve(dirname(dirname(__dirname)));
const DEFAULT_CONFIG_PATH = path.join(PROJECT_ROOT, 'config', 'default.json');

/**
 * 마법사 설정 실행 함수
 */
export async function runSetupWizard() {
  // 타이틀 표시
  console.log(chalk.cyan(figlet.textSync('LLM Test Tool', { horizontalLayout: 'full' })));
  console.log(chalk.yellow('설정 마법사에 오신 것을 환영합니다!\n'));
  
  // 기존 설정 로드 (있을 경우)
  let currentConfig = {};
  try {
    if (await fs.pathExists(CONFIG_FILE)) {
      currentConfig = await fs.readJson(CONFIG_FILE);
      console.log(chalk.green('기존 설정을 불러왔습니다.'));
    } else if (await fs.pathExists(DEFAULT_CONFIG_PATH)) {
      currentConfig = await fs.readJson(DEFAULT_CONFIG_PATH);
      console.log(chalk.green('기본 설정을 불러왔습니다.'));
    }
  } catch (error) {
    console.log(chalk.yellow('기존 설정을 불러올 수 없습니다. 새 설정을 생성합니다.'));
  }
  
  // 언어 선택
  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: '사용할 언어를 선택하세요:',
      choices: [
        { name: '한국어', value: 'ko' },
        { name: '영어', value: 'en' },
        { name: '일본어', value: 'ja' },
        { name: '중국어', value: 'zh' }
      ],
      default: currentConfig.language || 'ko'
    }
  ]);
  
  // 선택된 언어 설정
  setLanguage(language);
  
  // LLM 모델 선택
  const { llmProvider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'llmProvider',
      // tSync()를 사용하여 동기식으로 번역된 문자열 사용
      message: tSync('select_llm_provider'),
      choices: [
        { name: 'Anthropic (Claude)', value: 'anthropic' },
        { name: 'OpenAI (ChatGPT)', value: 'openai' }
      ],
      default: currentConfig.llmProvider || 'anthropic'
    }
  ]);
  
  // 선택된 LLM에 따른 모델 옵션
  let modelChoices = [];
  if (llmProvider === 'anthropic') {
    modelChoices = [
      { name: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
      { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
      { name: 'Claude 3 Opus', value: 'claude-3-opus' }
    ];
  } else if (llmProvider === 'openai') {
    modelChoices = [
      { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
      { name: 'GPT-4o', value: 'gpt-4o' },
      { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
    ];
  }
  
  // 모델 선택
  const { llmModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'llmModel',
      message: tSync('select_llm_model'),
      choices: modelChoices,
      default: currentConfig.llmModel || modelChoices[0].value
    }
  ]);
  
  // API 키 입력 및 보안 저장
  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: tSync('enter_api_key', { provider: llmProvider === 'anthropic' ? 'Anthropic' : 'OpenAI' }),
      mask: '*'
    }
  ]);
  
  // 테스트 결과 저장 경로
  const { outputDir } = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputDir',
      message: tSync('enter_output_dir'),
      default: currentConfig.outputDir || './test-results'
    }
  ]);
  
  // 스크린샷 설정
  const { screenshotSettings } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'screenshotSettings',
      message: tSync('select_screenshot_settings'),
      choices: [
        { name: tSync('screenshot_each_step'), value: 'eachStep', checked: currentConfig.screenshotOnEachStep },
        { name: tSync('screenshot_on_error'), value: 'onError', checked: currentConfig.screenshotOnError },
        { name: tSync('screenshot_start_end'), value: 'startEnd', checked: currentConfig.screenshotOnStartEnd }
      ]
    }
  ]);
  
  // 브라우저 설정
  const { browser } = await inquirer.prompt([
    {
      type: 'list',
      name: 'browser',
      message: tSync('select_browser'),
      choices: [
        { name: 'Chromium', value: 'chromium' },
        { name: 'Firefox', value: 'firefox' },
        { name: 'WebKit', value: 'webkit' }
      ],
      default: currentConfig.browser || 'chromium'
    }
  ]);
  
  const { headless } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'headless',
      message: tSync('headless_mode'),
      default: currentConfig.headless !== false
    }
  ]);
  
  // CI/CD 환경 설정
  const { cicdPlatforms } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'cicdPlatforms',
      message: tSync('select_cicd_platforms'),
      choices: [
        { name: 'Jenkins', value: 'jenkins' },
        { name: 'GitHub Actions', value: 'github' },
        { name: 'GitLab CI', value: 'gitlab' },
        { name: 'Azure DevOps', value: 'azure' }
      ],
      default: currentConfig.cicdPlatforms || ['jenkins', 'github']
    }
  ]);
  
  // MCP 설정
  const { useMcp } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useMcp',
      message: tSync('use_mcp'),
      default: currentConfig.useMcp !== false
    }
  ]);
  
  // 설정 저장
  const config = {
    language,
    llmProvider,
    llmModel,
    outputDir,
    screenshotOnEachStep: screenshotSettings.includes('eachStep'),
    screenshotOnError: screenshotSettings.includes('onError'),
    screenshotOnStartEnd: screenshotSettings.includes('startEnd'),
    browser,
    headless,
    cicdPlatforms,
    useMcp,
    configVersion: '1.1'
  };
  
  // 디렉토리 생성
  await fs.ensureDir(CONFIG_DIR);
  
  // 설정 파일 저장
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
  
  // API 키를 시스템 키체인에 저장
  try {
    // 시스템 키체인/자격 증명 관리자에 저장 시도
    await keytar.setPassword(SERVICE_NAME, llmProvider, apiKey);
    console.log(chalk.green(tSync('api_key_saved_keychain')));
  } catch (error) {
    // 키체인 저장 실패 시 파일에 암호화하여 저장
    console.log(chalk.yellow(tSync('api_key_keychain_failed')));
    
    // 랜덤 암호화 키 생성 (첫 설정 시)
    let encryptionKey;
    const encKeyPath = path.join(CONFIG_DIR, '.enc_key');
    
    if (await fs.pathExists(encKeyPath)) {
      encryptionKey = (await fs.readFile(encKeyPath, 'utf8')).trim();
    } else {
      encryptionKey = CryptoJS.lib.WordArray.random(16).toString();
      await fs.writeFile(encKeyPath, encryptionKey);
      // 보안을 위해 파일 권한 설정 (Unix 계열 시스템에서만 작동)
      try {
        await fs.chmod(encKeyPath, 0o600);
      } catch (e) {
        // Windows 등에서는 무시
      }
    }
    
    // API 키 암호화
    const encryptedKeys = {};
    encryptedKeys[llmProvider] = CryptoJS.AES.encrypt(apiKey, encryptionKey).toString();
    
    // 암호화된 키 저장
    await fs.writeJson(ENCRYPTED_KEYS_FILE, encryptedKeys);
    
    // 보안을 위해 파일 권한 설정 (Unix 계열 시스템에서만 작동)
    try {
      await fs.chmod(ENCRYPTED_KEYS_FILE, 0o600);
    } catch (e) {
      // Windows 등에서는 무시
    }
  }
  
  console.log(chalk.green('\n' + tSync('setup_completed')));
  console.log(chalk.cyan('\n' + tSync('run_test_command')));
  console.log(chalk.yellow('  node src/cli/index.js run --test "테스트 시나리오 설명"'));
  
  return config;
}

/**
 * 저장된 설정 불러오기
 */
export async function loadConfig() {
  try {
    // 사용자 설정 파일 확인
    if (await fs.pathExists(CONFIG_FILE)) {
      return await fs.readJson(CONFIG_FILE);
    }
    
    // 기본 설정 파일 확인
    if (await fs.pathExists(DEFAULT_CONFIG_PATH)) {
      console.log(chalk.yellow('사용자 설정 파일이 없습니다. 기본 설정을 사용합니다.'));
      return await fs.readJson(DEFAULT_CONFIG_PATH);
    }
  } catch (error) {
    console.error('설정 파일을 불러오는 중 오류 발생:', error);
  }
  
  console.log(chalk.yellow('설정 파일이 없습니다. 설정 마법사를 실행합니다.'));
  return runSetupWizard();
}

/**
 * API 키 가져오기 (보안 저장소에서)
 */
export async function getApiKey(provider) {
  try {
    // 시스템 키체인에서 먼저 시도
    const key = await keytar.getPassword(SERVICE_NAME, provider);
    if (key) return key;
    
    // 실패 시 암호화 파일에서 시도
    if (await fs.pathExists(ENCRYPTED_KEYS_FILE)) {
      const encryptedKeys = await fs.readJson(ENCRYPTED_KEYS_FILE);
      const encKeyPath = path.join(CONFIG_DIR, '.enc_key');
      
      if (encryptedKeys[provider] && await fs.pathExists(encKeyPath)) {
        const encryptionKey = (await fs.readFile(encKeyPath, 'utf8')).trim();
        const decrypted = CryptoJS.AES.decrypt(encryptedKeys[provider], encryptionKey).toString(CryptoJS.enc.Utf8);
        
        if (decrypted) return decrypted;
      }
    }
    
    // 환경 변수에서 시도
    const envVarName = `${provider.toUpperCase()}_API_KEY`;
    if (process.env[envVarName]) {
      return process.env[envVarName];
    }
    
    throw new Error(tSync('api_key_not_found'));
  } catch (error) {
    console.error(tSync('api_key_error'), error);
    throw new Error(tSync('api_key_error_prompt'));
  }
}

/**
 * 기본 설정 저장 (초기 실행 시)
 */
export async function saveDefaultConfig() {
  const defaultConfig = {
    language: 'ko',
    llmProvider: 'anthropic',
    llmModel: 'claude-3-7-sonnet-20250219',
    outputDir: './test-results',
    screenshotOnEachStep: true,
    screenshotOnError: true,
    screenshotOnStartEnd: true,
    browser: 'chromium',
    headless: true,
    cicdPlatforms: ['jenkins', 'github'],
    useMcp: true,
    configVersion: '1.1'
  };
  
  try {
    await fs.ensureDir(path.dirname(DEFAULT_CONFIG_PATH));
    await fs.writeJson(DEFAULT_CONFIG_PATH, defaultConfig, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('기본 설정 파일 저장 중 오류:', error);
    return false;
  }
}

/**
 * Jenkins 설정 관련 값 로드
 */
export async function getJenkinsConfig() {
  const config = await loadConfig();
  return {
    jenkinsUrl: process.env.JENKINS_URL || config.jenkinsUrl,
    jenkinsUser: process.env.JENKINS_USER || config.jenkinsUser,
    jenkinsToken: process.env.JENKINS_TOKEN || config.jenkinsToken,
    jenkinsJob: process.env.JENKINS_JOB || config.jenkinsJob
  };
}