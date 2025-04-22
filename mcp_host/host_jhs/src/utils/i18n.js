// src/utils/i18n.js
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM에서는 __dirname이 없으므로 대체 방법 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 프로젝트 루트 경로
const PROJECT_ROOT = path.resolve(dirname(dirname(__dirname)));
const I18N_DIR = path.join(PROJECT_ROOT, 'i18n');

// 기본 언어 설정
let currentLanguage = 'ko';

// 번역 데이터 캐시
const translationsCache = {};

/**
 * 언어별 번역 파일 로드
 * @param {string} lang 언어 코드
 * @returns {Object} 번역 데이터
 */
async function loadTranslations(lang) {
  // 이미 캐시된 경우 반환
  if (translationsCache[lang]) {
    return translationsCache[lang];
  }
  
  try {
    // i18n 디렉토리의 JSON 파일에서 로드
    const filePath = path.join(I18N_DIR, `${lang}.json`);
    
    if (await fs.pathExists(filePath)) {
      const data = await fs.readJson(filePath);
      translationsCache[lang] = data;
      return data;
    }
    
    // 파일이 없으면 기본 내장 번역 사용
    return getDefaultTranslations(lang);
  } catch (error) {
    console.warn(`경고: ${lang} 언어 파일을 로드할 수 없습니다: ${filePath}: ${error.message}`);
    // 오류 발생 시 기본 내장 번역 사용
    return getDefaultTranslations(lang);
  }
}

/**
 * 내장 기본 번역 데이터 가져오기
 * @param {string} lang 언어 코드
 * @returns {Object} 번역 데이터
 */
function getDefaultTranslations(lang) {
  // 기본 내장 번역 (파일 로드 실패 시 대비)
  const defaultTranslations = {
    en: {
      // CLI 메시지
      'welcome': 'Welcome to LLM-Driven E2E Test Automation Tool',
      'test_running': 'Running test scenario...',
      'test_success': 'Test completed successfully',
      'test_failure': 'Test failed',
      'test_duration': 'Test duration',
      'test_errors': 'Errors',
      'test_analysis': 'Test Analysis',
      'screenshots_saved': 'Screenshots saved at',
      'setup_completed': 'Setup completed successfully!',
      'run_test_command': 'You can now run tests with:',
      
      // 설정 마법사
      'select_llm_provider': 'Select LLM provider:',
      'select_llm_model': 'Select model:',
      'enter_api_key': 'Enter {{provider}} API key:',
      'enter_output_dir': 'Enter directory for test results:',
      'select_screenshot_settings': 'Select screenshot settings:',
      'screenshot_each_step': 'Take screenshot at each step',
      'screenshot_on_error': 'Take screenshot on error',
      'screenshot_start_end': 'Take screenshot at start and end',
      'select_browser': 'Select browser for tests:',
      'headless_mode': 'Run in headless mode by default?',
      'select_cicd_platforms': 'Select CI/CD platforms to support:',
      'use_mcp': 'Enable Model Context Protocol (MCP)?',
      'api_key_saved_keychain': 'API key securely saved in system keychain.',
      'api_key_keychain_failed': 'Failed to save in keychain, storing encrypted in file.',
      'api_key_not_found': 'No saved API key found',
      'api_key_error': 'Error retrieving API key:',
      'api_key_error_prompt': 'Could not retrieve API key. Please run setup again.'
    },
    ko: {
      // CLI 메시지
      'welcome': 'LLM 기반 E2E 테스트 자동화 도구에 오신 것을 환영합니다',
      'test_running': '테스트 시나리오 실행 중...',
      'test_success': '테스트가 성공적으로 완료되었습니다',
      'test_failure': '테스트가 실패했습니다',
      'test_duration': '테스트 소요 시간',
      'test_errors': '오류',
      'test_analysis': '테스트 분석',
      'screenshots_saved': '스크린샷 저장 경로',
      'setup_completed': '설정이 성공적으로 저장되었습니다!',
      'run_test_command': '다음 명령으로 테스트를 실행할 수 있습니다:',
      
      // 설정 마법사
      'select_llm_provider': 'LLM 제공자를 선택하세요:',
      'select_llm_model': '사용할 모델을 선택하세요:',
      'enter_api_key': '{{provider}} API 키를 입력하세요:',
      'enter_output_dir': '테스트 결과를 저장할 경로를 입력하세요:',
      'select_screenshot_settings': '스크린샷 설정을 선택하세요:',
      'screenshot_each_step': '각 단계마다 스크린샷 촬영',
      'screenshot_on_error': '오류 발생 시 스크린샷 촬영',
      'screenshot_start_end': '테스트 시작/종료 시 스크린샷 촬영',
      'select_browser': '테스트에 사용할 기본 브라우저를 선택하세요:',
      'headless_mode': '기본적으로 헤드리스 모드로 실행할까요?',
      'select_cicd_platforms': '지원할 CI/CD 플랫폼을 선택하세요:',
      'use_mcp': 'Model Context Protocol (MCP)을 활성화할까요?',
      'api_key_saved_keychain': 'API 키가 시스템 키체인에 안전하게 저장되었습니다.',
      'api_key_keychain_failed': '키체인 저장 실패, 암호화 파일에 저장합니다.',
      'api_key_not_found': '저장된 API 키를 찾을 수 없습니다',
      'api_key_error': 'API 키를 가져오는 중 오류 발생:',
      'api_key_error_prompt': 'API 키를 가져올 수 없습니다. 설정을 다시 실행해주세요.'
    },
    ja: {
      // CLI メッセージ
      'welcome': 'LLM駆動型E2Eテスト自動化ツールへようこそ',
      'test_running': 'テストシナリオを実行中...',
      'test_success': 'テストが正常に完了しました',
      'test_failure': 'テストが失敗しました',
      'test_duration': 'テスト所要時間',
      'test_errors': 'エラー',
      'test_analysis': 'テスト分析',
      'screenshots_saved': 'スクリーンショット保存先',
      'setup_completed': '設定が正常に保存されました！',
      'run_test_command': '次のコマンドでテストを実行できます：'
    },
    zh: {
      // CLI 消息
      'welcome': '欢迎使用LLM驱动的E2E测试自动化工具',
      'test_running': '正在运行测试场景...',
      'test_success': '测试成功完成',
      'test_failure': '测试失败',
      'test_duration': '测试持续时间',
      'test_errors': '错误',
      'test_analysis': '测试分析',
      'screenshots_saved': '截图保存路径',
      'setup_completed': '设置已成功保存！',
      'run_test_command': '您可以使用以下命令运行测试：'
    }
  };
  
  return defaultTranslations[lang] || defaultTranslations.en;
}

