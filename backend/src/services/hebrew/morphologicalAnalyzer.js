/**
 * Hebrew Morphological Analysis Module
 *
 * Provides morphological analysis for Hebrew words including:
 * - Root extraction (shoresh - שורש)
 * - Pattern identification (mishkal - משקל)
 * - Prefix/suffix analysis
 * - Word formation analysis
 *
 * This is critical for speech therapy as it helps identify:
 * - Sound patterns in words
 * - Syllable structure
 * - Phonological complexity
 */

const logger = require('../../config/logger');

/**
 * Common Hebrew roots for speech therapy activities
 * Format: { root: [consonants], meaning: string, examples: array }
 */
const COMMON_HEBREW_ROOTS = {
  // Basic everyday roots frequently used in children's speech
  'אכל': { letters: ['א', 'כ', 'ל'], meaning: 'eat', examples: ['אוכל', 'אכלה', 'נאכל'] },
  'שתה': { letters: ['ש', 'ת', 'ה'], meaning: 'drink', examples: ['שותה', 'שתיה', 'משקה'] },
  'ישב': { letters: ['י', 'ש', 'ב'], meaning: 'sit', examples: ['יושב', 'ישיבה', 'מושב'] },
  'הלך': { letters: ['ה', 'ל', 'ך'], meaning: 'walk/go', examples: ['הולך', 'הליכה', 'מהלך'] },
  'שחק': { letters: ['ש', 'ח', 'ק'], meaning: 'play', examples: ['שחקן', 'משחק', 'שחקה'] },
  'קרא': { letters: ['ק', 'ר', 'א'], meaning: 'read/call', examples: ['קורא', 'קריאה', 'מקרא'] },
  'כתב': { letters: ['כ', 'ת', 'ב'], meaning: 'write', examples: ['כותב', 'כתיבה', 'מכתב'] },
  'רוץ': { letters: ['ר', 'ו', 'ץ'], meaning: 'run', examples: ['רץ', 'ריצה', 'מרוץ'] },
  'שמע': { letters: ['ש', 'מ', 'ע'], meaning: 'hear', examples: ['שומע', 'שמיעה', 'משמע'] },
  'ראה': { letters: ['ר', 'א', 'ה'], meaning: 'see', examples: ['רואה', 'ראייה', 'מראה'] },
  'ידע': { letters: ['י', 'ד', 'ע'], meaning: 'know', examples: ['יודע', 'ידיעה', 'מדע'] },
  'דבר': { letters: ['ד', 'ב', 'ר'], meaning: 'speak', examples: ['מדבר', 'דיבור', 'דברים'] },
  'עבד': { letters: ['ע', 'ב', 'ד'], meaning: 'work', examples: ['עובד', 'עבודה', 'מעבד'] },
  'למד': { letters: ['ל', 'מ', 'ד'], meaning: 'learn', examples: ['לומד', 'למידה', 'תלמיד'] },
  'שיר': { letters: ['ש', 'י', 'ר'], meaning: 'sing', examples: ['שר', 'שירה', 'שיר'] },
  'רקד': { letters: ['ר', 'ק', 'ד'], meaning: 'dance', examples: ['רוקד', 'ריקוד', 'רקדן'] },
  'צבע': { letters: ['צ', 'ב', 'ע'], meaning: 'paint/color', examples: ['צובע', 'צבע', 'צביעה'] },
  'בנה': { letters: ['ב', 'ן', 'ה'], meaning: 'build', examples: ['בונה', 'בניין', 'מבנה'] },
  'שבר': { letters: ['ש', 'ב', 'ר'], meaning: 'break', examples: ['שובר', 'שבירה', 'שבר'] },
  'סגר': { letters: ['ס', 'ג', 'ר'], meaning: 'close', examples: ['סוגר', 'סגירה', 'מסגר'] },
};

/**
 * Common Hebrew word patterns (binyanim - בניינים)
 * These affect pronunciation and syllable structure
 */
