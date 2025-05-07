import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

// 로그 레벨 정의
enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4
}

// 현재 로그 레벨 설정 (원하는 수준으로 조정)
const CURRENT_LOG_LEVEL = LogLevel.ERROR; // 에러만 출력

// 로그 파일 경로
const LOG_FILE_PATH = path.join(process.cwd(), 'mcp-logs', `mcp-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

// 로그 디렉토리 생성 함수
async function ensureLogDirectory() {
  try {
    await fs.mkdir(path.dirname(LOG_FILE_PATH), { recursive: true });
  } catch (error) {
    console.error('로그 디렉토리 생성 실패:', error);
  }
}

// 로그 출력 함수
async function log(level: LogLevel, ...args: any[]) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];
  const formattedMessage = `[${timestamp}] [${levelName}] ${message}\n`;
  
  // 로그 파일에 기록
  try {
    await fs.appendFile(LOG_FILE_PATH, formattedMessage);
  } catch (error) {
    // 에러 레벨 메시지는 항상 콘솔에 출력
    if (level === LogLevel.ERROR) {
      console.error('로그 파일 기록 실패:', error);
    }
  }
  
  // 콘솔에 출력 (로그 레벨에 따라)
  if (level <= CURRENT_LOG_LEVEL) {
    if (level === LogLevel.ERROR) {
      console.error(...args);
    } else if (level === LogLevel.WARN) {
      console.warn(...args);
    } else {
      console.log(...args);
    }
  }
}

// MCP 도구의 결과를 더 유연하게 타입 정의
type ContentItem = {
  type: string;
  text?: string;
  data?: string;
  mimeType?: string;
  [key: string]: any;
};

// 도구 결과의 인터페이스 정의
interface ToolResult {
  isError?: boolean;
  content?: ContentItem[];
  // 다른 일반적인 속성들
  binary?: string;
  url?: string;
  title?: string;
  result?: any;
  visible?: boolean;
  [key: string]: any;
}

// MCP 도구 이름과 대응하는 Playwright 메서드 이름의 매핑
const TOOL_MAPPING: Record<string, string> = {
  // 브라우저 관련 명령
  'browserLaunch': 'browser_install',
  'browserNewContext': 'browser_navigate',
  'contextNewPage': 'browser_tab_new',
  
  // 페이지 관련 명령
  'pageGoto': 'browser_navigate',
  'pageUrl': 'browser_snapshot', // 스냅샷에서 URL 정보를 추출
  'pageTitle': 'browser_snapshot', // 스냅샷에서 제목 정보를 추출
  'pageWaitForLoadState': 'browser_wait',
  'pageEvaluate': 'browser_snapshot', // 스냅샷으로 대체
  'pageClick': 'browser_click',
  'pageFill': 'browser_type',
  'pagePress': 'browser_press_key',
  'pageWaitForSelector': 'browser_wait', // 조건부 대기로 대체해야 함
  'pageScreenshot': 'browser_take_screenshot',
  'pageIsVisible': 'browser_snapshot', // 스냅샷에서 요소 존재 여부를 확인
  'pageClose': 'browser_tab_close',
  'contextClose': 'browser_close'
};

// 도구 이름을 실제 MCP 도구 이름으로 변환하는 함수
function mapToolName(name: string): string {
  return TOOL_MAPPING[name] || name;
}

// 도구 인자를 실제 MCP 도구 인자 형식으로 변환하는 함수
function mapToolArgs(name: string, args: any): any {
  switch (name) {
    case 'browserLaunch':
      // browser_install은 인자가 필요 없음
      return {};
      
    case 'browserNewContext':
      // 브라우저 컨텍스트는 browser_navigate로 대체
      // URL이 없는 경우 기본 URL 사용
      return { url: 'about:blank' };
      
    case 'contextNewPage':
      // 새 탭 생성은 browser_tab_new로 대체
      return {};
      
    case 'pageGoto':
      // 페이지 이동은 browser_navigate로 대체
      return { url: args.url };
      
    case 'pageWaitForLoadState':
      // 페이지 로딩 대기는 browser_wait로 대체
      return { time: 2 }; // 기본 2초 대기
      
    case 'pageClick':
      // 클릭 동작은 browser_click으로 대체
      return { 
        selector: args.selector,
        // MCP에 맞게 추가 옵션 설정
        timeout: 5000,
        button: 'left',
        clickCount: 1,
        delay: 0
      };
      
    case 'pageFill':
      // 텍스트 입력은 browser_type으로 대체
      return { 
        selector: args.selector,
        text: args.value,
        // MCP에 맞게 추가 옵션 설정
        delay: 0
      };
      
    case 'pagePress':
      // 키 입력은 browser_press_key로 대체
      return { 
        key: args.key
      };
      
    case 'pageScreenshot':
      // 스크린샷은 browser_take_screenshot으로 대체
      return { 
        fullPage: args.fullPage
      };
      
    case 'pageWaitForSelector':
      // 선택자 대기는 현재 직접 매핑이 없어 일반 대기로 대체
      return { 
        seconds: 2
      };
      
    case 'pageClose':
      // 페이지 닫기는 browser_tab_close로 대체
      return { index: 0 }; // 현재 활성 탭 닫기
      
    case 'contextClose':
      // 컨텍스트 닫기는 browser_close로 대체
      return {};
      
    default:
      return args;
  }
}

// 도구 결과를 원래 형식으로 변환하는 함수
function transformResult(name: string, result: any): ToolResult {
  if (result.isError) {
    log(LogLevel.ERROR, `Tool execution error for ${name}:`, result);
    return result as ToolResult; // 오류는 그대로 반환
  }
  
  // 결과를 맞춤형 ToolResult 타입으로 변환
  const toolResult: ToolResult = {};
  
  // content 속성이 있으면 복사
  if (result.content) {
    toolResult.content = result.content;
  }
  
  switch (name) {
    case 'pageUrl':
      // 스냅샷 결과에서 URL 추출
      toolResult.url = 'unknown'; // 실제로는 스냅샷에서 URL을 추출해야 함
      break;
      
    case 'pageTitle':
      // 스냅샷 결과에서 제목 추출
      toolResult.title = 'unknown'; // 실제로는 스냅샷에서 제목을 추출해야 함
      break;
      
    case 'pageScreenshot':
      // 스크린샷 결과를 Base64 문자열로 반환
      toolResult.binary = 'dummy-base64-string'; // 실제로는 스크린샷 데이터를 추출해야 함
      // 브라우저가 스크린샷 데이터를 가지고 있을 수 있음
      if (result.screenshot) {
        toolResult.binary = result.screenshot;
      } else if (result.data) {
        toolResult.binary = result.data;
      }
      break;
      
    case 'pageEvaluate':
      // 스냅샷 결과에서 필요한 정보 추출
      toolResult.result = []; // 실제로는 스냅샷에서 요소 정보를 추출해야 함
      break;
      
    case 'pageIsVisible':
      // 스냅샷 결과에서 요소 존재 여부 확인
      toolResult.visible = false; // 실제로는 스냅샷에서 요소 존재 여부를 확인해야 함
      break;
      
    default:
      // 다른 모든 속성을 복사
      Object.assign(toolResult, result);
      break;
  }
  
  return toolResult;
}

export class MCPClient {
  private client: Client;
  private transport: StdioClientTransport | undefined;
  private toolCache: Record<string, any> = {}; // 도구 캐시

  constructor() {
    // 로그 디렉토리 생성
    ensureLogDirectory();
    
    this.client = new Client(
      {
        name: 'natural-language-testing',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
    
    log(LogLevel.INFO, "MCPClient 인스턴스가 생성되었습니다.");
  }

  async connect(): Promise<void> {
    log(LogLevel.INFO, 'MCP 서버에 연결 시도 중...');
    
    // 콘솔에는 간략한 정보만 출력
    console.log('MCP 서버에 연결 중...');
    
    const npm = process.platform === 'win32' ? 'npx.cmd' : 'npx';

    try {
      // 직접 child process를 생성해서 더 자세한 정보 확인
      const proc = spawn(npm, ['@playwright/mcp@latest'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      // stdout과 stderr 이벤트 리스너 추가
      proc.stdout.on('data', (data) => {
        log(LogLevel.DEBUG, 'MCP Server stdout:', data.toString());
      });

      proc.stderr.on('data', (data) => {
        log(LogLevel.WARN, 'MCP Server stderr:', data.toString());
      });

      proc.on('error', (error) => {
        log(LogLevel.ERROR, 'MCP 서버 시작 실패:', error);
      });

      proc.on('close', (code) => {
        log(LogLevel.INFO, `MCP 서버 프로세스가 코드 ${code}로 종료되었습니다`);
      });

      // 프로세스가 시작되기를 잠시 기다림
      await new Promise((resolve) => setTimeout(resolve, 3000));

      this.transport = new StdioClientTransport({
        command: npm,
        args: ['@playwright/mcp@latest'],
      });

      log(LogLevel.INFO, 'Transport를 통해 MCP 서버에 연결 중...');
      await this.client.connect(this.transport);
      
      // 콘솔에는 간략한 정보만 출력
      console.log('MCP 서버에 성공적으로 연결되었습니다');
      
      log(LogLevel.INFO, 'Playwright MCP 서버에 성공적으로 연결되었습니다');

      // 연결 후 사용 가능한 도구 목록 확인
      try {
        const tools = await this.client.listTools();
        log(LogLevel.DEBUG, 'Available tools:', tools);
        
        // 도구 목록 캐싱
        if (tools && tools.tools) {
          this.toolCache = tools.tools.reduce((acc: Record<string, any>, tool: any) => {
            acc[tool.name] = tool;
            return acc;
          }, {});
          
          log(LogLevel.INFO, `${tools.tools.length}개의 MCP 도구를 로드했습니다`);
        } else {
          log(LogLevel.WARN, '도구를 찾을 수 없거나 도구 구조가 예상과 다릅니다:', tools);
        }
      } catch (error) {
        log(LogLevel.ERROR, '도구 목록 로드 실패:', error);
      }
    } catch (error) {
      log(LogLevel.ERROR, 'MCP 서버 연결 실패:', error);
      
      // 콘솔에 오류 표시
      console.error('MCP 서버 연결 실패:', error);
      
      throw error;
    }
  }

  async executeAction(action: string, args: any): Promise<ToolResult> {
    const mappedAction = mapToolName(action);
    const mappedArgs = mapToolArgs(action, args);
    
    log(LogLevel.DEBUG, `액션 실행: ${action} (mapped to ${mappedAction})`, mappedArgs);
    
    // 중요한 액션만 콘솔에 표시
    if (['pageClick', 'pageFill', 'pageGoto', 'pageScreenshot'].includes(action)) {
      console.log(`액션 실행: ${action}`);
    }

    // 도구가 존재하는지 확인
    if (!this.toolCache[mappedAction]) {
      log(LogLevel.WARN, `도구 "${mappedAction}"가 사용 가능한 도구에 없습니다. browser_snapshot을 대체로 사용합니다.`);
      
      // 기본적으로 스냅샷 도구로 대체
      if (mappedAction !== 'browser_snapshot') {
        try {
          const snapshotResult = await this.executeAction('pageUrl', {});
          return transformResult(action, snapshotResult);
        } catch (error) {
          log(LogLevel.ERROR, `대체 스냅샷 실행 오류:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Failed to execute fallback for ${action}` }]
          };
        }
      }
    }

    try {
      // MCP 클라이언트 호출
      let result: any;
      try {
        result = await this.client.callTool({
          name: mappedAction,
          arguments: mappedArgs,
        });
      } catch (mcpError) {
        log(LogLevel.ERROR, `MCP 클라이언트 오류 (${mappedAction}):`, mcpError);
        // MCP 오류가 발생하면 더미 응답
        result = {
          content: [{ type: 'text', text: `Tool "${mappedAction}" execution failed` }],
          isError: true
        };
      }

      log(LogLevel.DEBUG, `액션 ${action} (${mappedAction}) 결과:`, result);
      
      // 중요한 액션의 결과만 콘솔에 간략히 표시
      if (['pageClick', 'pageFill', 'pageGoto'].includes(action)) {
        console.log(`액션 ${action} 완료`);
      }
      
      // 결과 변환 및 반환
      const transformedResult = transformResult(action, result);
      return transformedResult;
    } catch (error) {
      log(LogLevel.ERROR, `액션 실행 오류 ${action} (${mappedAction}):`, error);
      
      // 콘솔에 오류 표시
      console.error(`액션 ${action} 실행 오류:`, error instanceof Error ? error.message : error);
      
      // 더 자세한 에러 정보를 로그에 기록
      if (error instanceof Error) {
        log(LogLevel.ERROR, '오류 상세 정보:', {
          message: error.message,
          stack: error.stack,
        });
      }
      
      // 에러 발생 시 더미 데이터 반환
      const errorResult: ToolResult = {
        isError: true,
        content: [{ type: 'text', text: `Error executing ${action}` }]
      };
      
      // 특정 응답 형태에 맞게 추가 필드
      switch (action) {
        case 'pageScreenshot':
          errorResult.binary = '';
          break;
        case 'pageUrl':
          errorResult.url = 'unknown';
          break;
        case 'pageTitle':
          errorResult.title = 'unknown';
          break;
        case 'pageEvaluate':
          errorResult.result = [];
          break;
        case 'pageIsVisible':
          errorResult.visible = false;
          break;
      }
      
      return errorResult;
    }
  }

  async disconnect(): Promise<void> {
    log(LogLevel.INFO, 'MCP 서버 연결 해제 중...');
    
    // 콘솔에 메시지 표시
    console.log('MCP 서버 연결 해제 중...');
    
    try {
      await this.client.close();
      log(LogLevel.INFO, 'MCP 서버 연결이 해제되었습니다');
      
      // 콘솔에 메시지 표시
      console.log('MCP 서버 연결이 해제되었습니다');
    } catch (error) {
      log(LogLevel.ERROR, '연결 해제 중 오류 발생:', error);
      
      // 콘솔에 오류 표시
      console.error('연결 해제 중 오류 발생:', error);
    }
  }
}