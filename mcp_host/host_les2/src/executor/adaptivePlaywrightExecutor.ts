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
  selector?: string;
  elementRef?: string | null; // 📌 추가: ref를 명시적으로 저장
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
  private testRunDir: string;
  private screenshotsDir: string;
  private testReport: TestReport;
  private anthropic: Anthropic;
  private browserContextId: string | null = null;
  private pageId: string | null = null;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'test-results');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.testRunDir = path.join(this.outputDir, `test-run-${timestamp}`);
    this.screenshotsDir = path.join(this.testRunDir, 'screenshots');
    this.mcpClient = new MCPClient();
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.testReport = {
      testName: 'Natural Language Test',
      startTime: '',
      endTime: '',
      duration: 0,
      totalSteps: 0,
      passedSteps: 0,
      failedSteps: 0,
      steps: []
    };
  }

  async handleFill(step: TestStep, stepResult: StepResult) {
    console.log(`⌨️ 입력 시작: ${step.description}`);
    
    // 최대 3번 재시도
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🔄 입력 시도 #${attempt + 1}...`);
        
        // 매번 새로운 스냅샷 가져오기
        const snapshot = await this.getPageSnapshot();
        let { selector, ref } = await this.getSelectorAndRef(step, snapshot);
        
        stepResult.selector = selector;
        stepResult.elementRef = ref;
        
        console.log('[🧩 입력 필드 추출 결과]', { selector, ref });
        
        if (!ref) {
          console.warn(`⚠️ 입력 필드 ref를 찾을 수 없음 (시도 ${attempt + 1}/3): ${step.description}`);
          
          if (attempt < 2) {
            console.log('🕒 페이지 로딩을 위해 2초 대기 중...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue; // 다음 시도
          } else {
            // 마지막 시도에서 휴리스틱 적용
            const targetDesc = step.target || step.description;
            
            // 입력 필드 직접 찾기
            const result = await this.mcpClient.executeAction('pageEvaluate', {
              page: this.pageId,
              expression: `() => {
                const inputTypes = {
                  username: ['input[name="username"]', 'input[name="id"]', 'input[placeholder*="아이디"]', 
                            'input[placeholder*="이메일"]', 'input[type="email"]', 'input#username'],
                  password: ['input[type="password"]', 'input[name="password"]', 'input[placeholder*="비밀번호"]', 
                            'input#password'],
                  passwordConfirm: ['input[name="confirmPassword"]', 'input[name="password2"]', 
                                  'input[placeholder*="비밀번호 확인"]', 'input[placeholder*="확인"]']
                };
                
                let selectorSet = inputTypes.username; // 기본값
                
                if ('${targetDesc}'.includes('비밀번호') && '${targetDesc}'.includes('확인')) {
                  selectorSet = inputTypes.passwordConfirm;
                } else if ('${targetDesc}'.includes('비밀번호')) {
                  selectorSet = inputTypes.password;
                }
                
                // 각 선택자 시도
                for (const selector of selectorSet) {
                  const element = document.querySelector(selector);
                  if (element) {
                    // 요소 강조 표시 (디버깅용)
                    const originalBorder = element.style.border;
                    element.style.border = '2px solid red';
                    setTimeout(() => { element.style.border = originalBorder; }, 3000);
                    
                    return {
                      found: true,
                      selector: selector,
                      value: element.value,
                      type: element.getAttribute('type'),
                      placeholder: element.getAttribute('placeholder')
                    };
                  }
                }
                
                // 모든 가시적 입력 필드 찾기 (마지막 수단)
                const visibleInputs = Array.from(document.querySelectorAll('input')).filter(el => {
                  const rect = el.getBoundingClientRect();
                  return rect.width > 0 && rect.height > 0;
                });
                
                if (visibleInputs.length > 0) {
                  const element = visibleInputs[0]; // 첫 번째 가시적 입력 필드 사용
                  return {
                    found: true,
                    selector: 'input',
                    fallback: true,
                    value: element.value,
                    type: element.getAttribute('type'),
                    placeholder: element.getAttribute('placeholder')
                  };
                }
                
                return { found: false };
              }`
            });
            
            if (result.result && result.result.found) {
              console.log(`✅ 입력 필드 감지됨: ${result.result.selector}`);
              
              // 직접 선택자 사용하여 입력
              await this.mcpClient.executeAction('pageEvaluate', {
                page: this.pageId,
                expression: `() => {
                  const el = document.querySelector('${result.result.selector}');
                  if (el) {
                    // 현재 값 지우기
                    el.value = '';
                    // 새 값 설정
                    el.value = '${step.value}';
                    // 이벤트 발생
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    return true;
                  }
                  return false;
                }`
              });
              
              console.log(`✅ 대체 입력 성공: ${step.value}`);
              return;
            }
            
            // 휴리스틱도 실패하면 오류
            throw new Error(`${step.target || step.description} 입력 필드를 찾을 수 없습니다.`);
          }
        }
        
        // MCP 입력 시도
        try {
          await this.mcpClient.executeAction('pageFill', {
            ref,
            element: step.description || '입력 필드',
            text: step.value || ''
          });
          
          console.log(`✅ 입력 완료: ${step.value}`);
          return; // 성공적으로 입력 완료
        } catch (error: any) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.warn(`⚠️ 입력 실패: ${errorMsg}`);
          
          // Stale ref 오류 확인
          if (errorMsg.includes('Stale aria-ref')) {
            console.log('🔁 오래된 ref 감지. 재시도 중...');
            
            if (attempt < 2) {
              // 다음 시도 전 대기
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
          } else {
            // 다른 오류는 즉시 재시도하지 않고 상위로 전파
            throw error;
          }
        }
      } catch (error) {
        // 마지막 시도에서 실패하면 오류 전파
        if (attempt === 2) {
          throw error;
        }
        console.error(`❌ 입력 시도 #${attempt + 1} 실패:`, error);
        // 다음 시도 전 더 긴 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    throw new Error(`${step.description} 입력 실패: 최대 재시도 횟수 초과`);
  }
  async handlePress(step: TestStep, stepResult: StepResult) {
    const snapshot = await this.getPageSnapshot();
    const { selector, ref } = await this.getSelectorAndRef(step, snapshot);
    stepResult.selector = selector;
    stepResult.elementRef = ref;

    await this.mcpClient.executeAction('pagePress', {
      page: this.pageId,
      selector,
      key: step.value || 'Enter'
    });

    console.log(`✅ 키 입력 완료: ${selector}`);
  }

  async handleWaitForSelector(step: TestStep, stepResult: StepResult) {
    const snapshot = await this.getPageSnapshot();
    const { selector, ref } = await this.getSelectorAndRef(step, snapshot);
    stepResult.selector = selector;
    stepResult.elementRef = ref;

    await this.mcpClient.executeAction('pageWaitForSelector', {
      page: this.pageId,
      selector,
      timeout: 5000
    });

    console.log(`✅ 요소 대기 완료: ${selector}`);
  }
  async handleClick(step: TestStep, stepResult: StepResult) {
    console.log(`🖱️ 클릭 시작: ${step.description}`);
    
    // 페이지 안정화를 위한 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 최대 3번 재시도
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🔄 클릭 시도 #${attempt + 1}...`);
        
        // 매번 새로운 스냅샷 가져오기
        const snapshot = await this.getPageSnapshot();
        let { selector, ref } = await this.getSelectorAndRef(step, snapshot);
        
        stepResult.selector = selector;
        stepResult.elementRef = ref;
        
        console.log('[🧩 선택자 추출 결과]', { selector, ref });
        
        if (!ref) {
          console.warn(`⚠️ ref를 찾을 수 없음 (시도 ${attempt + 1}/3): ${step.description}`);
          
          if (attempt < 2) {
            console.log('🕒 페이지 로딩을 위해 2초 대기 중...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue; // 다음 시도
          } else {
            // 마지막 시도에서 휴리스틱 사용
            const targetText = step.target || step.description;
            if (targetText.includes('회원가입')) {
              // 회원가입 버튼은 페이지 상단에 있을 가능성이 높음
              console.log('🔍 회원가입 버튼 휴리스틱 사용');
              
              // 회원가입 버튼 찾기 위한 직접 평가
              const result = await this.mcpClient.executeAction('pageEvaluate', {
                page: this.pageId,
                expression: `() => {
                  // 다양한 회원가입 버튼 패턴 찾기
                  const possibilities = [
                    document.querySelector('button:not([disabled]):has-text("회원가입")'),
                    document.querySelector('button:not([disabled]):has-text("가입")'),
                    document.querySelector('a:has-text("회원가입")'),
                    document.querySelector('a:has-text("가입")'),
                    document.querySelector('[role="button"]:has-text("회원가입")'),
                    document.querySelector('button:not([disabled]):has-text("Sign up")'),
                    document.querySelector('a:has-text("Sign up")'),
                    // 첫 10개 버튼 중 첫 번째 버튼 (마지막 수단)
                    Array.from(document.querySelectorAll('button'))[0]
                  ];
                  
                  // 첫 번째 유효한 요소 찾기
                  const element = possibilities.find(el => el !== null);
                  
                  if (element) {
                    // 요소 강조 표시 (디버깅용)
                    const originalBackground = element.style.backgroundColor;
                    element.style.backgroundColor = 'red';
                    setTimeout(() => { element.style.backgroundColor = originalBackground; }, 3000);
                    
                    // 계산된 위치 반환
                    const rect = element.getBoundingClientRect();
                    return {
                      found: true,
                      text: element.textContent,
                      x: rect.x + rect.width / 2,
                      y: rect.y + rect.height / 2
                    };
                  }
                  
                  return { found: false };
                }`
              });
              
              if (result.result && result.result.found) {
                console.log(`✅ 회원가입 버튼 감지됨: "${result.result.text}"`);
                
                // 직접 클릭 이벤트 전송
                await this.mcpClient.executeAction('pageEvaluate', {
                  page: this.pageId,
                  expression: `() => {
                    const ev = new MouseEvent('click', {
                      view: window,
                      bubbles: true,
                      cancelable: true,
                      clientX: ${result.result.x},
                      clientY: ${result.result.y}
                    });
                    
                    const el = document.elementFromPoint(${result.result.x}, ${result.result.y});
                    if (el) el.dispatchEvent(ev);
                  }`
                });
                
                // 페이지 변경 대기
                await this.mcpClient.executeAction('pageWaitForLoadState', {
                  page: this.pageId,
                  state: 'networkidle'
                });
                
                console.log(`✅ 대체 클릭 성공`);
                return;
              }
            }
            
            // 휴리스틱도 실패하면 오류
            throw new Error(`${step.target || step.description} 요소를 찾을 수 없습니다.`);
          }
        }
        
        // MCP 클릭 시도
        try {
          await this.mcpClient.executeAction('pageClick', {
            ref,
            element: step.description || '클릭 대상'
          });
          
          console.log(`✅ 클릭 완료: ${ref}`);
          
          // 클릭 후 페이지 변경을 위한 대기
          await this.mcpClient.executeAction('pageWaitForLoadState', {
            page: this.pageId,
            state: 'networkidle',
            timeout: 10000
          });
          
          // 추가 안정화 대기
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return; // 성공적으로 클릭 완료
        } catch (error: any) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.warn(`⚠️ 클릭 실패: ${errorMsg}`);
          
          // Stale ref 오류 확인
          if (errorMsg.includes('Stale aria-ref')) {
            console.log('🔁 오래된 ref 감지. 재시도 중...');
            
            if (attempt < 2) {
              // 다음 시도 전 대기
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            }
          } else {
            // 다른 오류는 즉시 재시도하지 않고 상위로 전파
            throw error;
          }
        }
      } catch (error) {
        // 마지막 시도에서 실패하면 오류 전파
        if (attempt === 2) {
          throw error;
        }
        console.error(`❌ 클릭 시도 #${attempt + 1} 실패:`, error);
        // 다음 시도 전 더 긴 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    throw new Error(`${step.description} 클릭 실패: 최대 재시도 횟수 초과`);
  }
  
  private async getSelectorAndRef(step: TestStep, snapshot: string): Promise<{ selector: string; ref: string | null }> {
    try {
      const parsed = JSON.parse(snapshot);
      const elements = parsed.elements || [];
      
      if (elements.length === 0) {
        console.warn("⚠️ getSelectorAndRef: 요소 목록이 비어 있습니다");
        return { selector: '', ref: null };
      }
      
      // 요소 정보 중 일부만 Claude에 전달하여 복잡성 감소
      const simplifiedElements = elements.map((el: any, idx: number) => {
        return {
          index: idx,
          tagName: el.tagName,
          type: el.type,
          name: el.name,
          id: el.id,
          className: el.className,
          text: el.text || el.buttonText || '',
          placeholder: el.placeholder || '',
          visible: el.visible
        };
      });
      
      // 스텝 정보에서 더 많은 컨텍스트 추출
      let targetContext = '';
      if (step.action === 'click' && step.target?.includes('회원가입')) {
        targetContext = '회원가입 버튼을 찾아야 합니다. 일반적으로 버튼 요소이며 "회원가입", "가입", "Sign up" 등의 텍스트를 포함합니다.';
      } else if (step.action === 'fill' && step.target?.includes('아이디')) {
        targetContext = '아이디/이메일 입력란을 찾아야 합니다. 일반적으로 input 요소이며 type="text" 또는 type="email"이고 name="username" 또는 placeholder에 "아이디", "이메일" 등의 텍스트를 포함합니다.';
      } else if (step.action === 'fill' && step.target?.includes('비밀번호')) {
        targetContext = '비밀번호 입력란을 찾아야 합니다. 일반적으로 input 요소이며 type="password"이고 name="password" 또는 placeholder에 "비밀번호", "Password" 등의 텍스트를 포함합니다.';
      }
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `현재 웹 페이지에서 특정 요소를 찾아야 합니다.
  
  실행할 작업: ${step.action}
  작업 설명: ${step.description}
  대상 요소: ${step.target || ''}
  ${step.value ? `입력할 값: ${step.value}` : ''}
  
  ${targetContext}
  
  페이지 요소 목록 (${simplifiedElements.length}개):
  ${JSON.stringify(simplifiedElements, null, 2)}
  
  페이지 URL: ${parsed.url}
  페이지 제목: ${parsed.title}
  
  다음 표준 형식으로만 응답해주세요:
  \`\`\`json
  {
    "selector": "가장 적합한 CSS 선택자",
    "ref": "요소 인덱스 기반 참조 (예: s0e5)",
    "confidence": 0.9,
    "reasoning": "이 요소를 선택한 이유에 대한 간략한 설명"
  }
  \`\`\`
  
  selector는 CSS 선택자이고, ref는 elements 배열의 인덱스를 기반으로 한 참조입니다. 
  예를 들어, 0번 인덱스의 요소를 참조하려면 ref는 "s0e0"이 됩니다. 
  가장 적합한 요소를 찾아 높은 신뢰도(confidence)를 제공하세요.
  요소를 찾을 수 없으면 confidence를 0으로 설정하세요.`
          },
        ]
      });
  
      console.log('[📩 Claude 요청] 요소 검색:', {
        action: step.action,
        description: step.description,
        target: step.target,
        elementsCount: simplifiedElements.length,
      });
      
      try {
        const content = response.content[0];
        if (content.type === 'text') {
          console.log('[📨 Claude 응답]', content.text);
          
          // JSON 추출
          const jsonMatch = content.text.match(/```json\s*([\s\S]*?)\s*```|(\{.*\})/s);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[2];
            const parsed = JSON.parse(jsonStr);
            
            // 낮은 신뢰도 경고
            if (parsed.confidence < 0.7 && parsed.ref) {
              console.warn(`⚠️ 요소 찾기 신뢰도 낮음 (${parsed.confidence}): ${parsed.reasoning}`);
            }
            
            // Claude가 제공한 ref를 사용하기 전에 유효성 검사
            if (parsed.ref && elements.length > 0) {
              // ref 형식이 s0e5 같은 형태인지 확인
              const refMatch = parsed.ref.match(/s\d+e(\d+)/);
              if (refMatch) {
                const elementIndex = parseInt(refMatch[1]);
                // 인덱스가 유효한지 확인
                if (elementIndex >= 0 && elementIndex < elements.length) {
                  console.log(`✅ 유효한 요소 찾음: ${parsed.ref} (인덱스 ${elementIndex})`);
                } else {
                  console.warn(`⚠️ 유효하지 않은 요소 인덱스: ${elementIndex} (요소 수: ${elements.length})`);
                  // 대체 요소 시도
                  if (elements.length > 0) {
                    const newRef = `s0e0`; // 첫 번째 요소 사용
                    console.log(`🔄 대체 요소로 전환: ${newRef}`);
                    parsed.ref = newRef;
                  }
                }
              }
            }
            
            return {
              selector: parsed.selector || '',
              ref: (parsed.confidence >= 0.5) ? parsed.ref : null
            };
          }
        }
      } catch (err) {
        console.error('❌ AI 응답 파싱 실패:', err);
      }
      
      // 대체 로직: 간단한 휴리스틱으로 요소 찾기
      console.log('⚠️ Claude 응답 파싱 실패, 대체 로직 시도');
      const targetTerm = (step.target || step.description || '').toLowerCase();
      
      // 단순 텍스트 매칭으로 요소 찾기
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const elText = (el.text || el.buttonText || '').toLowerCase();
        const elPlaceholder = (el.placeholder || '').toLowerCase();
        const elName = (el.name || '').toLowerCase();
        const elId = (el.id || '').toLowerCase();
        
        // 클릭 대상 검색
        if (step.action === 'click' && 
            (elText.includes('회원가입') || elText.includes('가입') || 
             elText.includes('sign up') || elText.includes('signup'))) {
          return { 
            selector: `button:contains('${elText}')`, 
            ref: `s0e${i}` 
          };
        }
        
        // 아이디 입력란 검색
        if (step.action === 'fill' && targetTerm.includes('아이디') &&
            (el.tagName === 'input' && (el.type === 'text' || el.type === 'email') &&
             (elPlaceholder.includes('아이디') || elPlaceholder.includes('이메일') || 
              elName.includes('user') || elName.includes('email') || 
              elId.includes('user') || elId.includes('email')))) {
          return { 
            selector: `input[type="${el.type}"]${el.name ? `[name="${el.name}"]` : ''}`, 
            ref: `s0e${i}` 
          };
        }
        
        // 비밀번호 입력란 검색
        if (step.action === 'fill' && targetTerm.includes('비밀번호') &&
            (el.tagName === 'input' && el.type === 'password')) {
          return { 
            selector: `input[type="password"]${el.name ? `[name="${el.name}"]` : ''}`, 
            ref: `s0e${i}` 
          };
        }
      }
      
      return { selector: '', ref: null };
    } catch (error) {
      console.error('❌ getSelectorAndRef 실행 오류:', error);
      return { selector: '', ref: null };
    }
  }

  mapToolArgs(name: string, args: any): any {
    let mappedArgs: any = {};

    switch (name) {
      case 'pageClick':
        mappedArgs = {
          page: args.page,
          selector: args.selector
        };
        break;

      // 다른 명령어 매핑 생략
    }

    return mappedArgs;
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
      console.log("📸 스냅샷 캡처 시작...");
      
      // 페이지가 네트워크 활동 완료될 때까지 대기
      try {
        await this.mcpClient.executeAction('pageWaitForLoadState', {
          page: this.pageId,
          state: 'networkidle',
          timeout: 10000
        });
        console.log("✅ 페이지 로딩 완료");
      } catch (e) {
        console.warn("⚠️ 페이지 로딩 대기 시간 초과 (계속 진행)");
      }
      
      // DOM이 안정화될 시간 제공
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 요소가 있는지 확인
      try {
        await this.mcpClient.executeAction('pageWaitForSelector', {
          page: this.pageId,
          selector: 'body',
          timeout: 5000
        });
        console.log("✅ body 요소 확인됨");
      } catch (e) {
        console.warn("⚠️ body 요소를 찾을 수 없음");
      }
      
      // 현재 URL 및 제목 가져오기
      const urlResult = await this.mcpClient.executeAction('pageUrl', {
        page: this.pageId
      });
      const url = urlResult.url || 'unknown';
      
      const titleResult = await this.mcpClient.executeAction('pageTitle', {
        page: this.pageId
      });
      const title = titleResult.title || 'unknown';
      
      console.log(`📄 페이지 정보: URL=${url}, 제목=${title}`);
      
      // 페이지 내 요소 평가 - 대상 요소 범위 확장
      const elementsResult = await this.mcpClient.executeAction('pageEvaluate', {
        page: this.pageId,
        expression: `() => {
          const allElements = Array.from(
            document.querySelectorAll('button, input, textarea, select, a, [role="button"], [tabindex="0"], div[onclick], label, form')
          );
          
          const result = allElements.map((el, index) => {
            // 버튼 텍스트를 더 정확하게 추출
            const buttonText = el.tagName.toLowerCase() === 'button' 
              ? (el.textContent || '').trim() 
              : '';
            
            // 입력 필드 관련 정보 강화
            const isInput = el.tagName.toLowerCase() === 'input';
            const inputType = isInput ? (el.getAttribute('type') || '') : '';
            const placeholder = isInput ? (el.getAttribute('placeholder') || '') : '';
            
            return {
              index: index,
              tagName: el.tagName.toLowerCase(),
              type: inputType || el.getAttribute('type') || '',
              name: el.getAttribute('name') || '',
              id: el.id || '',
              className: el.className || '',
              placeholder: placeholder,
              buttonText: buttonText,
              text: (el.textContent || '').trim().substring(0, 100),
              value: el.value || '',
              visible: el.offsetWidth > 0 && el.offsetHeight > 0,
              attributes: {
                role: el.getAttribute('role') || '',
                ariaLabel: el.getAttribute('aria-label') || '',
                ariaLabelledby: el.getAttribute('aria-labelledby') || '',
              },
              // 여기에 위치 정보 추가하면 더 많은 정보 제공 가능
              position: {
                x: el.getBoundingClientRect().x,
                y: el.getBoundingClientRect().y,
                width: el.getBoundingClientRect().width,
                height: el.getBoundingClientRect().height
              }
            };
          });
          
          console.log('요소 감지됨: ' + result.length);
          return result;
        }`
      });
      
      const elements = elementsResult.result || [];
      console.log(`🔍 페이지에서 ${elements.length}개 요소 감지됨`);
      
      if (elements.length === 0) {
        console.warn("⚠️ 감지된 요소 없음! DOM에 접근할 수 없습니다.");
      }
      
      // 디버깅을 위해 처음 몇 개 요소 정보 출력
      if (elements.length > 0) {
        console.log("📋 첫 3개 요소 샘플:");
        for (let i = 0; i < Math.min(3, elements.length); i++) {
          console.log(`  요소 ${i}: ${elements[i].tagName} - ${elements[i].buttonText || elements[i].text || elements[i].placeholder || elements[i].name || elements[i].id || '(텍스트 없음)'}`);
        }
      }
      
      return JSON.stringify(
        {
          url,
          title,
          timestamp: new Date().toISOString(),
          elements
        },
        null,
        2
      );
    } catch (error) {
      console.error('❌ 페이지 스냅샷 가져오기 실패:', error);
      return JSON.stringify(
        {
          url: 'unknown',
          title: 'unknown',
          timestamp: new Date().toISOString(),
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

            case 'click':
              await this.handleClick(step, stepResult);
              break;
            case 'fill':
              await this.handleFill(step, stepResult);
              break;
            case 'press':
              await this.handlePress(step, stepResult);
              break;
            case 'wait':
              await this.handleWaitForSelector(step, stepResult);
              break;
            case 'screenshot':
              // 여기도 직접 처리
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