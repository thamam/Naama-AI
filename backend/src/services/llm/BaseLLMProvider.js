/**
 * Base class for LLM providers
 * This abstraction allows easy switching between different LLM providers
 */
class BaseLLMProvider {
  constructor(config) {
    this.config = config;
  }

  /**
   * Generate activity content based on prompt
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - The prompt to send to the LLM
   * @param {Object} params.options - Additional options (temperature, max_tokens, etc.)
   * @returns {Promise<Object>} - Generated content with metadata
   */
  async generate(params) {
    throw new Error('generate() must be implemented by subclass');
  }

  /**
   * Validate the response from LLM
   * @param {Object} response - Raw response from LLM
   * @returns {boolean} - Whether response is valid
   */
  validateResponse(response) {
    throw new Error('validateResponse() must be implemented by subclass');
  }

  /**
   * Parse the response into structured format
   * @param {Object} response - Raw response from LLM
   * @returns {Object} - Parsed and structured response
   */
  parseResponse(response) {
    throw new Error('parseResponse() must be implemented by subclass');
  }

  /**
   * Get provider name
   * @returns {string} - Provider name
   */
  getProviderName() {
    throw new Error('getProviderName() must be implemented by subclass');
  }

  /**
   * Get model name
   * @returns {string} - Model name
   */
  getModelName() {
    throw new Error('getModelName() must be implemented by subclass');
  }
}

export default BaseLLMProvider;
