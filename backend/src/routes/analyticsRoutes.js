import express from 'express';
import { query } from 'express-validator';
import {
  getAnalyticsSummary,
  getActivityMetrics,
  getCostAnalysis,
  getQualityMetrics,
  getHebrewMetrics
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware for date filters
const dateFilterValidation = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date'),
  query('type')
    .optional()
    .isString()
    .withMessage('Type must be a string'),
  query('language')
    .optional()
    .isIn(['en', 'he'])
    .withMessage('Language must be either "en" or "he"')
];

// Routes
router.get(
  '/summary',
  dateFilterValidation,
  asyncHandler(getAnalyticsSummary)
);

router.get(
  '/activities',
  dateFilterValidation,
  asyncHandler(getActivityMetrics)
);

router.get(
  '/costs',
  dateFilterValidation,
  asyncHandler(getCostAnalysis)
);

router.get(
  '/quality',
  dateFilterValidation,
  asyncHandler(getQualityMetrics)
);

router.get(
  '/hebrew',
  asyncHandler(getHebrewMetrics)
);

export default router;
