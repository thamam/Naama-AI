/**
 * Hebrew Linguistic Services Export
 *
 * Phase 2: Hebrew Specialization Module
 * Provides comprehensive Hebrew linguistic processing for speech therapy
 */

import morphologicalAnalyzer from './morphologicalAnalyzer.js';
import phoneticProcessor from './phoneticProcessor.js';
import nikudAssigner from './nikudAssigner.js';
import vocabularyBank from './vocabularyBank.js';
import contentValidator from './contentValidator.js';

export {
  morphologicalAnalyzer,
  phoneticProcessor,
  nikudAssigner,
  vocabularyBank,
  contentValidator
};

export default {
  morphologicalAnalyzer,
  phoneticProcessor,
  nikudAssigner,
  vocabularyBank,
  contentValidator,

  // Convenience methods for common operations

  /**
   * Process Hebrew word comprehensively
   * @param {string} word - Hebrew word
   * @returns {Object} Complete linguistic analysis
   */
  analyzeWord(word) {
    return {
      morphology: morphologicalAnalyzer.analyzeWord(word),
      phonetics: phoneticProcessor.analyzePhonetics(word),
      withNikud: nikudAssigner.assignWordNikud(word),
      validation: contentValidator.validateWord(word)
    };
  },

  /**
   * Prepare text for specific age group
   * @param {string} text - Hebrew text
   * @param {string} ageGroup - Age group
   * @returns {string} Processed text with appropriate nikud
   */
  prepareTextForAge(text, ageGroup) {
    return nikudAssigner.assignNikud(text, {
      ageGroup,
      nikudLevel: 'auto'
    });
  },

  /**
   * Get vocabulary for activity
   * @param {Object} criteria - Selection criteria
   * @returns {Array} Vocabulary items
   */
  getVocabulary(criteria) {
    const { theme, ageGroup, targetSound, position, count } = criteria;

    if (targetSound) {
      return vocabularyBank.getVocabularyByPhoneme(targetSound, position || 'any', ageGroup);
    }

    if (theme) {
      return vocabularyBank.getVocabularyByTheme(theme, ageGroup);
    }

    return vocabularyBank.getRandomVocabulary({ count: count || 10, ageGroup });
  },

  /**
   * Validate activity content
   * @param {Object} content - Activity content
   * @param {Object} params - Activity parameters
   * @returns {Object} Validation result
   */
  validateActivity(content, params) {
    return contentValidator.validateActivity(content, params);
  }
};