/**
 * 프롬프트 템플릿 로드
 * @param {string} name 템플릿 이름
 * @param {string} lang 언어 코드
 * @returns {Promise<string>} 프롬프트 템플릿 내용
 */
export async function loadPromptTemplate(name, lang = currentLanguage) {
  try {
    // 템플릿 파일 경로
    const templatePath = path.join(PROJECT_ROOT, 'templates', 'prompts', `${name}_${lang}.md`);
    
    // 언어별 템플릿 확인
    if (await fs.pathExists(templatePath)) {
      return await fs.readFile(templatePath, 'utf8');
    }
    
    // 기본 템플릿 확인 (언어 코드 없는 버전)
    const defaultPath = path.join(PROJECT_ROOT, 'templates', 'prompts', `${name}.md`);
    if (await fs.pathExists(defaultPath)) {
      return await fs.readFile(defaultPath, 'utf8');
    }
    
    // 내장 기본 템플릿 사용
    return getDefaultPrompt(name, lang);
  } catch (error) {
    console.warn(`경고: 프롬프트 템플릿 ${name} 로드 실패:`, error.message);
    return getDefaultPrompt(name, lang);
  }
}

/**
 * 내장 기본 프롬프트 가져오기
 * @param {string} name 템플릿 이름
 * @param {string} lang 언어 코드
 * @returns {string} 프롬프트 템플릿
 */
