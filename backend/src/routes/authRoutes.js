import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('name').trim().notEmpty().withMessage('Name is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
];

// Public routes (with rate limiting)
router.post('/register', authLimiter, registerValidation, asyncHandler(register));
router.post('/login', authLimiter, loginValidation, asyncHandler(login));

// Protected routes (require authentication)
router.get('/me', authenticate, asyncHandler(getMe));
router.put('/profile', authenticate, asyncHandler(updateProfile));
router.put('/password', authenticate, passwordChangeValidation, asyncHandler(changePassword));

export default router;
