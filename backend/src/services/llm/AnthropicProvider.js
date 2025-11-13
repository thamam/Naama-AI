import Anthropic from '@anthropic-ai/sdk';
import BaseLLMProvider from './BaseLLMProvider.js';
import logger from '../../config/logger.js';

/**
 * Anthropic Claude API Provider
 */
class AnthropicProvider extends BaseLLMProvider {
  constructor(config) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: config.apiKey,
    });

    this.model = config.model || 'claude-3-5-haiku-20241022';
    this.maxTokens = config.maxTokens || 2048;
  }

  /**
   * Generate content using Claude API
   */
  async generate({ prompt, options = {} }) {
    try {
      const startTime = Date.now();

      logger.info('Sending request to Anthropic Claude API');

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || 1.0,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const generationTime = Date.now() - startTime;

      logger.info(`Claude API response received in ${generationTime}ms`);

      if (!this.validateResponse(response)) {
        throw new Error('Invalid response from Claude API');
      }

      return this.parseResponse(response, generationTime);

    } catch (error) {
      logger.error('Anthropic API error:', error);

      if (error.status === 429) {
        throw new Error('Rate limit exceeded for Anthropic API');
      }

      if (error.status === 401) {
        throw new Error('Invalid Anthropic API key');
      }

      if (error.status === 400) {
        throw new Error('Invalid request to Anthropic API');
      }

      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  /**
   * Validate Claude API response
   */
  validateResponse(response) {
    if (!response || !response.content || response.content.length === 0) {
      logger.error('Invalid response structure from Claude API');
      return false;
    }

    if (response.stop_reason !== 'end_turn' && response.stop_reason !== 'max_tokens') {
      logger.warn(`Unexpected stop_reason: ${response.stop_reason}`);
    }

    return true;
  }

  /**
   * Parse Claude API response into structured format
   */
  parseResponse(response, generationTime) {
    try {
      // Extract text content
      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');

      // Try to parse as JSON if the content looks like JSON
      let parsedContent;
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (e) {
          logger.warn('Failed to parse JSON from response, using raw text');
          parsedContent = { rawText: textContent };
        }
      } else {
        parsedContent = { rawText: textContent };
      }

      return {
        content: parsedContent,
        metadata: {
          provider: this.getProviderName(),
          model: this.getModelName(),
          tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0,
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
          generationTime,
          stopReason: response.stop_reason
        }
      };
    } catch (error) {
      logger.error('Error parsing Claude response:', error);
      throw new Error('Failed to parse LLM response');
    }
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return 'anthropic';
  }

  /**
   * Get model name
   */
  getModelName() {
    return this.model;
  }
}

export default AnthropicProvider;
