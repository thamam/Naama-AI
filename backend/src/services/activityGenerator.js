import llmFactory from './llm/LLMFactory.js';
import promptAssembler from './promptAssembler.js';
import Activity from '../models/Activity.js';
import logger from '../config/logger.js';
import hebrewServices from './hebrew/index.js';

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

      // Phase 2.5: Pre-process Hebrew activities with linguistic services
      if (params.language === 'he') {
        await this.preprocessHebrewActivity(params);
      }

      // Assemble prompt
      const prompt = promptAssembler.assemblePrompt(params);

      // Phase 2.5: Use intelligent routing with automatic failover
      const result = await llmFactory.generateWithFailover({
        prompt,
        language: params.language,
        activityType: params.activityType,
        ageGroup: params.ageGroup,
        options: {
          temperature: 0.7, // Slightly creative but consistent
          maxTokens: 2048
        }
      });

      // Validate generated content
      this.validateGeneratedContent(result.content, params.activityType);

      // Phase 2.5: Post-process Hebrew activities
      if (params.language === 'he') {
        await this.postprocessHebrewActivity(result.content, params);
      }

      // Save activity to database
      const activity = await this.saveActivity({
        userId: user.id,
        params,
        generatedContent: result.content,
        metadata: result.metadata
      });

      // Phase 2.5: Populate Hebrew linguistic metadata
      if (params.language === 'he') {
        await activity.populateHebrewMetadata(hebrewServices);
      }

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

      case 'rhyming':
        if (!Array.isArray(content.rhymingPairs) || content.rhymingPairs.length === 0) {
          throw new Error('Rhyming activity must have rhymingPairs array');
        }
        break;

      case 'morphological':
        if (!Array.isArray(content.wordFamilies) || content.wordFamilies.length === 0) {
          throw new Error('Morphological activity must have wordFamilies array');
        }
        break;

      case 'prosody':
        if (!Array.isArray(content.exercises) || content.exercises.length === 0) {
          throw new Error('Prosody activity must have exercises array');
        }
        break;

      case 'bilingual':
        if (!Array.isArray(content.translationPairs) || content.translationPairs.length === 0) {
          throw new Error('Bilingual activity must have translationPairs array');
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
   * Pre-process Hebrew activity with linguistic services
   * Phase 2.5: Enhance prompts with vocabulary and phonetic data
   * @param {Object} params - Activity parameters
   */
  async preprocessHebrewActivity(params) {
    logger.info('Preprocessing Hebrew activity with linguistic services');

    // Get age-appropriate vocabulary based on activity type
    if (params.activityType === 'articulation' && params.targetSound) {
      // Get vocabulary filtered by target sound
      const vocabulary = hebrewServices.getVocabulary({
        targetSound: params.targetSound,
        position: params.soundPosition || 'any',
        ageGroup: params.ageGroup,
        count: params.itemCount
      });

      params.suggestedVocabulary = vocabulary.slice(0, params.itemCount * 2); // Get extra for variety
      logger.debug(`Found ${vocabulary.length} words with target sound ${params.targetSound}`);
    } else if (params.theme) {
      // Get vocabulary by theme
      const vocabulary = hebrewServices.getVocabulary({
        theme: params.theme,
        ageGroup: params.ageGroup,
        count: params.itemCount * 2
      });

      params.suggestedVocabulary = vocabulary;
      logger.debug(`Found ${vocabulary.length} words for theme ${params.theme}`);
    }

    // Set nikud level based on age group
    if (!params.nikudLevel) {
      const nikudLevels = {
        '2-3': 'full',
        '3-4': 'full',
        '4-6': 'partial'
      };
      params.nikudLevel = nikudLevels[params.ageGroup] || 'partial';
    }

    // Get phonetic difficulty info for age group
    if (params.targetSound) {
      const phoneticInfo = hebrewServices.phoneticProcessor.getPhonemeInfo(params.targetSound);
      if (phoneticInfo) {
        params.phoneticInfo = phoneticInfo;
      }
    }
  }

  /**
   * Post-process Hebrew activity content with linguistic services
   * Phase 2.5: Add nikud, validate content, enrich metadata
   * @param {Object} content - Generated content
   * @param {Object} params - Activity parameters
   */
  async postprocessHebrewActivity(content, params) {
    logger.info('Post-processing Hebrew activity with linguistic services');

    // Assign nikud to all Hebrew text based on age group
    if (content.title) {
      content.title = hebrewServices.prepareTextForAge(content.title, params.ageGroup);
    }

    if (content.instructions) {
      content.instructions = hebrewServices.prepareTextForAge(content.instructions, params.ageGroup);
    }

    // Process activity-specific content
    if (content.words && Array.isArray(content.words)) {
      // Articulation or word-based activities
      content.words = content.words.map(item => {
        if (typeof item === 'string') {
          return hebrewServices.prepareTextForAge(item, params.ageGroup);
        } else if (item.word) {
          item.word = hebrewServices.prepareTextForAge(item.word, params.ageGroup);

          // Enrich with morphological and phonetic analysis
          const analysis = hebrewServices.analyzeWord(item.word);
          item.morphology = analysis.morphology;
          item.phonetics = analysis.phonetics;

          return item;
        }
        return item;
      });
    }

    if (content.items && Array.isArray(content.items)) {
      // Picture matching or other item-based activities
      content.items = content.items.map(item => {
        if (item.text) {
          item.text = hebrewServices.prepareTextForAge(item.text, params.ageGroup);
        }
        if (item.label) {
          item.label = hebrewServices.prepareTextForAge(item.label, params.ageGroup);
        }
        return item;
      });
    }

    // Validate Hebrew content quality
    const validation = hebrewServices.validateActivity(content, params);

    if (validation.scores.overall < 60) {
      logger.warn('Generated Hebrew content has low quality score', {
        score: validation.scores.overall,
        warnings: validation.warnings
      });
    }

    // Add validation metadata to content
    content.hebrewValidation = {
      score: validation.scores.overall,
      warnings: validation.warnings.map(w => w.message),
      nikudCoverage: validation.scores.nikudCoverage
    };

    logger.info('Hebrew post-processing complete', {
      validationScore: validation.scores.overall,
      warnings: validation.warnings.length
    });
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
