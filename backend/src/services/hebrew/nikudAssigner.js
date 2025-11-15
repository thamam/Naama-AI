/**
 * Hebrew Nikud (Vowel Points) Assignment Module
 *
 * Dynamically assigns nikud to Hebrew text based on:
 * - Age group (younger children need more vowel support)
 * - Therapeutic goals (articulation practice may need specific vowel patterns)
 * - Word familiarity (common words may not need nikud for older children)
 *
 * Nikud is critical for Hebrew speech therapy as it:
 * - Guides correct pronunciation
 * - Supports early literacy
 * - Helps with syllable awareness
 * - Aids in articulation precision
 */

import logger from '../../config/logger.js';

/**
 * Nikud characters (Unicode)
 */
const NIKUD_MARKS = {
  PATACH: '\u05B7',      // ַ (a as in 'father')
  KAMATZ: '\u05B8',      // ָ (a as in 'father', long)
  SEGOL: '\u05B6',       // ֶ (e as in 'bed')
  TZERE: '\u05B5',       // ֵ (e as in 'they')
  HIRIQ: '\u05B4',       // ִ (i as in 'ski')
  HOLAM: '\u05B9',       // ֹ (o as in 'home')
  HOLAM_HASER: '\u05BA', // ֺ (o without vav)
  KUBUTZ: '\u05BB',      // ֻ (u as in 'rule')
  SHURUK: '\u05BC',      // ּ (dagesh/shuruk)
  SHVA: '\u05B0',        // ְ (schwa, reduced vowel)
  HATAF_SEGOL: '\u05B1', // ֱ (reduced e)
  HATAF_PATACH: '\u05B2',// ֲ (reduced a)
  HATAF_KAMATZ: '\u05B3',// ֳ (reduced o)
  DAGESH: '\u05BC',      // ּ (dagesh - doubling/hardening)
  RAFE: '\u05BF',        // ֿ (rafe - soft pronunciation)
  SIN_DOT: '\u05C2',     // ׂ (sin dot)
  SHIN_DOT: '\u05C1',    // ׁ (shin dot)
  MAPIQ: '\u05BC'        // ּ (mapiq - used in final ה)
};

/**
 * Common Hebrew words with their standard nikud
 * Based on modern Israeli Hebrew pronunciation
 */
const NIKUD_DICTIONARY = {
  // Common verbs
  'אוכל': 'אוֹכֵל',
  'שותה': 'שׁוֹתֶה',
  'יושב': 'יוֹשֵׁב',
  'הולך': 'הוֹלֵךְ',
  'רץ': 'רָץ',
  'שר': 'שָׁר',
  'רוקד': 'רוֹקֵד',
  'משחק': 'מְשַׂחֵק',
  'קורא': 'קוֹרֵא',
  'כותב': 'כּוֹתֵב',
  'שומע': 'שׁוֹמֵעַ',
  'רואה': 'רוֹאֶה',
  'מדבר': 'מְדַבֵּר',
  'צובע': 'צוֹבֵעַ',
  'בונה': 'בּוֹנֶה',
  'שובר': 'שׁוֹבֵר',

  // Common nouns
  'ילד': 'יֶלֶד',
  'ילדה': 'יַלְדָּה',
  'אמא': 'אִמָּא',
  'אבא': 'אַבָּא',
  'בית': 'בַּיִת',
  'כלב': 'כֶּלֶב',
  'חתול': 'חָתוּל',
  'ספר': 'סֵפֶר',
  'כדור': 'כַּדּוּר',
  'בובה': 'בֻּבָּה',
  'מכונית': 'מְכוֹנִית',
  'אוטובוס': 'אוֹטוֹבּוּס',
  'עץ': 'עֵץ',
  'פרח': 'פֶּרַח',
  'שמש': 'שֶׁמֶשׁ',
  'ירח': 'יָרֵחַ',
  'מים': 'מַיִם',
  'לחם': 'לֶחֶם',
  'חלב': 'חָלָב',
  'גבינה': 'גְּבִינָה',

  // Colors
  'אדום': 'אָדֹם',
  'כחול': 'כָּחֹל',
  'ירוק': 'יָרֹק',
  'צהוב': 'צָהֹב',
  'לבן': 'לָבָן',
  'שחור': 'שָׁחֹר',
  'ורוד': 'וָרֹד',
  'כתום': 'כָּתֹם',

  // Body parts
  'ראש': 'רֹאשׁ',
  'פנים': 'פָּנִים',
  'עין': 'עַיִן',
  'אף': 'אַף',
  'פה': 'פֶּה',
  'אוזן': 'אֹזֶן',
  'יד': 'יָד',
  'רגל': 'רֶגֶל',
  'בטן': 'בֶּטֶן',
  'גב': 'גַּב',

  // Numbers
  'אחד': 'אֶחָד',
  'שניים': 'שְׁנַיִם',
  'שלוש': 'שָׁלוֹשׁ',
  'ארבע': 'אַרְבַּע',
  'חמש': 'חָמֵשׁ',
  'שש': 'שֵׁשׁ',
  'שבע': 'שֶׁבַע',
  'שמונה': 'שְׁמוֹנֶה',
  'תשע': 'תֵּשַׁע',
  'עשר': 'עֶשֶׂר',

  // Common adjectives
  'גדול': 'גָּדוֹל',
  'קטן': 'קָטָן',
  'יפה': 'יָפֶה',
  'טוב': 'טוֹב',
  'רע': 'רַע',
  'שמח': 'שָׂמֵחַ',
  'עצוב': 'עָצוּב',
  'חם': 'חַם',
  'קר': 'קַר'
};

