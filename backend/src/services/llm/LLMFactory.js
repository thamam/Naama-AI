import AnthropicProvider from './AnthropicProvider.js';
import LocalHebrewProvider from './LocalHebrewProvider.js';
import config from '../../config/index.js';
import logger from '../../config/logger.js';

/**
 * Factory to create LLM provider instances with intelligent routing
 *
 * Phase 2 Enhancement: Hybrid Architecture
 * - Hebrew requests → Local Hebrew LLM (DictaLM 2.0)
 * - Non-Hebrew/complex requests → Claude API
 * - Automatic failover for resilience
 */
class LLMFactory {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = 'anthropic';
    this.hebrewProvider = 'local_hebrew';
    this.enableHebrewRouting = config.localHebrewLLM?.enabled || false;
    this.hebrewProviderAvailable = false;

    // Initialize health check if Hebrew routing enabled
    if (this.enableHebrewRouting) {
      this._checkHebrewProviderHealth();
      // Periodic health check every 5 minutes
      setInterval(() => this._checkHebrewProviderHealth(), 300000);
    }
  }

  /**
   * Check if local Hebrew provider is available
   */
  async _checkHebrewProviderHealth() {
    try {
      const provider = this.getProvider(this.hebrewProvider);
      const health = await provider.healthCheck();
      this.hebrewProviderAvailable = health.available;

      if (health.available) {
        logger.info('Local Hebrew LLM is available', {
          responseTime: health.responseTime,
          model: health.model
        });
      } else {
        logger.warn('Local Hebrew LLM is unavailable, will use fallback', {
          error: health.error
        });
      }
    } catch (error) {
      logger.warn('Failed to check Hebrew provider health', { error: error.message });
      this.hebrewProviderAvailable = false;
    }
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
          apiKey: config.claude.apiKey,
          model: config.claude.model,
          maxTokens: config.claude.maxTokens
        });
        break;

      case 'local_hebrew':
        if (!config.localHebrewLLM) {
          throw new Error('Local Hebrew LLM is not configured');
        }
        provider = new LocalHebrewProvider({
          endpoint: config.localHebrewLLM.endpoint,
          model: config.localHebrewLLM.model,
          backend: config.localHebrewLLM.backend,
          maxTokens: config.localHebrewLLM.maxTokens,
          temperature: config.localHebrewLLM.temperature,
          timeout: config.localHebrewLLM.timeout
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
   * Intelligently route request to appropriate provider
   * Phase 2: Hebrew requests go to local model, others to Claude
   *
   * @param {Object} params - Request parameters
   * @returns {string} - Provider name to use
   */
  routeRequest(params) {
    // If Hebrew routing is disabled, use default
    if (!this.enableHebrewRouting) {
      logger.debug('Hebrew routing disabled, using default provider');
      return this.defaultProvider;
    }

    // Check if this is a Hebrew request
    const isHebrew = params.language === 'he' || params.language === 'hebrew';

    // Route to local Hebrew model if:
    // 1. Request is in Hebrew
    // 2. Local provider is available
    // 3. Activity type is supported by local model
    if (isHebrew && this.hebrewProviderAvailable) {
      const supportedTypes = ['picture_matching', 'sequencing', 'articulation', 'rhyming', 'morphological'];

      if (!params.activityType || supportedTypes.includes(params.activityType)) {
        logger.info('Routing Hebrew request to local LLM', {
          activityType: params.activityType,
          ageGroup: params.ageGroup
        });
        return this.hebrewProvider;
      }
    }

    // Fallback to default provider (Claude)
    if (isHebrew && !this.hebrewProviderAvailable) {
      logger.warn('Hebrew request but local provider unavailable, using fallback', {
        activityType: params.activityType
      });
    }

    return this.defaultProvider;
  }

  /**
   * Generate activity with automatic failover
   * Tries primary provider, falls back to secondary if failed
   *
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generated content
   */
  async generateWithFailover(params) {
    const primaryProvider = this.routeRequest(params);
    const fallbackProvider = this.defaultProvider;

    try {
      // Try primary provider
      const provider = this.getProvider(primaryProvider);
      logger.info(`Attempting generation with ${primaryProvider}`);

      return await provider.generate(params);

    } catch (error) {
      logger.error(`Primary provider ${primaryProvider} failed:`, error.message);

      // If primary was already the fallback, re-throw
      if (primaryProvider === fallbackProvider) {
        throw error;
      }

      // Try fallback provider
      logger.info(`Falling back to ${fallbackProvider}`);

      try {
        const provider = this.getProvider(fallbackProvider);
        const result = await provider.generate(params);

        // Add fallback metadata
        result.metadata.fallback = true;
        result.metadata.primaryProvider = primaryProvider;
        result.metadata.primaryError = error.message;

        return result;

      } catch (fallbackError) {
        logger.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError.message);
        throw new Error(`Both primary and fallback providers failed: ${fallbackError.message}`);
      }
    }
  }

  /**
   * Set default provider
   * @param {string} providerName - Name of the provider
   */
  setDefaultProvider(providerName) {
    this.defaultProvider = providerName;
  }

  /**
   * Set Hebrew provider
   * @param {string} providerName - Name of the Hebrew provider
   */
  setHebrewProvider(providerName) {
    this.hebrewProvider = providerName;
  }

  /**
   * Enable or disable Hebrew routing
   * @param {boolean} enabled - Whether to enable Hebrew routing
   */
  setHebrewRouting(enabled) {
    this.enableHebrewRouting = enabled;
    logger.info(`Hebrew routing ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get provider status
   * @returns {Object} Status of all providers
   */
  async getProviderStatus() {
    const status = {
      default: this.defaultProvider,
      hebrewProvider: this.hebrewProvider,
      hebrewRoutingEnabled: this.enableHebrewRouting,
      hebrewProviderAvailable: this.hebrewProviderAvailable,
      providers: {}
    };

    // Check each provider
    for (const [name, provider] of this.providers) {
      if (provider.healthCheck) {
        status.providers[name] = await provider.healthCheck();
      } else {
        status.providers[name] = { available: true, type: 'cloud' };
      }
    }

    return status;
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