const HEBREW_PATTERNS = {
  // Pa'al (פעל) - basic pattern
  'פעל': {
    name: 'Pa\'al',
    template: 'CaCaC',
    examples: ['כתב', 'שמע', 'ידע'],
    syllableStructure: 'CV.CVC'
  },
  // Pi'el (פיעל) - intensive pattern
  'פיעל': {
    name: 'Pi\'el',
    template: 'CiCeC',
    examples: ['דיבר', 'שיחק', 'ליטף'],
    syllableStructure: 'Ci.CeC'
  },
  // Hif'il (הפעיל) - causative pattern
  'הפעיל': {
    name: 'Hif\'il',
    template: 'hiCCiC',
    examples: ['הגדיל', 'הכניס', 'הוציא'],
    syllableStructure: 'hi.C.CiC'
  },
  // Hitpa'el (התפעל) - reflexive pattern
  'התפעל': {
    name: 'Hitpa\'el',
    template: 'hitCaCeC',
    examples: ['התלבש', 'התרחץ', 'השתעשע'],
    syllableStructure: 'hit.Ca.CeC'
  },
  // Nif'al (נפעל) - passive/reflexive
  'נפעל': {
    name: 'Nif\'al',
    template: 'niCCaC',
    examples: ['נשבר', 'נסגר', 'נפתח'],
    syllableStructure: 'ni.C.CaC'
  }
};

/**
 * Hebrew prefix particles (מילות יחס וקידומות)
 */
const HEBREW_PREFIXES = {
  'ה': { type: 'definite_article', meaning: 'the' },
  'ו': { type: 'conjunction', meaning: 'and' },
  'ב': { type: 'preposition', meaning: 'in/at' },
  'כ': { type: 'preposition', meaning: 'like/as' },
  'ל': { type: 'preposition', meaning: 'to/for' },
  'מ': { type: 'preposition', meaning: 'from' },
  'ש': { type: 'relative', meaning: 'that/which' }
};

/**
 * Hebrew suffix patterns (סיומות)
 */
const HEBREW_SUFFIXES = {
  'ים': { type: 'plural_masculine', gender: 'masculine', number: 'plural' },
  'ות': { type: 'plural_feminine', gender: 'feminine', number: 'plural' },
  'ה': { type: 'feminine_singular', gender: 'feminine', number: 'singular' },
  'ת': { type: 'feminine_singular_alt', gender: 'feminine', number: 'singular' },
  'ך': { type: 'possessive_2sg', person: '2nd', number: 'singular' },
  'כם': { type: 'possessive_2pl_m', person: '2nd', number: 'plural', gender: 'masculine' },
  'כן': { type: 'possessive_2pl_f', person: '2nd', number: 'plural', gender: 'feminine' },
  'י': { type: 'possessive_1sg', person: '1st', number: 'singular' },
  'נו': { type: 'possessive_1pl', person: '1st', number: 'plural' },
  'ו': { type: 'possessive_3sg_m', person: '3rd', number: 'singular', gender: 'masculine' },
  'ה': { type: 'possessive_3sg_f', person: '3rd', number: 'singular', gender: 'feminine' },
  'הם': { type: 'possessive_3pl_m', person: '3rd', number: 'plural', gender: 'masculine' },
  'הן': { type: 'possessive_3pl_f', person: '3rd', number: 'plural', gender: 'feminine' }
};

class HebrewMorphologicalAnalyzer {
  /**
   * Analyze a Hebrew word's morphological structure
   * @param {string} word - Hebrew word to analyze
   * @returns {Object} Morphological analysis including root, pattern, affixes
   */
  analyzeWord(word) {
    if (!word || typeof word !== 'string') {
      return null;
    }

    const cleanWord = this._cleanWord(word);

    const analysis = {
      original: word,
      cleaned: cleanWord,
      prefixes: this._extractPrefixes(cleanWord),
      suffixes: this._extractSuffixes(cleanWord),
      root: null,
      pattern: null,
      syllables: [],
      phonologicalComplexity: 0
    };

    // Extract root after removing affixes
    const stem = this._extractStem(cleanWord, analysis.prefixes, analysis.suffixes);
    analysis.root = this._identifyRoot(stem);
    analysis.pattern = this._identifyPattern(stem);
    analysis.syllables = this._syllabify(cleanWord);
    analysis.phonologicalComplexity = this._calculateComplexity(analysis);

    logger.debug(`Morphological analysis for '${word}':`, analysis);

    return analysis;
  }

  /**
   * Extract the root (shoresh) from a Hebrew word
   * @param {string} word - Hebrew word
   * @returns {Object|null} Root information
   */
  extractRoot(word) {
    const analysis = this.analyzeWord(word);
    return analysis ? analysis.root : null;
  }

  /**
   * Identify the binyan (pattern) of a Hebrew word
   * @param {string} word - Hebrew word
   * @returns {Object|null} Pattern information
   */
  identifyPattern(word) {
    const analysis = this.analyzeWord(word);
    return analysis ? analysis.pattern : null;
  }