/**
 * Syllable patterns with typical nikud
 */
const SYLLABLE_PATTERNS = {
  // CV patterns
  'CV_open': {
    pattern: /^[א-ת][אויה]$/,
    nikud: NIKUD_MARKS.PATACH
  },
  // CVC patterns
  'CVC_closed': {
    pattern: /^[א-ת][א-ת]{0,1}[א-ת]$/,
    nikud: NIKUD_MARKS.SEGOL
  }
};

class NikudAssigner {
  /**
   * Add nikud to Hebrew text based on age group and context
   * @param {string} text - Hebrew text without nikud
   * @param {Object} options - Configuration options
   * @returns {string} Text with nikud
   */
  assignNikud(text, options = {}) {
    const {
      ageGroup = '3-4',
      nikudLevel = 'auto', // 'full', 'partial', 'minimal', 'auto'
      useSimplified = false, // Use simplified nikud for youngest children
      preserveExisting = true // Keep existing nikud if present
    } = options;

    if (!text || typeof text !== 'string') {
      return text;
    }

    // If text already has nikud and we should preserve it
    if (preserveExisting && this._hasNikud(text)) {
      logger.debug('Text already has nikud, preserving');
      return text;
    }

    // Determine nikud level based on age if auto
    const level = nikudLevel === 'auto'
      ? this._determineNikudLevel(ageGroup)
      : nikudLevel;

    logger.debug(`Assigning nikud with level: ${level} for age group: ${ageGroup}`);

    // Process word by word
    const words = text.split(/\s+/);
    const nikudedWords = words.map(word => this._processWord(word, level, useSimplified));

    return nikudedWords.join(' ');
  }

  /**
   * Add nikud to a single word
   * @param {string} word - Hebrew word
   * @param {Object} options - Configuration options
   * @returns {string} Word with nikud
   */
  assignWordNikud(word, options = {}) {
    return this.assignNikud(word, options);
  }

