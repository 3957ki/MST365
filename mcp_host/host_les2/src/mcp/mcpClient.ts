import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

export class MCPClient {
  private client: Client;
  private transport: StdioClientTransport | undefined;

  constructor() {
    this.client = new Client(
      {
        name: 'natural-language-testing',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect() {
    console.log('Attempting to connect to MCP server...');
    const npm = process.platform === 'win32' ? 'npx.cmd' : 'npx';

    try {
      // 직접 child process를 생성해서 더 자세한 정보 확인
      const proc = spawn(npm, ['@playwright/mcp@latest'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // stdout과 stderr 이벤트 리스너 추가
      proc.stdout.on('data', (data) => {
        console.log('MCP Server stdout:', data.toString());
      });

      proc.stderr.on('data', (data) => {
        console.error('MCP Server stderr:', data.toString());
      });

      proc.on('error', (error) => {
        console.error('Failed to start MCP server:', error);
      });

      proc.on('close', (code) => {
        console.log(`MCP server process exited with code ${code}`);
      });

      // 프로세스가 시작되기를 잠시 기다림
      await new Promise((resolve) => setTimeout(resolve, 3000));

      this.transport = new StdioClientTransport({
        command: npm,
        args: ['@playwright/mcp@latest'],
      });

      console.log('Connecting to MCP server via transport...');
      await this.client.connect(this.transport);
      console.log('Successfully connected to Playwright MCP server');

      // 연결 후 사용 가능한 도구 목록 확인
      try {
        const tools = await this.client.listTools();
        console.log('Available tools:', tools);
      } catch (error) {
        console.error('Failed to list tools:', error);
      }
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      throw error;
    }
  }

  async executeAction(action: string, args: any) {
    console.log(`Executing action: ${action} with args:`, args);

    try {
      const result = await this.client.callTool({
        name: action,
        arguments: args,
      });

      console.log(`Action ${action} result:`, result);
      return result;
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      // 더 자세한 에러 정보 출력
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  }

  async disconnect() {
    console.log('Disconnecting from MCP server...');
    await this.client.close();
    console.log('Disconnected from MCP server');
  }
}
