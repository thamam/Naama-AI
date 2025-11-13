import activityGenerator from '../services/activityGenerator.js';
import { ApiError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

/**
 * Generate new activity
 * POST /api/activities/generate
 */
export const generateActivity = async (req, res, next) => {
  try {
    const {
      activityType,
      ageGroup,
      targetSound,
      theme,
      language,
      soundPosition,
      itemCount,
      description,
      customization
    } = req.body;

    const params = {
      activityType,
      ageGroup,
      targetSound,
      theme,
      language: language || 'en',
      soundPosition,
      itemCount,
      description,
      customization
    };

    const result = await activityGenerator.generateActivity(params, req.user);

    // Update user's API usage
    req.user.apiUsage.requestCount += 1;
    req.user.apiUsage.lastRequestAt = new Date();
    await req.user.save();

    res.json({
      success: true,
      message: 'Activity generated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's activity history
 * GET /api/activities
 */
export const getActivities = async (req, res, next) => {
  try {
    const {
      limit = 20,
      skip = 0,
      type,
      ageGroup
    } = req.query;

    const activities = await activityGenerator.getUserActivities(req.user.id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      type,
      ageGroup
    });

    res.json({
      success: true,
      data: {
        activities,
        count: activities.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single activity by ID
 * GET /api/activities/:id
 */
export const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const activity = await activityGenerator.getActivityById(id, req.user.id);

    res.json({
      success: true,
      data: {
        activity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete activity
 * DELETE /api/activities/:id
 */
export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    await activityGenerator.deleteActivity(id, req.user.id);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get activity statistics
 * GET /api/activities/stats
 */
export const getStatistics = async (req, res, next) => {
  try {
    const Activity = (await import('../models/Activity.js')).default;

    const stats = await Activity.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          avgTokens: { $avg: '$llmTokensUsed' }
        }
      }
    ]);

    const totalActivities = await Activity.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        totalActivities,
        byType: stats,
        apiUsage: {
          totalRequests: req.user.apiUsage.requestCount,
          lastRequest: req.user.apiUsage.lastRequestAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