  /**
   * Remove all nikud from text
   * @param {string} text - Hebrew text with nikud
   * @returns {string} Text without nikud
   */
  removeNikud(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }
    return text.replace(/[\u0591-\u05C7]/g, '');
  }

  /**
   * Check if text has nikud
   * @param {string} text - Hebrew text
   * @returns {boolean} True if text contains nikud
   */
  hasNikud(text) {
    return this._hasNikud(text);
  }

  /**
   * Get nikud level recommendation for age group
   * @param {string} ageGroup - Age group
   * @returns {string} Recommended nikud level
   */
  getRecommendedNikudLevel(ageGroup) {
    return this._determineNikudLevel(ageGroup);
  }

  /**
   * Validate nikud accuracy (compare with dictionary)
   * @param {string} word - Hebrew word with nikud
   * @returns {Object} Validation result
   */
  validateNikud(word) {
    const cleanWord = this.removeNikud(word);
    const correctNikud = NIKUD_DICTIONARY[cleanWord];

    if (!correctNikud) {
      return {
        isValid: null,
        message: 'Word not in dictionary',
        suggested: this.assignWordNikud(cleanWord, { nikudLevel: 'full' })
      };
    }

    const isValid = word === correctNikud;

    return {
      isValid,
      message: isValid ? 'Correct nikud' : 'Incorrect nikud',
      expected: correctNikud,
      received: word
    };
  }

  /**
   * Get common words with nikud for a specific age group
   * @param {string} ageGroup - Age group
   * @returns {Array} Array of words with nikud
   */
  getCommonWordsWithNikud(ageGroup) {
    // Return subset of dictionary based on complexity
    const allWords = Object.entries(NIKUD_DICTIONARY);

    // Filter by word length and complexity
    const maxLength = {
      '2-3': 4,
      '3-4': 6,
      '4-6': 10
    }[ageGroup] || 6;

    return allWords
      .filter(([word, _]) => word.length <= maxLength)
      .map(([word, nikudWord]) => ({
        word,
        withNikud: nikudWord
      }));
  }

  // ===== PRIVATE METHODS =====

  /**
   * Determine appropriate nikud level for age group
   */
  _determineNikudLevel(ageGroup) {
    const levelMap = {
      '2-3': 'full',     // Youngest children need full vowel support
      '3-4': 'full',     // Still need comprehensive nikud
      '4-6': 'partial'   // Can handle some words without nikud
    };

    return levelMap[ageGroup] || 'full';
  }

  /**
   * Check if text contains nikud marks
   */
  _hasNikud(text) {
    return /[\u0591-\u05C7]/.test(text);
  }

  /**
   * Process a single word to add nikud
   */
  _processWord(word, level, useSimplified) {
    const cleanWord = this.removeNikud(word);

    // Check dictionary first
    if (NIKUD_DICTIONARY[cleanWord]) {
      if (level === 'full') {
        return NIKUD_DICTIONARY[cleanWord];
      } else if (level === 'partial') {
        // Return partial nikud (e.g., only on complex syllables)
        return this._applyPartialNikud(NIKUD_DICTIONARY[cleanWord]);
      } else if (level === 'minimal') {
        // Only mark ambiguous cases
        return cleanWord;
      }
    }

    // If not in dictionary, apply rule-based nikud
    if (level === 'full') {
      return this._applyRuleBasedNikud(cleanWord, useSimplified);
    }

    // For partial or minimal, return clean word
    return cleanWord;
  }

  /**
   * Apply partial nikud (only critical vowels)
   */
  _applyPartialNikud(nikudedWord) {
    // Strategy: Keep only patach, kamatz, and segol (basic vowels)
    // Remove shva, hataf marks, and other secondary marks

    let result = '';
    for (let i = 0; i < nikudedWord.length; i++) {
      const char = nikudedWord[i];
      const charCode = char.charCodeAt(0);

      // Keep base letters and primary vowels only
      if (charCode < 0x0591 || charCode > 0x05C7) {
        // Base letter
        result += char;
      } else if ([
        NIKUD_MARKS.PATACH,
        NIKUD_MARKS.KAMATZ,
        NIKUD_MARKS.SEGOL,
        NIKUD_MARKS.TZERE,
        NIKUD_MARKS.HIRIQ,
        NIKUD_MARKS.HOLAM,
        NIKUD_MARKS.KUBUTZ
      ].includes(char)) {
        // Primary vowel
        result += char;
      }
      // Skip shva, hataf marks, dagesh, etc.
    }

    return result;
  }

  /**
   * Apply rule-based nikud for words not in dictionary
   */
  _applyRuleBasedNikud(word, useSimplified) {
    // This is a simplified rule-based system
    // In production, would use a more sophisticated morphological analyzer

    let nikudedWord = '';
    const letters = word.split('');

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      nikudedWord += letter;

      // Add basic nikud based on position and letter type
      if (i < letters.length - 1) {
        // Not the last letter - add vowel
        if (this._isConsonant(letter)) {
          // Default to patach for simplicity
          nikudedWord += useSimplified ? NIKUD_MARKS.PATACH : this._guessVowel(letter, letters, i);
        }
      } else {
        // Last letter - often has no vowel or shva
        if (['ה', 'ו', 'י', 'א'].includes(letter)) {
          // Mater lectionis - no vowel needed
        } else {
          // May need final vowel depending on word structure
        }
      }
    }

    logger.debug(`Applied rule-based nikud to '${word}': ${nikudedWord}`);
    return nikudedWord;
  }

  /**
   * Check if letter is a consonant (not a vowel letter)
   */
  _isConsonant(letter) {
    // In Hebrew, א ה ו י can be vowels or consonants
    // This is a simplified check
    return /[א-ת]/.test(letter);
  }

  /**
   * Guess appropriate vowel based on context
   */
  _guessVowel(letter, letters, position) {
    // Simplified vowel guessing based on common patterns

    const nextLetter = letters[position + 1];

    // If followed by vowel letter, use appropriate vowel
    if (nextLetter === 'ו') {
      return NIKUD_MARKS.HOLAM; // o sound
    } else if (nextLetter === 'י') {
      return NIKUD_MARKS.HIRIQ; // i sound
    }

    // Default to patach (a sound) - most common
    return NIKUD_MARKS.PATACH;
  }

  /**
   * Get nikud statistics for text
   * @param {string} text - Hebrew text
   * @returns {Object} Statistics about nikud usage
   */
  getNikudStatistics(text) {
    const stats = {
      totalCharacters: text.length,
      nikudMarks: 0,
      nikudTypes: {},
      coverage: 0
    };

    for (const char of text) {
      if (/[\u0591-\u05C7]/.test(char)) {
        stats.nikudMarks++;

        // Count specific types
        const nikudName = Object.keys(NIKUD_MARKS).find(
          key => NIKUD_MARKS[key] === char
        );
        if (nikudName) {
          stats.nikudTypes[nikudName] = (stats.nikudTypes[nikudName] || 0) + 1;
        }
      }
    }

    // Calculate coverage (nikud marks per consonant)
    const consonantCount = (text.match(/[א-ת]/g) || []).length;
    stats.coverage = consonantCount > 0
      ? (stats.nikudMarks / consonantCount * 100).toFixed(1)
      : 0;

    return stats;
  }
}

// Export singleton instance
export default new NikudAssigner();
