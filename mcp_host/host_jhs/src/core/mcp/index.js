// src/core/mcp/index.js
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../utils/logger.js';

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MCPClient {
  constructor(config = {}) {
    this.config = {
      apiKey: process.env.LLM_API_KEY || config.apiKey,
      apiEndpoint: config.apiEndpoint || 'https://api.anthropic.com/v1/messages',
      model: config.model || 'claude-3-opus-20240229',
      temperature: config.temperature || 0.2,
      maxTokens: config.maxTokens || 4000,
      promptsDir: config.promptsDir || path.join(process.cwd(), 'templates', 'prompts'),
      ...config
    };
    
    if (!this.config.apiKey) {
      throw new Error('API 키가 설정되지 않았습니다. 환경 변수나 설정에서 확인하세요.');
    }
  }
  
  // 프롬프트 템플릿 로드 및 형식화
  async loadPrompt(templateName, locale = 'en') {
    const promptPath = path.join(this.config.promptsDir, `${templateName}.${locale}.md`);
    
    try {
      const content = await fs.readFile(promptPath, 'utf8');
      return content;
    } catch (error) {
      logger.warn(`템플릿 ${templateName} 로드 실패: ${error.message}`);
      
      // 기본 언어로 폴백
      if (locale !== 'en') {
        logger.info(`기본 언어(en)로 대체합니다.`);
        return this.loadPrompt(templateName, 'en');
      }
      
      throw new Error(`프롬프트 템플릿 ${templateName}을 찾을 수 없습니다.`);
    }
  }
  
  // 템플릿 형식화
  formatPrompt(template, data) {
    return Object.entries(data).reduce((prompt, [key, value]) => {
      return prompt.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
    }, template);
  }
  
  // LLM API 호출
  async query(prompt) {
    try {
      const response = await axios.post(
        this.config.apiEndpoint,
        {
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      return response.data.content[0].text;
    } catch (error) {
      logger.error(`LLM API 호출 실패: ${error.message}`);
      throw error;
    }
  }
  
  // 테스트 결과 분석
  async analyzeTestResult(testResult, locale = 'en') {
    try {
      const template = await this.loadPrompt('analysis', locale);
      const formattedPrompt = this.formatPrompt(template, {
        testResult: JSON.stringify(testResult, null, 2),
        timestamp: new Date().toISOString(),
        browserInfo: testResult.browserName || 'chromium'
      });
      
      const analysis = await this.query(formattedPrompt);
      return {
        timestamp: new Date().toISOString(),
        result: analysis
      };
    } catch (error) {
      logger.error(`테스트 결과 분석 실패: ${error.message}`);
      return {
        timestamp: new Date().toISOString(),
        error: error.message,
        result: '분석 실패: API 오류가 발생했습니다.'
      };
    }
  }
  
  // 선택자 문제 수정 제안
  async fixSelectors(failedSelectors, html) {
    try {
      const template = await this.loadPrompt('selector_fix', 'en');
      const formattedPrompt = this.formatPrompt(template, {
        failedSelectors: JSON.stringify(failedSelectors, null, 2),
        html: html || '제공된 HTML 없음'
      });
      
      const suggestions = await this.query(formattedPrompt);
      
      // 응답에서 JSON 추출 시도
      try {
        return JSON.parse(suggestions);
      } catch (parseError) {
        logger.warn(`JSON 파싱 실패: ${parseError.message}`);
        return { 
          raw: suggestions,
          error: 'JSON 형식이 아닙니다.'
        };
      }
    } catch (error) {
      logger.error(`선택자 수정 제안 실패: ${error.message}`);
      return { error: error.message };
    }
  }
  
  // 테스트 결과 저장 및 보고서 생성
  async saveAnalysis(testId, analysis) {
    const resultDir = path.join(process.cwd(), 'test-results', `test_${testId}`);
    
    try {
      await fs.mkdir(resultDir, { recursive: true });
      
      // 마크다운 보고서에 분석 결과 추가
      const reportPath = path.join(resultDir, 'report.md');
      let report = '';
      
      try {
        report = await fs.readFile(reportPath, 'utf8');
      } catch (error) {
        logger.warn(`기존 보고서를 읽을 수 없습니다: ${error.message}`);
      }
      
      // 분석 결과 추가
      report += '\n\n## 분석 결과\n' + analysis.result;
      
      await fs.writeFile(reportPath, report, 'utf8');
      logger.info(`분석 결과가 보고서에 저장되었습니다: ${reportPath}`);
      
      return { success: true, path: reportPath };
    } catch (error) {
      logger.error(`분석 결과 저장 실패: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

export default MCPClient;