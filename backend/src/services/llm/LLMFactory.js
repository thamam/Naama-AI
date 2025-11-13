import AnthropicProvider from './AnthropicProvider.js';
import config from '../../config/index.js';
import logger from '../../config/logger.js';

/**
 * Factory to create LLM provider instances
 */
class LLMFactory {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = 'anthropic';
  }

  /**
   * Get LLM provider instance
   * @param {string} providerName - Name of the provider (default: 'anthropic')
   * @returns {BaseLLMProvider} - LLM provider instance
   */
  getProvider(providerName = this.defaultProvider) {
    // Return cached provider if exists
    if (this.providers.has(providerName)) {
      return this.providers.get(providerName);
    }

    // Create new provider instance
    let provider;

    switch (providerName.toLowerCase()) {
      case 'anthropic':
        provider = new AnthropicProvider({
          apiKey: config.anthropic.apiKey,
          model: config.anthropic.model,
          maxTokens: config.anthropic.maxTokens
        });
        break;

      // Add more providers here in the future:
      // case 'openai':
      //   provider = new OpenAIProvider(config.openai);
      //   break;
      // case 'cohere':
      //   provider = new CohereProvider(config.cohere);
      //   break;

      default:
        logger.error(`Unsupported LLM provider: ${providerName}`);
        throw new Error(`Unsupported LLM provider: ${providerName}`);
    }

    // Cache provider instance
    this.providers.set(providerName, provider);
    logger.info(`LLM provider '${providerName}' initialized`);

    return provider;
  }

  /**
   * Set default provider
   * @param {string} providerName - Name of the provider
   */
  setDefaultProvider(providerName) {
    this.defaultProvider = providerName;
  }

  /**
   * Clear provider cache
   */
  clearCache() {
    this.providers.clear();
    logger.info('LLM provider cache cleared');
  }
}

// Export singleton instance
const llmFactory = new LLMFactory();
export default llmFactory;
