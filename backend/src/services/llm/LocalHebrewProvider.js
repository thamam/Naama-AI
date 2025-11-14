import BaseLLMProvider from './BaseLLMProvider.js';
import logger from '../../config/logger.js';

/**
 * Local Hebrew LLM Provider
 *
 * Supports local Hebrew language models via:
 * - Ollama (recommended for DictaLM 2.0)
 * - LM Studio
 * - vLLM server
 * - Any OpenAI-compatible API endpoint
 *
 * Optimized for DictaLM 2.0-Instruct - a Hebrew-focused model
 * trained for Israeli Hebrew with strong performance on clinical/therapeutic content
 */
class LocalHebrewProvider extends BaseLLMProvider {
  constructor(config) {
    super(config);

    // Validate configuration
    if (!config.endpoint) {
      throw new Error('Local LLM endpoint is required');
    }

    this.endpoint = config.endpoint;
    this.model = config.model || 'dicta-il/dictalm2.0-instruct';
    this.maxTokens = config.maxTokens || 2048;
    this.temperature = config.temperature || 0.7;
    this.backend = config.backend || 'ollama'; // ollama, lmstudio, vllm, openai-compatible

    // Timeout configuration (local inference can be slower on CPU)
    this.timeout = config.timeout || 120000; // 2 minutes default

    logger.info(`LocalHebrewProvider initialized with backend: ${this.backend}, model: ${this.model}`);
  }

  /**
   * Generate content using local Hebrew LLM
   */
  async generate({ prompt, options = {} }) {
    try {
      const startTime = Date.now();

      logger.info(`Sending request to local Hebrew LLM (${this.backend})`);

      // Call appropriate backend
      let response;
      switch (this.backend) {
        case 'ollama':
          response = await this._generateOllama(prompt, options);
          break;
        case 'lmstudio':
          response = await this._generateLMStudio(prompt, options);
          break;
        case 'vllm':
        case 'openai-compatible':
          response = await this._generateOpenAICompatible(prompt, options);
          break;
        default:
          throw new Error(`Unsupported backend: ${this.backend}`);
      }

      const generationTime = Date.now() - startTime;

      logger.info(`Local Hebrew LLM response received in ${generationTime}ms`);

      if (!this.validateResponse(response)) {
        throw new Error('Invalid response from local Hebrew LLM');
      }

      return this.parseResponse(response, generationTime);

    } catch (error) {
      logger.error('Local Hebrew LLM error:', error);

      // Check if service is unavailable
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error(`Local Hebrew LLM service unavailable at ${this.endpoint}`);
      }

      // Check for timeout
      if (error.code === 'ETIMEDOUT' || error.name === 'AbortError') {
        throw new Error('Local Hebrew LLM request timed out');
      }

      throw new Error(`Local Hebrew LLM error: ${error.message}`);
    }
  }

  /**
   * Generate using Ollama API
   * https://github.com/ollama/ollama/blob/main/docs/api.md
   */
  async _generateOllama(prompt, options) {
    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || this.temperature,
          num_predict: options.maxTokens || this.maxTokens,
        }
      }),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Generate using LM Studio API (OpenAI-compatible)
   */
  async _generateLMStudio(prompt, options) {
    return await this._generateOpenAICompatible(prompt, options);
  }

  /**
   * Generate using OpenAI-compatible API
   * Works with vLLM, LM Studio, and other OpenAI-compatible servers
   */
  async _generateOpenAICompatible(prompt, options) {
    const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || this.temperature,
        max_tokens: options.maxTokens || this.maxTokens,
      }),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI-compatible API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Validate local LLM response
   */
  validateResponse(response) {
    // Ollama format
    if (response.response !== undefined) {
      if (!response.response || response.response.length === 0) {
        logger.error('Empty response from Ollama');
        return false;
      }
      return true;
    }

    // OpenAI-compatible format
    if (response.choices !== undefined) {
      if (!response.choices || response.choices.length === 0) {
        logger.error('Empty choices array from OpenAI-compatible API');
        return false;
      }

      if (!response.choices[0].message || !response.choices[0].message.content) {
        logger.error('Invalid message structure from OpenAI-compatible API');
        return false;
      }

      return true;
    }

    logger.error('Unknown response format from local LLM');
    return false;
  }

  /**
   * Parse local LLM response into structured format
   */
  parseResponse(response, generationTime) {
    try {
      let textContent;
      let tokensUsed = 0;

      // Parse based on response format
      if (response.response !== undefined) {
        // Ollama format
        textContent = response.response;
        tokensUsed = (response.prompt_eval_count || 0) + (response.eval_count || 0);
      } else if (response.choices !== undefined) {
        // OpenAI-compatible format
        textContent = response.choices[0].message.content;
        tokensUsed = response.usage?.total_tokens || 0;
      } else {
        throw new Error('Unknown response format');
      }

      // Try to parse as JSON if the content looks like JSON
      let parsedContent;
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (e) {
          logger.warn('Failed to parse JSON from local LLM response, using raw text');
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
          tokensUsed: tokensUsed,
          generationTime,
          backend: this.backend,
          local: true
        }
      };
    } catch (error) {
      logger.error('Error parsing local LLM response:', error);
      throw new Error('Failed to parse local LLM response');
    }
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return `local_hebrew_${this.backend}`;
  }

  /**
   * Get model name
   */
  getModelName() {
    return this.model;
  }

  /**
   * Health check for local LLM service
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const startTime = Date.now();

      let response;
      if (this.backend === 'ollama') {
        response = await fetch(`${this.endpoint}/api/tags`, {
          signal: AbortSignal.timeout(5000)
        });
      } else {
        response = await fetch(`${this.endpoint}/v1/models`, {
          signal: AbortSignal.timeout(5000)
        });
      }

      const responseTime = Date.now() - startTime;

      return {
        available: response.ok,
        responseTime,
        endpoint: this.endpoint,
        backend: this.backend,
        model: this.model
      };
    } catch (error) {
      logger.error('Local LLM health check failed:', error);
      return {
        available: false,
        error: error.message,
        endpoint: this.endpoint,
        backend: this.backend
      };
    }
  }

  /**
   * Estimate token count (approximate for Hebrew)
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    // Hebrew words are typically 1.5-2 tokens per word
    // This is an approximation
    const words = text.split(/\s+/).length;
    return Math.ceil(words * 1.75);
  }
}

export default LocalHebrewProvider;
