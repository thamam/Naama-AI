import express from 'express';
import { body, query, param } from 'express-validator';
import {
  generateActivity,
  getActivities,
  getActivityById,
  deleteActivity,
  getStatistics
} from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import { generationLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const generateValidation = [
  body('activityType')
    .isIn(['picture_matching', 'sequencing', 'articulation'])
    .withMessage('Invalid activity type'),
  body('ageGroup')
    .isIn(['2-3', '3-4', '4-6'])
    .withMessage('Invalid age group'),
  body('language')
    .optional()
    .isIn(['en', 'he'])
    .withMessage('Language must be either "en" or "he"'),
  body('targetSound')
    .if(body('activityType').equals('articulation'))
    .notEmpty()
    .withMessage('Target sound is required for articulation activities'),
  body('itemCount')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Item count must be between 1 and 20')
];

const listValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  query('type')
    .optional()
    .isIn(['picture_matching', 'sequencing', 'articulation'])
    .withMessage('Invalid activity type'),
  query('ageGroup')
    .optional()
    .isIn(['2-3', '3-4', '4-6'])
    .withMessage('Invalid age group')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid activity ID')
];

// Routes
router.post(
  '/generate',
  generationLimiter,
  generateValidation,
  asyncHandler(generateActivity)
);

router.get(
  '/',
  listValidation,
  asyncHandler(getActivities)
);

router.get(
  '/stats',
  asyncHandler(getStatistics)
);

router.get(
  '/:id',
  idValidation,
  asyncHandler(getActivityById)
);

router.delete(
  '/:id',
  idValidation,
  asyncHandler(deleteActivity)
);

export default router;
