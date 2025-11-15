/**
 * Hebrew Content Validation Module
 *
 * Validates Hebrew activity content for:
 * - Linguistic accuracy (proper Hebrew, nikud correctness)
 * - Age appropriateness (vocabulary, complexity)
 * - Therapeutic value (target sound presence, phonological patterns)
 * - Cultural relevance (Israeli context)
 *
 * Ensures all generated activities meet clinical and linguistic standards
 */

import logger from '../../config/logger.js';
import phoneticProcessor from './phoneticProcessor.js';
import morphologicalAnalyzer from './morphologicalAnalyzer.js';
import nikudAssigner from './nikudAssigner.js';
import vocabularyBank from './vocabularyBank.js';

/**
 * Validation rules configuration
 */
const VALIDATION_RULES = {
  nikud: {
    required: true,
    minCoverage: 70, // Percentage of words that should have nikud
    ageSpecific: {
      '2-3': { required: true, minCoverage: 90 },
      '3-4': { required: true, minCoverage: 80 },
      '4-6': { required: false, minCoverage: 50 }
    }
  },
  vocabulary: {
    maxComplexity: {
      '2-3': 3,
      '3-4': 5,
      '4-6': 8
    },
    minCommonWordRatio: 0.7 // 70% should be common words
  },
  phonetics: {
    targetSoundRequired: true,
    minOccurrences: 3, // Minimum times target sound should appear
    appropriateAge: true // Sounds should be age-appropriate
  },
  structure: {
    minItems: 3,
    maxItems: 12,
    requireInstructions: true,
    requireTitle: true
  }
};

