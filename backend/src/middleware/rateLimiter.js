import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import logger from '../config/logger.js';

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later'
    });
  }
});

/**
 * Stricter rate limiter for LLM generation endpoints
 * (to control API costs)
 */
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many generation requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per user if authenticated, otherwise by IP
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    logger.warn(`Generation rate limit exceeded for user: ${req.user?.id || req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many generation requests. Please wait before generating more activities.'
    });
  }
});

/**
 * Rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again in 15 minutes.'
    });
  }
});

export default {
  generalLimiter,
  generationLimiter,
  authLimiter
};
