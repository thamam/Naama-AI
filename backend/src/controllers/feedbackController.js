import { validationResult } from 'express-validator';
import Feedback from '../models/Feedback.js';
import Activity from '../models/Activity.js';
import logger from '../config/logger.js';

/**
 * Submit feedback for an activity
 * POST /api/feedback
 */
export const submitFeedback = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const {
      activityId,
      rating,
      feedbackType,
      hebrewQualityRating,
      nikudCorrectness,
      therapeuticValue,
      ageAppropriateness,
      clinicalAccuracy,
      comments,
      suggestedEdit,
      issues,
      positiveAspects,
      wouldRecommend
    } = req.body;

    // Verify activity exists and belongs to user
    const activity = await Activity.findOne({
      _id: activityId,
      userId: req.user.id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or unauthorized'
      });
    }

    // Create feedback
    const feedback = new Feedback({
      userId: req.user.id,
      activityId,
      rating,
      feedbackType,
      hebrewQualityRating,
      nikudCorrectness,
      therapeuticValue,
      ageAppropriateness,
      clinicalAccuracy,
      comments,
      suggestedEdit,
      issues,
      positiveAspects,
      wouldRecommend
    });

    await feedback.save();

    logger.info(`Feedback submitted for activity ${activityId} by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      feedback: feedback.toObject()
    });

  } catch (error) {
    logger.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

/**
 * Get feedback for a specific activity
 * GET /api/feedback/activity/:id
 */
export const getActivityFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify activity exists and belongs to user
    const activity = await Activity.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or unauthorized'
      });
    }

    // Get all feedback for this activity
    const feedback = await Feedback.find({ activityId: id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .lean();

    // Calculate aggregate stats for this activity
    const stats = {
      totalFeedback: feedback.length,
      avgRating: feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length || 0,
      avgTherapeuticValue: feedback.reduce((sum, f) => sum + (f.therapeuticValue || 0), 0) / feedback.length || 0
    };

    res.json({
      success: true,
      feedback,
      stats
    });

  } catch (error) {
    logger.error('Error getting activity feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting feedback',
      error: error.message
    });
  }
};

/**
 * Get user's feedback history
 * GET /api/feedback/user
 */
export const getUserFeedback = async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const feedback = await Feedback.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('activityId', 'type title ageGroup language')
      .lean();

    const total = await Feedback.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      feedback,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: (parseInt(skip) + feedback.length) < total
      }
    });

  } catch (error) {
    logger.error('Error getting user feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting feedback',
      error: error.message
    });
  }
};

/**
 * Get aggregate feedback statistics
 * GET /api/feedback/stats
 */
export const getFeedbackStats = async (req, res) => {
  try {
    const { activityType, language, dateFrom, dateTo } = req.query;

    // Build filters
    const filters = { userId: req.user.id };

    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }

    // Get aggregate stats
    const stats = await Feedback.getAggregateStats(filters);

    // Get stats by activity type
    const statsByType = await Feedback.aggregate([
      { $match: filters },
      {
        $lookup: {
          from: 'activities',
          localField: 'activityId',
          foreignField: '_id',
          as: 'activity'
        }
      },
      { $unwind: '$activity' },
      {
        $group: {
          _id: '$activity.type',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          avgTherapeuticValue: { $avg: '$therapeuticValue' }
        }
      }
    ]);

    // Feedback type distribution
    const feedbackTypeDistribution = await Feedback.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$feedbackType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        overall: stats,
        byActivityType: statsByType,
        feedbackTypeDistribution
      }
    });

  } catch (error) {
    logger.error('Error getting feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting statistics',
      error: error.message
    });
  }
};

/**
 * Update feedback (user can update their own feedback)
 * PATCH /api/feedback/:id
 */
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found or unauthorized'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'rating',
      'hebrewQualityRating',
      'nikudCorrectness',
      'therapeuticValue',
      'ageAppropriateness',
      'clinicalAccuracy',
      'comments',
      'suggestedEdit',
      'issues',
      'positiveAspects',
      'wouldRecommend'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        feedback[field] = req.body[field];
      }
    });

    await feedback.save();

    logger.info(`Feedback ${id} updated by user ${req.user.id}`);

    res.json({
      success: true,
      feedback: feedback.toObject()
    });

  } catch (error) {
    logger.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message
    });
  }
};

/**
 * Delete feedback
 * DELETE /api/feedback/:id
 */
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Feedback.deleteOne({
      _id: id,
      userId: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found or unauthorized'
      });
    }

    logger.info(`Feedback ${id} deleted by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
};
