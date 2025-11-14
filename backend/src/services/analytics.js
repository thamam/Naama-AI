import Activity from '../models/Activity.js';
import Feedback from '../models/Feedback.js';
import llmFactory from './llm/LLMFactory.js';
import logger from '../config/logger.js';

/**
 * Analytics Service
 * Phase 3: Usage analytics and monitoring
 */
class Analytics {
  /**
   * Get activity generation metrics
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (dateFrom, dateTo, type, language)
   * @returns {Promise<Object>} - Analytics data
   */
  async getActivityMetrics(userId, filters = {}) {
    try {
      const query = { userId };

      // Apply date range filter
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }

      // Apply type filter
      if (filters.type) {
        query.type = filters.type;
      }

      // Apply language filter
      if (filters.language) {
        query.language = filters.language;
      }

      // Total activities
      const totalActivities = await Activity.countDocuments(query);

      // Activities by type
      const byType = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Activities by language
      const byLanguage = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$language',
            count: { $sum: 1 }
          }
        }
      ]);

      // Activities by age group
      const byAgeGroup = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$ageGroup',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // LLM provider usage
      const byProvider = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$llmProvider',
            count: { $sum: 1 },
            avgTokens: { $avg: '$llmTokensUsed' },
            totalTokens: { $sum: '$llmTokensUsed' },
            avgGenerationTime: { $avg: '$generationTime' }
          }
        }
      ]);

      // Usage over time (by day)
      const overTime = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        total: totalActivities,
        byType,
        byLanguage,
        byAgeGroup,
        byProvider,
        overTime
      };

    } catch (error) {
      logger.error('Error getting activity metrics:', error);
      throw error;
    }
  }

  /**
   * Get LLM provider usage and costs
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Cost analysis
   */
  async getCostAnalysis(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }

      // Cost estimates (approximate)
      const costPerToken = {
        'anthropic': 0.000015, // ~$15 per 1M tokens (Claude Haiku)
        'local_hebrew': 0 // Local model - no API cost
      };

      const providerStats = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$llmProvider',
            totalActivities: { $sum: 1 },
            totalTokens: { $sum: '$llmTokensUsed' },
            avgTokensPerActivity: { $avg: '$llmTokensUsed' },
            avgGenerationTime: { $avg: '$generationTime' }
          }
        }
      ]);

      // Calculate costs
      const costsBreakdown = providerStats.map(stat => {
        const cost = (stat.totalTokens || 0) * (costPerToken[stat._id] || 0);
        return {
          provider: stat._id,
          activities: stat.totalActivities,
          tokens: stat.totalTokens || 0,
          avgTokensPerActivity: Math.round(stat.avgTokensPerActivity || 0),
          avgGenerationTime: Math.round(stat.avgGenerationTime || 0),
          estimatedCost: parseFloat(cost.toFixed(4))
        };
      });

      const totalCost = costsBreakdown.reduce((sum, p) => sum + p.estimatedCost, 0);

      // Calculate savings from local LLM
      const localActivities = costsBreakdown.find(p => p.provider === 'local_hebrew')?.activities || 0;
      const avgCloudTokens = costsBreakdown.find(p => p.provider === 'anthropic')?.avgTokensPerActivity || 1500;
      const potentialCloudCost = localActivities * avgCloudTokens * costPerToken.anthropic;
      const savings = potentialCloudCost;

      return {
        breakdown: costsBreakdown,
        totalCost: parseFloat(totalCost.toFixed(4)),
        totalActivities: costsBreakdown.reduce((sum, p) => sum + p.activities, 0),
        savings: {
          amount: parseFloat(savings.toFixed(4)),
          percentage: totalCost > 0 ? Math.round((savings / (totalCost + savings)) * 100) : 0
        }
      };

    } catch (error) {
      logger.error('Error getting cost analysis:', error);
      throw error;
    }
  }

  /**
   * Get quality metrics from feedback and validation
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Quality metrics
   */
  async getQualityMetrics(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }

      // Get feedback metrics
      const feedbackStats = await Feedback.getAggregateStats(query);

      // Get Hebrew-specific quality metrics
      const hebrewQualityStats = await Activity.aggregate([
        {
          $match: {
            ...query,
            language: 'he',
            'hebrewLinguistics.validationScore': { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgValidationScore: { $avg: '$hebrewLinguistics.validationScore' },
            avgNikudCoverage: { $avg: '$hebrewLinguistics.nikudCoverage' },
            avgAgeAppropriateScore: { $avg: '$hebrewLinguistics.ageAppropriateScore' },
            avgPhonologicalComplexity: { $avg: '$hebrewLinguistics.phonologicalComplexity' },
            avgMorphologicalComplexity: { $avg: '$hebrewLinguistics.morphologicalComplexity' }
          }
        }
      ]);

      // Activity usage stats
      const usageStats = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: '$usageCount' },
            avgUsagePerActivity: { $avg: '$usageCount' }
          }
        }
      ]);

      return {
        feedback: feedbackStats,
        hebrewQuality: hebrewQualityStats[0] || {},
        usage: usageStats[0] || {}
      };

    } catch (error) {
      logger.error('Error getting quality metrics:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics summary
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Complete analytics summary
   */
  async getSummary(userId, filters = {}) {
    try {
      const [metrics, costs, quality, providerStatus] = await Promise.all([
        this.getActivityMetrics(userId, filters),
        this.getCostAnalysis(userId, filters),
        this.getQualityMetrics(userId, filters),
        llmFactory.getProviderStatus()
      ]);

      return {
        metrics,
        costs,
        quality,
        providerStatus,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting analytics summary:', error);
      throw error;
    }
  }

  /**
   * Get Hebrew activities performance metrics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Hebrew-specific metrics
   */
  async getHebrewMetrics(userId) {
    try {
      const query = { userId, language: 'he' };

      const metrics = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgValidationScore: { $avg: '$hebrewLinguistics.validationScore' },
            avgNikudCoverage: { $avg: '$hebrewLinguistics.nikudCoverage' },
            avgAgeAppropriateScore: { $avg: '$hebrewLinguistics.ageAppropriateScore' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Common roots used
      const rootsUsed = await Activity.aggregate([
        { $match: query },
        { $unwind: '$hebrewLinguistics.rootsUsed' },
        {
          $group: {
            _id: '$hebrewLinguistics.rootsUsed.root',
            count: { $sum: '$hebrewLinguistics.rootsUsed.occurrences' },
            meaning: { $first: '$hebrewLinguistics.rootsUsed.meaning' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      // Phonemes targeted
      const phonemesUsed = await Activity.aggregate([
        { $match: query },
        { $unwind: '$hebrewLinguistics.targetPhonemes' },
        {
          $group: {
            _id: '$hebrewLinguistics.targetPhonemes',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return {
        byType: metrics,
        rootsUsed,
        phonemesUsed,
        total: await Activity.countDocuments(query)
      };

    } catch (error) {
      logger.error('Error getting Hebrew metrics:', error);
      throw error;
    }
  }
}

// Export singleton instance
const analytics = new Analytics();
export default analytics;
