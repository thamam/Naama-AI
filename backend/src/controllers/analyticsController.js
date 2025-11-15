import analytics from '../services/analytics.js';
import logger from '../config/logger.js';

/**
 * Get comprehensive analytics summary
 * GET /api/analytics/summary
 */
export const getAnalyticsSummary = async (req, res) => {
  try {
    const { dateFrom, dateTo, type, language } = req.query;

    const filters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (type) filters.type = type;
    if (language) filters.language = language;

    const summary = await analytics.getSummary(req.user.id, filters);

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Error getting analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting analytics',
      error: error.message
    });
  }
};

/**
 * Get activity generation metrics
 * GET /api/analytics/activities
 */
export const getActivityMetrics = async (req, res) => {
  try {
    const { dateFrom, dateTo, type, language } = req.query;

    const filters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (type) filters.type = type;
    if (language) filters.language = language;

    const metrics = await analytics.getActivityMetrics(req.user.id, filters);

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Error getting activity metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting metrics',
      error: error.message
    });
  }
};

/**
 * Get cost analysis
 * GET /api/analytics/costs
 */
export const getCostAnalysis = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const filters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const costs = await analytics.getCostAnalysis(req.user.id, filters);

    res.json({
      success: true,
      data: costs
    });

  } catch (error) {
    logger.error('Error getting cost analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cost analysis',
      error: error.message
    });
  }
};

/**
 * Get quality metrics
 * GET /api/analytics/quality
 */
export const getQualityMetrics = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const filters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const quality = await analytics.getQualityMetrics(req.user.id, filters);

    res.json({
      success: true,
      data: quality
    });

  } catch (error) {
    logger.error('Error getting quality metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting quality metrics',
      error: error.message
    });
  }
};

/**
 * Get Hebrew-specific metrics
 * GET /api/analytics/hebrew
 */
export const getHebrewMetrics = async (req, res) => {
  try {
    const metrics = await analytics.getHebrewMetrics(req.user.id);

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    logger.error('Error getting Hebrew metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting Hebrew metrics',
      error: error.message
    });
  }
};