  /**
   * Break a Hebrew word into syllables
   * @param {string} word - Hebrew word
   * @returns {Array} Array of syllables
   */
  syllabify(word) {
    return this._syllabify(word);
  }

  /**
   * Calculate phonological complexity for therapeutic difficulty assessment
   * @param {string} word - Hebrew word
   * @returns {number} Complexity score (0-10)
   */
  assessComplexity(word) {
    const analysis = this.analyzeWord(word);
    return analysis ? analysis.phonologicalComplexity : 0;
  }

  /**
   * Get words with the same root
   * @param {string} root - Hebrew root (3 letters)
   * @returns {Array} Array of related words
   */
  getWordFamily(root) {
    const rootData = COMMON_HEBREW_ROOTS[root];
    if (!rootData) {
      return [];
    }
    return rootData.examples || [];
  }

  /**
   * Filter words by phonological complexity for age-appropriate activities
   * @param {Array} words - Array of Hebrew words
   * @param {string} ageGroup - Age group ('2-3', '3-4', '4-6')
   * @returns {Array} Filtered words appropriate for age
   */
  filterByComplexity(words, ageGroup) {
    const maxComplexity = this._getMaxComplexityForAge(ageGroup);

    return words
      .map(word => ({
        word,
        complexity: this.assessComplexity(word)
      }))
      .filter(item => item.complexity <= maxComplexity)
      .sort((a, b) => a.complexity - b.complexity)
      .map(item => item.word);
  }

  // ===== PRIVATE METHODS =====

  /**
   * Clean word by removing nikud and extra characters
   */
  _cleanWord(word) {
    // Remove nikud (vowel points) and special marks
    return word
      .replace(/[\u0591-\u05C7]/g, '') // Remove nikud
      .replace(/[\u05F0-\u05F4]/g, '') // Remove ligatures
      .trim();
  }

  /**
   * Extract prefixes from word
   */
  _extractPrefixes(word) {
    const prefixes = [];
    let remainingWord = word;

    // Check for common prefix patterns (can be combined)
    const prefixPatterns = ['וה', 'וב', 'וכ', 'ול', 'ומ', 'וש', 'ה', 'ו', 'ב', 'כ', 'ל', 'מ', 'ש'];

    for (const prefix of prefixPatterns) {
      if (remainingWord.startsWith(prefix)) {
        const prefixData = [];
        for (const letter of prefix) {
          if (HEBREW_PREFIXES[letter]) {
            prefixData.push({ letter, ...HEBREW_PREFIXES[letter] });
          }
        }
        return prefixData;
      }
    }

    return prefixes;
  }

  /**
   * Extract suffixes from word
   */
  _extractSuffixes(word) {
    const suffixes = [];

    // Check for suffixes (longest first to avoid partial matches)
    const suffixPatterns = Object.keys(HEBREW_SUFFIXES).sort((a, b) => b.length - a.length);

    for (const suffix of suffixPatterns) {
      if (word.endsWith(suffix) && word.length > suffix.length) {
        suffixes.push({ letters: suffix, ...HEBREW_SUFFIXES[suffix] });
        break; // Take only the first (longest) match
      }
    }

    return suffixes;
  }

  /**
   * Extract stem after removing affixes
   */
  _extractStem(word, prefixes, suffixes) {
    let stem = word;

    // Remove prefixes
    if (prefixes.length > 0) {
      const prefixLength = prefixes.reduce((sum, p) => sum + p.letter.length, 0);
      stem = stem.substring(prefixLength);
    }

    // Remove suffixes
    if (suffixes.length > 0) {
      const suffixLength = suffixes[0].letters.length;
      stem = stem.substring(0, stem.length - suffixLength);
    }

    return stem;
  }

  /**
   * Identify the root from stem
   */
  _identifyRoot(stem) {
    // Check if stem matches known root
    if (COMMON_HEBREW_ROOTS[stem]) {
      return {
        letters: COMMON_HEBREW_ROOTS[stem].letters,
        meaning: COMMON_HEBREW_ROOTS[stem].meaning,
        confidence: 'high'
      };
    }

    // Try to extract 3-letter root (most common)
    const consonants = this._extractConsonants(stem);

    if (consonants.length >= 3) {
      // Check if the first 3 consonants match a known root
      const rootCandidate = consonants.slice(0, 3).join('');
      if (COMMON_HEBREW_ROOTS[rootCandidate]) {
        return {
          letters: COMMON_HEBREW_ROOTS[rootCandidate].letters,
          meaning: COMMON_HEBREW_ROOTS[rootCandidate].meaning,
          confidence: 'medium'
        };
      }

      return {
        letters: consonants.slice(0, 3),
        meaning: 'unknown',
        confidence: 'low'
      };
    }

    return null;
  }

