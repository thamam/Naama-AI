import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/naama-ai',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Anthropic Claude API
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '2048', 10),
  },

  // Local Hebrew LLM (Phase 2)
  // DictaLM 2.0 or other Hebrew-focused models
  localHebrewLLM: {
    enabled: process.env.LOCAL_HEBREW_LLM_ENABLED === 'true',
    endpoint: process.env.LOCAL_HEBREW_LLM_ENDPOINT || 'http://localhost:11434', // Ollama default
    model: process.env.LOCAL_HEBREW_LLM_MODEL || 'dicta-il/dictalm2.0-instruct',
    backend: process.env.LOCAL_HEBREW_LLM_BACKEND || 'ollama', // ollama, lmstudio, vllm, openai-compatible
    maxTokens: parseInt(process.env.LOCAL_HEBREW_LLM_MAX_TOKENS || '2048', 10),
    temperature: parseFloat(process.env.LOCAL_HEBREW_LLM_TEMPERATURE || '0.7'),
    timeout: parseInt(process.env.LOCAL_HEBREW_LLM_TIMEOUT || '120000', 10), // 2 minutes
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Validation
  validate() {
    const required = ['ANTHROPIC_API_KEY', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (this.env === 'production' && this.jwtSecret === 'default-secret-change-me') {
      throw new Error('JWT_SECRET must be set in production');
    }
  }
};

export default config;
