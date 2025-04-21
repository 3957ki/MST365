import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic Claude 모델 공급자
 */
class AnthropicProvider {
  /**
   * @param {string} apiKey Anthropic API 키
   * @param {string} model 사용할 모델 이름
   */
  constructor(apiKey, model) {
    this.client = new Anthropic({
      apiKey: apiKey,
    });
    this.model = model || 'claude-3-7-sonnet-20250219';
  }
  
  /**
   * 텍스트 생성 요청
   * @param {string} prompt 프롬프트
   * @param {Object} options 추가 옵션
   * @returns {Promise<string>} 생성된 텍스트
   */
  async generateText(prompt, options = {}) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens || 4000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    return response.content[0].text;
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

export default AnthropicProvider;