class HebrewContentValidator {
  /**
   * Validate complete activity content
   * @param {Object} content - Activity content to validate
   * @param {Object} params - Activity parameters (ageGroup, type, etc.)
   * @returns {Object} Validation result with errors and warnings
   */
  validateActivity(content, params) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      scores: {
        nikud: 0,
        vocabulary: 0,
        phonetics: 0,
        structure: 0,
        overall: 0
      },
      suggestions: []
    };

    // Validate structure
    this._validateStructure(content, params, validation);

    // Validate Hebrew text
    if (params.language === 'he') {
      this._validateNikud(content, params, validation);
      this._validateVocabulary(content, params, validation);
      this._validatePhonetics(content, params, validation);
      this._validateCulturalRelevance(content, params, validation);
    }

    // Calculate overall validity
    validation.isValid = validation.errors.length === 0;
    validation.scores.overall = this._calculateOverallScore(validation.scores);

    logger.info('Content validation complete:', {
      isValid: validation.isValid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length,
      overallScore: validation.scores.overall
    });

    return validation;
  }

  /**
   * Validate nikud coverage and correctness
   * @param {string} text - Hebrew text to validate
   * @param {string} ageGroup - Target age group
   * @returns {Object} Nikud validation result
   */
  validateNikud(text, ageGroup) {
    const stats = nikudAssigner.getNikudStatistics(text);
    const rules = VALIDATION_RULES.nikud.ageSpecific[ageGroup] || VALIDATION_RULES.nikud;

    const result = {
      isValid: true,
      coverage: parseFloat(stats.coverage),
      required: rules.required,
      minCoverage: rules.minCoverage,
      errors: [],
      warnings: []
    };

    if (rules.required && stats.coverage < rules.minCoverage) {
      result.isValid = false;
      result.errors.push({
        type: 'nikud_coverage',
        message: `Nikud coverage ${stats.coverage}% is below required ${rules.minCoverage}%`,
        severity: 'error'
      });
    }

    return result;
  }

  /**
   * Validate Hebrew word validity
   * @param {string} word - Hebrew word to validate
   * @returns {Object} Validation result
   */
  validateWord(word) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      analysis: null
    };

    // Check if word contains only Hebrew characters and nikud
    if (!this._isHebrewText(word)) {
      result.isValid = false;
      result.errors.push({
        type: 'non_hebrew_characters',
        message: 'Word contains non-Hebrew characters',
        word
      });
      return result;
    }

    // Analyze morphology
    const morphology = morphologicalAnalyzer.analyzeWord(word);
    result.analysis = morphology;

    // Check if word has identifiable root
    if (!morphology.root || morphology.root.confidence === 'low') {
      result.warnings.push({
        type: 'unknown_root',
        message: 'Word root could not be identified with confidence',
        word
      });
    }

    return result;
  }

  /**
   * Validate words for age appropriateness
   * @param {Array} words - Array of Hebrew words
   * @param {string} ageGroup - Target age group
   * @returns {Object} Age appropriateness validation
   */
  validateAgeAppropriateness(words, ageGroup) {
    const result = {
      isValid: true,
      appropriateWords: [],
      inappropriateWords: [],
      averageComplexity: 0,
      maxAllowedComplexity: VALIDATION_RULES.vocabulary.maxComplexity[ageGroup]
    };

    const complexities = [];

    words.forEach(word => {
      const assessment = phoneticProcessor.assessAgeAppropriateness(word, ageGroup);
      complexities.push(assessment.difficulty);

      if (assessment.appropriate) {
        result.appropriateWords.push(word);
      } else {
        result.inappropriateWords.push({
          word,
          reason: assessment.recommendation,
          inappropriatePhonemes: assessment.inappropriatePhonemes
        });
      }
    });

    result.averageComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;
    result.isValid = result.inappropriateWords.length === 0;

    return result;
  }

  /**
   * Validate target sound presence in articulation activities
   * @param {Array} words - Array of words
   * @param {string} targetSound - Hebrew letter to target
   * @param {string} position - 'initial', 'medial', 'final', or 'any'
   * @returns {Object} Target sound validation
   */
  validateTargetSound(words, targetSound, position = 'any') {
    const result = {
      isValid: true,
      wordsWithTarget: [],
      wordsWithoutTarget: [],
      occurrencesByPosition: {
        initial: 0,
        medial: 0,
        final: 0
      },
      totalOccurrences: 0
    };

    words.forEach(word => {
      const cleanWord = nikudAssigner.removeNikud(word);
      const hasTarget = cleanWord.includes(targetSound);

      if (hasTarget) {
        // Analyze positions
        const analysis = phoneticProcessor.analyzePhonetics(word);
        const positions = analysis.soundPositions;

        if (positions.initial.includes(targetSound)) {
          result.occurrencesByPosition.initial++;
        }
        if (positions.medial.includes(targetSound)) {
          result.occurrencesByPosition.medial++;
        }
        if (positions.final.includes(targetSound)) {
          result.occurrencesByPosition.final++;
        }

        result.wordsWithTarget.push(word);
        result.totalOccurrences++;
      } else {
        result.wordsWithoutTarget.push(word);
      }
    });

    // Validate based on position requirement
    if (position !== 'any') {
      const positionCount = result.occurrencesByPosition[position];
      if (positionCount < VALIDATION_RULES.phonetics.minOccurrences) {
        result.isValid = false;
      }
    } else {
      if (result.totalOccurrences < VALIDATION_RULES.phonetics.minOccurrences) {
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Extract and validate all Hebrew words from content
   * @param {Object} content - Activity content
   * @returns {Array} Extracted words
   */
  extractHebrewWords(content) {
    const words = new Set();

    const extractFromText = (text) => {
      if (!text || typeof text !== 'string') return;

      // Split by whitespace and punctuation
      const matches = text.match(/[\u0590-\u05FF]+[\u0591-\u05C7]*/g) || [];
      matches.forEach(word => words.add(word.trim()));
    };

    // Extract from various content fields
    if (content.title) extractFromText(content.title);
    if (content.instructions) extractFromText(content.instructions);

    // Extract from items array
    if (Array.isArray(content.items)) {
      content.items.forEach(item => {
        if (typeof item === 'string') {
          extractFromText(item);
        } else if (typeof item === 'object') {
          Object.values(item).forEach(value => {
            if (typeof value === 'string') {
              extractFromText(value);
            }
          });
        }
      });
    }

    return Array.from(words);
  }

  // ===== PRIVATE METHODS =====

  /**
   * Validate activity structure
   */
  _validateStructure(content, params, validation) {
    const rules = VALIDATION_RULES.structure;

    // Check required fields
    if (rules.requireTitle && !content.title) {
      validation.errors.push({
        type: 'missing_title',
        message: 'Activity must have a title',
        severity: 'error'
      });
    }

    if (rules.requireInstructions && !content.instructions) {
      validation.errors.push({
        type: 'missing_instructions',
        message: 'Activity must have instructions',
        severity: 'error'
      });
    }

    // Check items array
    if (!content.items || !Array.isArray(content.items)) {
      validation.errors.push({
        type: 'missing_items',
        message: 'Activity must have an items array',
        severity: 'error'
      });
    } else {
      const itemCount = content.items.length;

      if (itemCount < rules.minItems) {
        validation.errors.push({
          type: 'insufficient_items',
          message: `Activity has ${itemCount} items, minimum is ${rules.minItems}`,
          severity: 'error'
        });
      }

      if (itemCount > rules.maxItems) {
        validation.warnings.push({
          type: 'too_many_items',
          message: `Activity has ${itemCount} items, maximum recommended is ${rules.maxItems}`,
          severity: 'warning'
        });
      }
    }

    validation.scores.structure = validation.errors.filter(e =>
      ['missing_title', 'missing_instructions', 'missing_items', 'insufficient_items'].includes(e.type)
    ).length === 0 ? 100 : 0;
  }

  /**
   * Validate nikud in content
   */
  _validateNikud(content, params, validation) {
    const allText = [
      content.title || '',
      content.instructions || '',
      ...(content.items || []).map(item =>
        typeof item === 'string' ? item : JSON.stringify(item)
      )
    ].join(' ');

    const nikudValidation = this.validateNikud(allText, params.ageGroup);

    if (!nikudValidation.isValid) {
      validation.errors.push(...nikudValidation.errors);
      validation.scores.nikud = 0;
    } else {
      validation.scores.nikud = Math.min(100, nikudValidation.coverage);
    }

    if (nikudValidation.warnings) {
      validation.warnings.push(...nikudValidation.warnings);
    }

    // Suggest adding nikud if coverage is low
    if (nikudValidation.coverage < 50) {
      validation.suggestions.push({
        type: 'add_nikud',
        message: 'Consider adding nikud to improve readability for young children',
        priority: 'high'
      });
    }
  }

  /**
   * Validate vocabulary complexity and appropriateness
   */
  _validateVocabulary(content, params, validation) {
    const words = this.extractHebrewWords(content);

    if (words.length === 0) {
      validation.errors.push({
        type: 'no_hebrew_words',
        message: 'No Hebrew words found in content',
        severity: 'error'
      });
      validation.scores.vocabulary = 0;
      return;
    }

    // Validate age appropriateness
    const ageValidation = this.validateAgeAppropriateness(words, params.ageGroup);

    if (!ageValidation.isValid) {
      validation.warnings.push({
        type: 'inappropriate_vocabulary',
        message: `${ageValidation.inappropriateWords.length} words may be too complex for age group`,
        words: ageValidation.inappropriateWords,
        severity: 'warning'
      });
    }

    // Calculate vocabulary score
    const appropriateRatio = ageValidation.appropriateWords.length / words.length;
    validation.scores.vocabulary = appropriateRatio * 100;

    // Suggest simpler alternatives if complexity too high
    if (ageValidation.averageComplexity > ageValidation.maxAllowedComplexity) {
      validation.suggestions.push({
        type: 'simplify_vocabulary',
        message: 'Consider using simpler words more appropriate for the age group',
        priority: 'medium'
      });
    }
  }

  /**
   * Validate phonetic/articulation aspects
   */
  _validatePhonetics(content, params, validation) {
    // Only validate for articulation activities
    if (params.activityType !== 'articulation' && !params.targetSound) {
      validation.scores.phonetics = 100; // N/A
      return;
    }

    const words = this.extractHebrewWords(content);
    const targetValidation = this.validateTargetSound(
      words,
      params.targetSound,
      params.soundPosition || 'any'
    );

    if (!targetValidation.isValid) {
      validation.errors.push({
        type: 'insufficient_target_sound',
        message: `Target sound '${params.targetSound}' appears only ${targetValidation.totalOccurrences} times, minimum is ${VALIDATION_RULES.phonetics.minOccurrences}`,
        severity: 'error'
      });
      validation.scores.phonetics = 0;
    } else {
      // Score based on target sound frequency
      const frequency = targetValidation.totalOccurrences / words.length;
      validation.scores.phonetics = Math.min(100, frequency * 200); // Max at 50% frequency
    }

    // Provide feedback on sound positions
    if (params.soundPosition && params.soundPosition !== 'any') {
      const positionCount = targetValidation.occurrencesByPosition[params.soundPosition];
      if (positionCount === 0) {
        validation.errors.push({
          type: 'wrong_sound_position',
          message: `Target sound '${params.targetSound}' not found in ${params.soundPosition} position`,
          severity: 'error'
        });
      }
    }
  }

  /**
   * Validate cultural relevance for Israeli children
   */
  _validateCulturalRelevance(content, params, validation) {
    // Check for culturally appropriate themes and references
    const culturalWords = vocabularyBank.getCulturalVocabulary(params.ageGroup);
    const contentWords = this.extractHebrewWords(content);

    const culturalWordSet = new Set(culturalWords.map(item => item.word));
    const hasCulturalContent = contentWords.some(word =>
      culturalWordSet.has(nikudAssigner.removeNikud(word))
    );

    // This is a soft validation - just a suggestion
    if (!hasCulturalContent && params.theme === 'israeli_culture') {
      validation.suggestions.push({
        type: 'add_cultural_content',
        message: 'Consider adding culturally relevant Israeli references',
        priority: 'low'
      });
    }
  }

  /**
   * Check if text is Hebrew
   */
  _isHebrewText(text) {
    // Allow Hebrew letters and nikud marks
    return /^[\u0590-\u05FF\s.,!?׳״]+$/.test(text);
  }

  /**
   * Calculate overall validation score
   */
  _calculateOverallScore(scores) {
    const weights = {
      structure: 0.3,
      nikud: 0.2,
      vocabulary: 0.3,
      phonetics: 0.2
    };

    return Object.keys(weights).reduce((total, key) => {
      return total + (scores[key] * weights[key]);
    }, 0);
  }

  /**
   * Get validation summary
   * @param {Object} validation - Validation result
   * @returns {string} Human-readable summary
   */
  getValidationSummary(validation) {
    const summary = [];

    summary.push(`Overall Score: ${validation.scores.overall.toFixed(1)}/100`);

    if (validation.isValid) {
      summary.push('✓ Content passes all validation checks');
    } else {
      summary.push(`✗ Found ${validation.errors.length} error(s)`);
    }

    if (validation.warnings.length > 0) {
      summary.push(`⚠ ${validation.warnings.length} warning(s)`);
    }

    if (validation.suggestions.length > 0) {
      summary.push(`💡 ${validation.suggestions.length} suggestion(s) for improvement`);
    }

    return summary.join('\n');
  }
}

// Export singleton instance
export default new HebrewContentValidator();
