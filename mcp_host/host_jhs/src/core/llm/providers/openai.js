import OpenAI from 'openai';

/**
 * OpenAI GPT 모델 공급자
 */
class OpenAIProvider {
  /**
   * @param {string} apiKey OpenAI API 키
   * @param {string} model 사용할 모델 이름
   */
  constructor(apiKey, model) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
    this.model = model || 'gpt-4-turbo';
  }
  
  /**
   * 텍스트 생성 요청
   * @param {string} prompt 프롬프트
   * @param {Object} options 추가 옵션
   * @returns {Promise<string>} 생성된 텍스트
   */
  async generateText(prompt, options = {}) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.7
    });
    
    return response.choices[0].message.content;
  }
  
  /**
   * 코드 추출 (마크다운 코드 블록에서)
   * @param {string} content 생성된 콘텐츠
   * @returns {string} 추출된 코드
   */
  extractCode(content) {
    let code = content;
    
    // 마크다운 코드 블록 처리
    const codeBlockRegex = /```(?:javascript|js)?\s*([\s\S]*?)\s*```/;
    const match = content.match(codeBlockRegex);
    if (match && match[1]) {
      code = match[1];
    }
    
    return code;
  }
}

export default OpenAIProvider;

// src/core/llm/index.js (두 제공자 클래스를 별도 파일로 분리한 버전)
import AnthropicProvider from './providers/anthropic.js';
import OpenAIProvider from './providers/openai.js';
import { getApiKey } from '../../utils/config.js';

/**
 * LLM 프로바이더 추상화 클래스
 */
class LLMProvider {
  /**
   * LLM 제공자 초기화
   * @param {Object} config 설정 객체
   */
  static async initialize(config) {
    const { llmProvider, llmModel } = config;
    
    if (llmProvider === 'anthropic') {
      const apiKey = await getApiKey('anthropic');
      return new AnthropicProvider(apiKey, llmModel);
    } else if (llmProvider === 'openai') {
      const apiKey = await getApiKey('openai');
      return new OpenAIProvider(apiKey, llmModel);
    } else {
      throw new Error(`지원되지 않는 LLM 제공자: ${llmProvider}`);
    }
  }
}

export {
  LLMProvider,
  AnthropicProvider,
  OpenAIProvider
};