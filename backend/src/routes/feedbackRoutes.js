import express from 'express';
import { body, param, query } from 'express-validator';
import {
  submitFeedback,
  getActivityFeedback,
  getUserFeedback,
  getFeedbackStats,
  updateFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const submitValidation = [
  body('activityId')
    .isMongoId()
    .withMessage('Valid activity ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedbackType')
    .isIn(['quality', 'accuracy', 'usability', 'bug', 'feature_request', 'other'])
    .withMessage('Invalid feedback type'),
  body('therapeuticValue')
    .isInt({ min: 1, max: 5 })
    .withMessage('Therapeutic value must be between 1 and 5'),
  body('hebrewQualityRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Hebrew quality rating must be between 1 and 5'),
  body('nikudCorrectness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Nikud correctness must be between 1 and 5'),
  body('ageAppropriateness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Age appropriateness must be between 1 and 5'),
  body('clinicalAccuracy')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Clinical accuracy must be between 1 and 5'),
  body('comments')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Comments must be a string with max 2000 characters'),
  body('suggestedEdit')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Suggested edit must be a string with max 1000 characters'),
  body('wouldRecommend')
    .optional()
    .isBoolean()
    .withMessage('Would recommend must be a boolean')
];

const updateValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid feedback ID is required'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('therapeuticValue')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Therapeutic value must be between 1 and 5'),
  body('hebrewQualityRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Hebrew quality rating must be between 1 and 5'),
  body('nikudCorrectness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Nikud correctness must be between 1 and 5')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid ID is required')
];

const statsValidation = [
  query('activityType')
    .optional()
    .isString()
    .withMessage('Activity type must be a string'),
  query('language')
    .optional()
    .isIn(['en', 'he'])
    .withMessage('Language must be either "en" or "he"'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date')
];

// Routes
router.post(
  '/',
  submitValidation,
  asyncHandler(submitFeedback)
);

router.get(
  '/activity/:id',
  idValidation,
  asyncHandler(getActivityFeedback)
);

router.get(
  '/user',
  asyncHandler(getUserFeedback)
);

router.get(
  '/stats',
  statsValidation,
  asyncHandler(getFeedbackStats)
);

router.patch(
  '/:id',
  updateValidation,
  asyncHandler(updateFeedback)
);

router.delete(
  '/:id',
  idValidation,
  asyncHandler(deleteFeedback)
);

export default router;
