import llmFactory from './llm/LLMFactory.js';
import promptAssembler from './promptAssembler.js';
import Activity from '../models/Activity.js';
import logger from '../config/logger.js';

/**
 * Service to generate speech therapy activities using LLM
 */
class ActivityGenerator {
  /**
   * Generate a new activity
   * @param {Object} params - Generation parameters
   * @param {Object} user - User object making the request
   * @returns {Promise<Object>} - Generated activity
   */
  async generateActivity(params, user) {
    try {
      // Validate parameters
      promptAssembler.validateParams(params);

      // Set default item count if not provided
      if (!params.itemCount) {
        params.itemCount = promptAssembler.getRecommendedItemCount(
          params.ageGroup,
          params.activityType
        );
      }

      logger.info(`Generating ${params.activityType} activity for user ${user.id}`);

      // Assemble prompt
      const prompt = promptAssembler.assemblePrompt(params);

      // Get LLM provider
      const llmProvider = llmFactory.getProvider('anthropic');

      // Generate content
      const result = await llmProvider.generate({
        prompt,
        options: {
          temperature: 0.7, // Slightly creative but consistent
          maxTokens: 2048
        }
      });

      // Validate generated content
      this.validateGeneratedContent(result.content, params.activityType);

      // Save activity to database
      const activity = await this.saveActivity({
        userId: user.id,
        params,
        generatedContent: result.content,
        metadata: result.metadata
      });

      logger.info(`Activity ${activity.id} generated successfully`);

      return {
        success: true,
        activity: activity.toObject(),
        metadata: result.metadata
      };

    } catch (error) {
      logger.error('Activity generation error:', error);
      throw error;
    }
  }

  /**
   * Validate generated content structure
   * @param {Object} content - Generated content
   * @param {string} activityType - Activity type
   * @throws {Error} - If content is invalid
   */
  validateGeneratedContent(content, activityType) {
    if (!content || typeof content !== 'object') {
      throw new Error('Generated content is not a valid object');
    }

    // Check for rawText (indicates parsing failure)
    if (content.rawText) {
      logger.warn('LLM returned non-JSON content');
      throw new Error('LLM did not return structured JSON content');
    }

    // Common required fields
    if (!content.title || !content.instructions) {
      throw new Error('Generated content missing required fields (title, instructions)');
    }

    // Activity-specific validation
    switch (activityType) {
      case 'picture_matching':
        if (!Array.isArray(content.items) || content.items.length === 0) {
          throw new Error('Picture matching activity must have items array');
        }
        break;

      case 'sequencing':
        if (!Array.isArray(content.steps) || content.steps.length === 0) {
          throw new Error('Sequencing activity must have steps array');
        }
        break;

      case 'articulation':
        if (!Array.isArray(content.words) || content.words.length === 0) {
          throw new Error('Articulation activity must have words array');
        }
        if (!content.targetSound) {
          throw new Error('Articulation activity must have targetSound');
        }
        break;

      default:
        throw new Error(`Unknown activity type: ${activityType}`);
    }

    logger.debug('Generated content validation passed');
  }

  /**
   * Save activity to database
   * @param {Object} data - Activity data
   * @returns {Promise<Activity>} - Saved activity document
   */
  async saveActivity(data) {
    const { userId, params, generatedContent, metadata } = data;

    const activity = new Activity({
      userId,
      type: params.activityType,
      ageGroup: params.ageGroup,
      language: params.language || 'en',
      inputPrompt: params.description || `Generate ${params.activityType} activity`,
      targetSound: params.targetSound,
      theme: params.theme,
      customization: params.customization || {},
      content: generatedContent,
      llmProvider: metadata.provider,
      llmModel: metadata.model,
      llmTokensUsed: metadata.tokensUsed,
      generationTime: metadata.generationTime,
      status: 'active'
    });

    await activity.save();
    logger.info(`Activity saved to database: ${activity.id}`);

    return activity;
  }

  /**
   * Get user's activity history
   * @param {string} userId - User ID
   * @param {Object} options - Query options (limit, skip, filters)
   * @returns {Promise<Array>} - Array of activities
   */
  async getUserActivities(userId, options = {}) {
    const {
      limit = 20,
      skip = 0,
      type,
      ageGroup,
      status = 'active'
    } = options;

    const query = { userId, status };

    if (type) query.type = type;
    if (ageGroup) query.ageGroup = ageGroup;

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-content') // Don't return full content in list view
      .lean();

    return activities;
  }

  /**
   * Get activity by ID
   * @param {string} activityId - Activity ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<Activity>} - Activity document
   */
  async getActivityById(activityId, userId) {
    const activity = await Activity.findOne({
      _id: activityId,
      userId
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    await activity.recordUsage();

    return activity;
  }

  /**
   * Delete activity
   * @param {string} activityId - Activity ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<boolean>} - Success status
   */
  async deleteActivity(activityId, userId) {
    const result = await Activity.deleteOne({
      _id: activityId,
      userId
    });

    if (result.deletedCount === 0) {
      throw new Error('Activity not found or unauthorized');
    }

    logger.info(`Activity ${activityId} deleted by user ${userId}`);
    return true;
  }
}

// Export singleton instance
const activityGenerator = new ActivityGenerator();
export default activityGenerator;