function getDefaultPrompt(name, lang) {
  const templates = {
    test: {
      en: `The following is a natural language description of a web test scenario. Please convert it into JavaScript test code using Playwright.
        
Test description: {{test_description}}

Please generate test code in the following format:
1. Required import statements
2. Async function with clear comments for each step
3. Include necessary assertions
4. Include screenshot capture
5. Include error handling

Important: Return only the code with no explanations. The code should be ready to execute.`,
      ko: `다음은 웹 테스트 시나리오에 대한 자연어 설명입니다. 이를 Playwright를 사용한 JavaScript 테스트 코드로 변환해주세요.
        
테스트 설명: {{test_description}}

다음 형식으로 테스트 코드를 생성해주세요:
1. 필요한 import 문
2. 각 단계를 명확히 주석으로 설명하는 async 함수
3. 필요한 assertions 포함
4. 스크린샷 캡처 포함
5. 에러 핸들링

중요: 코드만 반환하고 설명은 하지 마세요. 코드는 즉시 실행 가능해야 합니다.`
    },
    analysis: {
      en: `The following are the results of a web test. Please analyze these results and provide insights on test success, errors, potential bugs, and suggestions for improvement.
        
Test results: {{test_results}}

Please format your response as follows:
1. Summary of test results
2. Identified issues and bugs
3. Root cause analysis
4. Suggested solutions`,
      ko: `다음은 웹 테스트의 결과입니다. 이 결과를 분석하여 테스트 성공 여부, 발생한 오류, 잠재적인 버그 및 개선 사항을 설명해주세요.
        
테스트 결과: {{test_results}}

답변 형식:
1. 전체 테스트 결과 요약
2. 발견된 문제점 및 버그 설명
3. 원인 분석
4. 해결 방안 제안`
    }
  };
  
  // 요청된 템플릿과 언어에 해당하는 프롬프트 반환
  return templates[name]?.[lang] || templates[name]?.en || `Template ${name} not found`;
}

/**
 * 언어 설정
 * @param {string} lang 언어 코드 (예: 'ko', 'en')
 */
export function setLanguage(lang) {
  if (lang && ['ko', 'en', 'ja', 'zh'].includes(lang)) {
    currentLanguage = lang;
    // 미리 캐시 로드 시도
    loadTranslations(lang).then(data => {
      translationsCache[lang] = data;
    }).catch(() => {
      // 오류 무시
    });
  } else {
    console.warn(`지원되지 않는 언어: ${lang}, 기본 언어(ko)를 사용합니다.`);
  }
}

/**
 * 비동기 번역 함수
 * @param {string} key 번역 키
 * @param {Object} params 대체 파라미터
 * @returns {Promise<string>} 번역된 문자열
 */
export async function t(key, params = {}) {
  // 현재 언어의 번역 데이터 로드
  const langData = await loadTranslations(currentLanguage);
  let text = langData[key] || key;
  
  // 파라미터 대체
  Object.entries(params).forEach(([param, value]) => {
    text = text.replace(new RegExp(`{{${param}}}`, 'g'), value);
  });
  
  return text;
}

/**
 * 동기식 번역 함수 (비동기 로드 없이 사용 가능)
 * @param {string} key 번역 키 
 * @param {Object} params 대체 파라미터
 * @returns {string} 번역된 문자열
 */
export function tSync(key, params = {}) {
  // 캐시된 번역 데이터 사용, 없으면 기본값
  const langData = translationsCache[currentLanguage] || getDefaultTranslations(currentLanguage);
  let text = langData[key] || key;
  
  // 파라미터 대체
  Object.entries(params).forEach(([param, value]) => {
    text = text.replace(new RegExp(`{{${param}}}`, 'g'), value);
  });
  
  return text;
}

/**
 * 현재 언어 가져오기
 * @returns {string} 현재 언어 코드
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 지원되는 모든 언어 목록 가져오기
 * @returns {Object[]} 언어 목록
 */
export function getSupportedLanguages() {
  return [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' }
  ].map(lang => ({
    ...lang,
    name: (translationsCache[currentLanguage]?.['lang_' + lang.code]) || 
          (getDefaultTranslations(currentLanguage)['lang_' + lang.code]) || 
          lang.name
  }));
}

// 초기화 시 기본 언어 로드
loadTranslations(currentLanguage).then(data => {
  translationsCache[currentLanguage] = data;
}).catch(err => {
  console.warn('초기 언어 데이터 로드 실패:', err.message);
});