import { generatePictureMatchingPrompt } from '../templates/pictureMatchingPrompt.js';
import { generateSequencingPrompt } from '../templates/sequencingPrompt.js';
import { generateArticulationPrompt } from '../templates/articulationPrompt.js';
import {
  generateHebrewArticulationPrompt,
  generateRhymingPrompt,
  generateMorphologicalPrompt,
  generateProsodyPrompt,
  generateBilingualPrompt
} from '../templates/hebrew/index.js';
import logger from '../config/logger.js';

/**
 * Service to assemble prompts based on activity type and parameters
 */
class PromptAssembler {
  /**
   * Assemble prompt for activity generation
   * @param {Object} params - Activity parameters
   * @returns {string} - Assembled prompt
   */
  assemblePrompt(params) {
    const { activityType, language = 'en' } = params;

    if (!activityType) {
      throw new Error('activityType is required');
    }

    logger.info(`Assembling prompt for activity type: ${activityType}, language: ${language}`);

    let prompt;

    switch (activityType) {
      case 'picture_matching':
        prompt = generatePictureMatchingPrompt(params);
        break;

      case 'sequencing':
        prompt = generateSequencingPrompt(params);
        break;

      case 'articulation':
        // Use Hebrew-specific template for Hebrew activities
        if (language === 'he') {
          prompt = generateHebrewArticulationPrompt(params);
        } else {
          prompt = generateArticulationPrompt(params);
        }
        break;

      case 'rhyming':
        prompt = generateRhymingPrompt(params);
        break;

      case 'morphological':
        prompt = generateMorphologicalPrompt(params);
        break;

      case 'prosody':
        prompt = generateProsodyPrompt(params);
        break;

      case 'bilingual':
        prompt = generateBilingualPrompt(params);
        break;

      default:
        throw new Error(`Unsupported activity type: ${activityType}`);
    }

    logger.debug('Prompt assembled successfully');
    return prompt;
  }

  /**
   * Validate activity parameters
   * @param {Object} params - Activity parameters
   * @returns {boolean} - Whether parameters are valid
   */
  validateParams(params) {
    const {
      activityType,
      ageGroup,
      language = 'en'
    } = params;

    // Required fields
    if (!activityType) {
      throw new Error('activityType is required');
    }

    if (!ageGroup) {
      throw new Error('ageGroup is required');
    }

    // Validate activity type
    const validActivityTypes = [
      'picture_matching',
      'sequencing',
      'articulation',
      'rhyming',
      'morphological',
      'prosody',
      'bilingual'
    ];
    if (!validActivityTypes.includes(activityType)) {
      throw new Error(`Invalid activityType. Must be one of: ${validActivityTypes.join(', ')}`);
    }

    // Validate age group
    const validAgeGroups = ['2-3', '3-4', '4-6'];
    if (!validAgeGroups.includes(ageGroup)) {
      throw new Error(`Invalid ageGroup. Must be one of: ${validAgeGroups.join(', ')}`);
    }

    // Validate language
    const validLanguages = ['en', 'he'];
    if (!validLanguages.includes(language)) {
      throw new Error(`Invalid language. Must be one of: ${validLanguages.join(', ')}`);
    }

    // Activity-specific validation
    if (activityType === 'articulation' && !params.targetSound) {
      throw new Error('targetSound is required for articulation activities');
    }

    return true;
  }

  /**
   * Get item count based on age group (if not specified)
   * @param {string} ageGroup - Age group
   * @param {string} activityType - Activity type
   * @returns {number} - Recommended item count
   */
  getRecommendedItemCount(ageGroup, activityType) {
    const recommendations = {
      'picture_matching': {
        '2-3': 4,
        '3-4': 6,
        '4-6': 10
      },
      'sequencing': {
        '2-3': 3,
        '3-4': 4,
        '4-6': 5
      },
      'articulation': {
        '2-3': 4,
        '3-4': 6,
        '4-6': 10
      },
      'rhyming': {
        '2-3': 3,
        '3-4': 5,
        '4-6': 7
      },
      'morphological': {
        '2-3': 2,
        '3-4': 3,
        '4-6': 5
      },
      'prosody': {
        '2-3': 4,
        '3-4': 6,
        '4-6': 8
      },
      'bilingual': {
        '2-3': 5,
        '3-4': 8,
        '4-6': 12
      }
    };

    return recommendations[activityType]?.[ageGroup] || 6;
  }
}

// Export singleton instance
const promptAssembler = new PromptAssembler();
export default promptAssembler;