  /**
   * Identify the binyan pattern
   */
  _identifyPattern(stem) {
    // This is a simplified pattern detection
    // In production, would use more sophisticated morphological analysis

    if (stem.startsWith('מ') && stem.length >= 4) {
      return { name: 'Pa\'al/Pi\'el participle', confidence: 'medium' };
    }

    if (stem.startsWith('ה') && stem.length >= 4) {
      return { name: 'Hif\'il', confidence: 'medium' };
    }

    if (stem.startsWith('הת') && stem.length >= 5) {
      return { name: 'Hitpa\'el', confidence: 'high' };
    }

    if (stem.startsWith('נ') && stem.length >= 4) {
      return { name: 'Nif\'al', confidence: 'medium' };
    }

    return { name: 'Pa\'al (likely)', confidence: 'low' };
  }

  /**
   * Extract consonants from word (remove matres lectionis when used as vowels)
   */
  _extractConsonants(word) {
    const consonants = [];
    const letters = word.split('');

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];

      // Skip if it's clearly a mater lectionis (vowel letter)
      if ((letter === 'ו' || letter === 'י') && i > 0 && i < letters.length - 1) {
        // Simplified check - in production would be more sophisticated
        continue;
      }

      consonants.push(letter);
    }

    return consonants;
  }

  /**
   * Break word into syllables
   * Simplified syllabification based on CV structure
   */
  _syllabify(word) {
    const syllables = [];
    const letters = word.split('');
    let currentSyllable = '';

    // Simplified syllabification
    // Hebrew syllables are generally CV or CVC
    for (let i = 0; i < letters.length; i++) {
      currentSyllable += letters[i];

      // Break at vowel letters or after 2-3 consonants
      if (this._isVowelLetter(letters[i]) || currentSyllable.length >= 3) {
        syllables.push(currentSyllable);
        currentSyllable = '';
      }
    }

    if (currentSyllable) {
      syllables.push(currentSyllable);
    }

    return syllables.length > 0 ? syllables : [word];
  }

  /**
   * Check if letter is typically a vowel (mater lectionis)
   */
  _isVowelLetter(letter) {
    return ['א', 'ו', 'י', 'ה'].includes(letter);
  }

  /**
   * Calculate phonological complexity score
   */
  _calculateComplexity(analysis) {
    let complexity = 0;

    // Base complexity from syllable count
    complexity += analysis.syllables.length;

    // Add complexity for affixes
    complexity += analysis.prefixes.length * 0.5;
    complexity += analysis.suffixes.length * 0.5;

    // Add complexity for rare patterns
    if (analysis.pattern && analysis.pattern.confidence === 'low') {
      complexity += 1;
    }

    // Normalize to 0-10 scale
    return Math.min(Math.round(complexity * 1.5), 10);
  }

  /**
   * Get maximum complexity score appropriate for age group
   */
  _getMaxComplexityForAge(ageGroup) {
    const ageComplexityMap = {
      '2-3': 3,  // Simple 1-2 syllable words
      '3-4': 5,  // 2-3 syllable words with simple prefixes
      '4-6': 8   // More complex words with multiple affixes
    };
    return ageComplexityMap[ageGroup] || 5;
  }

  /**
   * Get all common roots for use in activities
   */
  getAllRoots() {
    return Object.keys(COMMON_HEBREW_ROOTS).map(root => ({
      root,
      ...COMMON_HEBREW_ROOTS[root]
    }));
  }

  /**
   * Get roots appropriate for specific age group
   */
  getRootsForAge(ageGroup) {
    const allRoots = this.getAllRoots();

    // Filter roots based on complexity of their examples
    return allRoots.filter(rootData => {
      const exampleComplexities = rootData.examples.map(word =>
        this.assessComplexity(word)
      );
      const avgComplexity = exampleComplexities.reduce((a, b) => a + b, 0) / exampleComplexities.length;
      return avgComplexity <= this._getMaxComplexityForAge(ageGroup);
    });
  }
}

// Export singleton instance
module.exports = new HebrewMorphologicalAnalyzer();
