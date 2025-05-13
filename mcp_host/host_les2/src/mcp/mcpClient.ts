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
  DEBUG = 4,
}

// 현재 로그 레벨 설정 (원하는 수준으로 조정)
const CURRENT_LOG_LEVEL = LogLevel.ERROR;

// 로그 파일 경로
const LOG_FILE_PATH = path.join(
  process.cwd(),
  'mcp-logs',
  `mcp-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
);

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
  const message = args
    .map((arg) =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    )
    .join(' ');

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

const TOOL_MAPPING: Record<string, string> = {
  // 브라우저 초기화 관련
  browserLaunch: 'browser_install', // 설치용
  browserNewContext: 'browser_snapshot', // snapshot을 처음 찍는 용도로 사용 가능
  contextNewPage: 'browser_tab_new',

  // 페이지 관련
  pageGoto: 'browser_navigate',
  pageClick: 'browser_click',
  pageFill: 'browser_type',
  pagePress: 'browser_press_key',
  pageWaitForLoadState: 'browser_wait_for',
  pageWaitForSelector: 'browser_snapshot', // 직접 wait 기능 없으므로 snapshot으로 대체
  pageEvaluate: 'browser_snapshot', // 별도 evaluate tool 없음
  pageUrl: 'browser_snapshot',
  pageTitle: 'browser_snapshot',
  pageIsVisible: 'browser_snapshot',

  // 기타
  pageScreenshot: 'browser_take_screenshot',
  pageSnapshot: 'browser_snapshot',
  pageClose: 'browser_tab_close',
  contextClose: 'browser_close',
  handleDialog: 'browser_handle_dialog',
};

// 도구 이름을 실제 MCP 도구 이름으로 변환하는 함수
function mapToolName(name: string): string {
  return TOOL_MAPPING[name] || name;
}

// 도구 인자를 실제 MCP 도구 인자 형식으로 변환하는 함수
function mapToolArgs(name: string, args: any): any {
  let mappedArgs: any = {};

  switch (name) {
    case 'browserLaunch':
      mappedArgs = {};
      break;

    case 'browserNewContext':
    case 'contextNewPage':
      mappedArgs = {};
      break;

    case 'pageGoto':
      mappedArgs = {
        url: args.url,
      };
      break;

    case 'pageWaitForLoadState':
      mappedArgs = {
        time: args.timeout ? Math.min(args.timeout / 1000, 10) : 5, // 최대 10초
      };
      break;

    case 'pageClick':
      mappedArgs = {
        ref: args.ref,
        element: args.element,
      };
      break;

    case 'pageFill':
      mappedArgs = {
        element: args.element,
        ref: args.ref,
        text: args.text,
        submit: false, // Enter 키를 누르지 않음
      };
      break;

    case 'pagePress':
      mappedArgs = {
        key: args.key,
      };
      break;

    case 'pageScreenshot':
      // browser_take_screenshot은 raw 인자가 불리언 타입이어야 함
      mappedArgs = {
        raw: true, // 문자열 "true"가 아닌 불리언 true로 설정
      };
      break;

    case 'pageWaitForSelector':
      // browser_wait로 대체
      mappedArgs = {
        time: 3, // 초단위
      };
      break;

    case 'pageIsVisible':
      mappedArgs = {};
      break;

    case 'pageClose':
    case 'contextClose':
      mappedArgs = {};
      break;

    default:
      mappedArgs = args;
      break;
  }

  return mappedArgs;
}

function transformResult(name: string, result: any): ToolResult {
  if (result.isError) {
    log(LogLevel.ERROR, `Tool execution error for ${name}:`, result);
    return result as ToolResult;
  }

  const toolResult: ToolResult = {};

  // content에 텍스트가 있다면 먼저 파싱
  const textContent = result.content?.find((item: any) => item.type === 'text')?.text || '';
  
  switch (name) {
    case 'pageUrl': {
      const urlMatch = textContent.match(/- Page URL: (.+)/);
      if (urlMatch) {
        toolResult.url = urlMatch[1].trim();
      }
      break;
    }

    case 'pageTitle': {
      const titleMatch = textContent.match(/- Page Title: (.+)/);
      if (titleMatch) {
        toolResult.title = titleMatch[1].trim();
      }
      break;
    }

    case 'pageSnapshot': {
      toolResult.pageSnapshot = textContent;
      break;
    }

    case 'pageIsVisible': {
      // 요소 ref나 텍스트가 있는지 확인해 존재 여부 판단
      const targetRef = '회원가입'; // 예시 - 실제로는 매개변수나 외부에서 받아야 함
      toolResult.visible = textContent.includes(targetRef);
      break;
    }

    case 'pageEvaluate': {
      // 요소 리스트를 추출하는 로직 예시
      const matches = [...textContent.matchAll(/- ([^\n]+) \[ref=([^\]]+)\]/g)];
      toolResult.result = matches.map(m => ({
        label: m[1].trim(),
        ref: m[2].trim()
      }));
      break;
    }

    case 'pageScreenshot': {
      if (result.screenshot) {
        toolResult.binary = result.screenshot;
      } else if (result.data) {
        toolResult.binary = result.data;
      } else if (result.content && Array.isArray(result.content)) {
        const imageContent = result.content.find((item: any) => item.type === 'image' && item.data);
        if (imageContent?.data) {
          toolResult.binary = imageContent.data;
        }
      }
      break;
    }

    default: {
      Object.assign(toolResult, result);
      break;
    }
  }

  // content 복사
  if (result.content) {
    toolResult.content = result.content;
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

    log(LogLevel.INFO, 'MCPClient 인스턴스가 생성되었습니다.');
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
        shell: true,
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

      console.log('MCP 서버에 성공적으로 연결되었습니다');

      log(LogLevel.INFO, 'Playwright MCP 서버에 성공적으로 연결되었습니다');

      // 연결 후 사용 가능한 도구 목록 확인
      try {
        const tools = await this.client.listTools();
        log(LogLevel.DEBUG, 'Available tools:', tools);

        // 도구 목록 캐싱
        if (tools && tools.tools) {
          this.toolCache = tools.tools.reduce(
            (acc: Record<string, any>, tool: any) => {
              acc[tool.name] = tool;
              return acc;
            },
            {}
          );

          log(
            LogLevel.INFO,
            `${tools.tools.length}개의 MCP 도구를 로드했습니다`
          );
        } else {
          log(
            LogLevel.WARN,
            '도구를 찾을 수 없거나 도구 구조가 예상과 다릅니다:',
            tools
          );
        }
      } catch (error) {
        log(LogLevel.ERROR, '도구 목록 로드 실패:', error);
      }
    } catch (error) {
      log(LogLevel.ERROR, 'MCP 서버 연결 실패:', error);

      console.error('MCP 서버 연결 실패:', error);

      throw error;
    }
  }

async handleDialog(accept: boolean = true, promptText?: string): Promise<void> {
  try {
    console.log(`🔄 대화 상자 처리 중... (${accept ? '수락' : '거부'})`);
    
    // 직접 도구 이름 사용
    await this.client.callTool({
      name: 'browser_handle_dialog', // 매핑된 이름이 아닌 실제 도구 이름 사용
      arguments: {
        accept,
        promptText
      }
    });
    
    console.log('✅ 대화 상자 처리 완료');
  } catch (error) {
    console.error('❌ 대화 상자 처리 실패:', error);
    throw error;
  }
}

  async executeAction(action: string, args: any): Promise<ToolResult> {
    const mappedAction = mapToolName(action);
    const mappedArgs = mapToolArgs(action, args);

    log(LogLevel.DEBUG, `액션 실행: ${action} (${mappedAction})`, mappedArgs);

    // 중요한 액션 콘솔에 표시
    console.log(`액션 실행: ${action} (${mappedAction})`);

    // 도구가 존재하는지 확인
    if (!this.toolCache[mappedAction]) {
      const errorMsg = `도구 "${mappedAction}"가 사용 가능한 도구에 없습니다.`;
      log(LogLevel.ERROR, errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // MCP 클라이언트 호출
      console.log(mappedAction);
      const result = await this.client.callTool({
        name: mappedAction,
        arguments: mappedArgs,
      });

      // 디버그 정보 로깅 - 중요 액션은 INFO 레벨로 로깅
      if (action === 'pageSnapshot') {
        log(LogLevel.INFO, `스냅샷 응답 (${mappedAction}):`, result);
        // 콘솔에 스냅샷 결과 표시
        console.log(`스냅샷 결과:`, result);
      } else {
        log(LogLevel.DEBUG, `도구 응답 (${mappedAction}):`, result);
      }

      // 결과가 오류인 경우 예외 발생
      if (result.isError) {
        const errorMsg = `도구 "${mappedAction}" 실행 실패: ${JSON.stringify(
          result
        )}`;
        log(LogLevel.ERROR, errorMsg);
        throw new Error(errorMsg);
      }

      // 액션 완료 메시지
      console.log(`액션 ${action} 완료`);

      // 결과 변환 및 반환
      const transformedResult = transformResult(action, result);
      return transformedResult;
    } catch (error) {
  const errMsg =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : JSON.stringify(error);

  const maybeModal =
    errMsg.includes('does not handle the modal state') ||
    errMsg.includes('can be handled by the "browser_handle_dialog" tool');

if (maybeModal) {
  console.warn('⚠️ Modal dialog 감지됨. 자동 처리 시도...');
  try {
    await this.handleDialog();
    console.log('✅ 대화 상자 자동 수락 후 재시도 중...');

    // ⚠️ ref 제거 (stale 참조 방지)
    const retryArgs = { ...mappedArgs };
    if ('ref' in retryArgs) {
      delete retryArgs.ref;
    }

    const retryResult = await this.client.callTool({
      name: mappedAction,
      arguments: retryArgs,
    });

    if (retryResult.isError) {
      throw new Error(`Retry failed: ${JSON.stringify(retryResult)}`);
    }

    return transformResult(action, retryResult);

  } catch (dialogErr) {
    console.error('❌ 대화 상자 처리 실패 또는 재시도 실패:', dialogErr);
    throw dialogErr;
  }
}

  log(LogLevel.ERROR, `액션 실행 오류 ${action} (${mappedAction}):`, error);
  console.error(
    `액션 ${action} 실행 오류:`,
    error instanceof Error ? error.message : error
  );
  throw error;
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
