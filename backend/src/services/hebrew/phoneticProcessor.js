/**
 * Hebrew Phonetic Processing Module
 *
 * Provides comprehensive phonetic analysis for Hebrew speech therapy:
 * - Phoneme inventory (consonants and vowels)
 * - Age-normed phoneme acquisition data
 * - Phonetic transcription
 * - Articulation difficulty assessment
 * - Sound position analysis (initial, medial, final)
 *
 * Based on Hebrew phonological development research and clinical data
 */

import logger from '../../config/logger.js';

/**
 * Hebrew Consonant Inventory
 * Organized by place and manner of articulation
 */
const HEBREW_CONSONANTS = {
  // Stops (פיצוצים)
  'ב': {
    symbol: 'b',
    ipa: 'b',
    manner: 'stop',
    place: 'bilabial',
    voice: 'voiced',
    dagesh: false,
    name: 'bet'
  },
  'בּ': {
    symbol: 'b',
    ipa: 'b',
    manner: 'stop',
    place: 'bilabial',
    voice: 'voiced',
    dagesh: true,
    name: 'bet with dagesh'
  },
  'פּ': {
    symbol: 'p',
    ipa: 'p',
    manner: 'stop',
    place: 'bilabial',
    voice: 'voiceless',
    dagesh: true,
    name: 'pe with dagesh'
  },
  'ד': {
    symbol: 'd',
    ipa: 'd',
    manner: 'stop',
    place: 'alveolar',
    voice: 'voiced',
    dagesh: false,
    name: 'dalet'
  },
  'ט': {
    symbol: 't',
    ipa: 't',
    manner: 'stop',
    place: 'alveolar',
    voice: 'voiceless',
    name: 'tet'
  },
  'תּ': {
    symbol: 't',
    ipa: 't',
    manner: 'stop',
    place: 'alveolar',
    voice: 'voiceless',
    dagesh: true,
    name: 'tav with dagesh'
  },
  'כּ': {
    symbol: 'k',
    ipa: 'k',
    manner: 'stop',
    place: 'velar',
    voice: 'voiceless',
    dagesh: true,
    name: 'kaf with dagesh'
  },
  'ק': {
    symbol: 'k',
    ipa: 'k',
    manner: 'stop',
    place: 'uvular',
    voice: 'voiceless',
    name: 'qof'
  },
  'ג': {
    symbol: 'g',
    ipa: 'ɡ',
    manner: 'stop',
    place: 'velar',
    voice: 'voiced',
    dagesh: false,
    name: 'gimel'
  },
  'גּ': {
    symbol: 'g',
    ipa: 'ɡ',
    manner: 'stop',
    place: 'velar',
    voice: 'voiced',
    dagesh: true,
    name: 'gimel with dagesh'
  },

  // Fricatives (חוכיות)
  'ו': {
    symbol: 'v',
    ipa: 'v',
    manner: 'fricative',
    place: 'labiodental',
    voice: 'voiced',
    name: 'vav'
  },
  'פ': {
    symbol: 'f',
    ipa: 'f',
    manner: 'fricative',
    place: 'labiodental',
    voice: 'voiceless',
    dagesh: false,
    name: 'fe'
  },
  'ז': {
    symbol: 'z',
    ipa: 'z',
    manner: 'fricative',
    place: 'alveolar',
    voice: 'voiced',
    name: 'zayin'
  },
  'ס': {
    symbol: 's',
    ipa: 's',
    manner: 'fricative',
    place: 'alveolar',
    voice: 'voiceless',
    name: 'samekh'
  },
  'ש': {
    symbol: 'sh',
    ipa: 'ʃ',
    manner: 'fricative',
    place: 'post-alveolar',
    voice: 'voiceless',
    name: 'shin'
  },
  'ח': {
    symbol: 'kh',
    ipa: 'χ',
    manner: 'fricative',
    place: 'uvular',
    voice: 'voiceless',
    name: 'khet'
  },
  'כ': {
    symbol: 'kh',
    ipa: 'χ',
    manner: 'fricative',
    place: 'velar',
    voice: 'voiceless',
    dagesh: false,
    name: 'khaf'
  },
  'ת': {
    symbol: 's',
    ipa: 's',
    manner: 'fricative',
    place: 'alveolar',
    voice: 'voiceless',
    dagesh: false,
    name: 'tav (in some dialects)'
  },

  // Affricates (צירופיות)
  'צ': {
    symbol: 'ts',
    ipa: 'ts',
    manner: 'affricate',
    place: 'alveolar',
    voice: 'voiceless',
    name: 'tsadi'
  },

  // Nasals (אפיות)
  'מ': {
    symbol: 'm',
    ipa: 'm',
    manner: 'nasal',
    place: 'bilabial',
    voice: 'voiced',
    name: 'mem'
  },
  'נ': {
    symbol: 'n',
    ipa: 'n',
    manner: 'nasal',
    place: 'alveolar',
    voice: 'voiced',
    name: 'nun'
  },

  // Liquids (נזילים)
  'ל': {
    symbol: 'l',
    ipa: 'l',
    manner: 'lateral',
    place: 'alveolar',
    voice: 'voiced',
    name: 'lamed'
  },
  'ר': {
    symbol: 'r',
    ipa: 'ʁ',
    manner: 'trill/fricative',
    place: 'uvular',
    voice: 'voiced',
    name: 'resh'
  },

  // Glides (חצאי תנועות)
  'י': {
    symbol: 'y',
    ipa: 'j',
    manner: 'glide',
    place: 'palatal',
    voice: 'voiced',
    name: 'yod'
  },

  // Glottal
  'ה': {
    symbol: 'h',
    ipa: 'h',
    manner: 'fricative',
    place: 'glottal',
    voice: 'voiceless',
    name: 'he'
  },
  'א': {
    symbol: '\'',
    ipa: 'ʔ',
    manner: 'stop',
    place: 'glottal',
    voice: 'voiceless',
    name: 'alef'
  },
  'ע': {
    symbol: '\'',
    ipa: 'ʕ',
    manner: 'fricative',
    place: 'pharyngeal',
    voice: 'voiced',
    name: 'ayin'
  }
};

/**
 * Hebrew Vowel Inventory (with nikud)
 */
const HEBREW_VOWELS = {
  '\u05B7': { symbol: 'a', ipa: 'a', name: 'patach', length: 'short' },      // ַ (patach)
  '\u05B8': { symbol: 'a', ipa: 'ɑ', name: 'kamatz', length: 'long' },       // ָ (kamatz)
  '\u05B6': { symbol: 'e', ipa: 'ɛ', name: 'segol', length: 'short' },       // ֶ (segol)
  '\u05B5': { symbol: 'e', ipa: 'e', name: 'tzere', length: 'long' },        // ֵ (tzere)
  '\u05B4': { symbol: 'i', ipa: 'i', name: 'hiriq', length: 'short' },       // ִ (hiriq)
  '\u05B9': { symbol: 'o', ipa: 'o', name: 'holam', length: 'long' },        // ֹ (holam)
  '\u05BB': { symbol: 'u', ipa: 'u', name: 'kubutz', length: 'short' },      // ֻ (kubutz)
  '\u05B0': { symbol: 'ə', ipa: 'ə', name: 'shva', length: 'ultrashort' },   // ְ (shva)
  '\u05B1': { symbol: 'e', ipa: 'ɛ', name: 'hataf-segol', length: 'ultrashort' }, // ֱ
  '\u05B2': { symbol: 'a', ipa: 'a', name: 'hataf-patach', length: 'ultrashort' }, // ֲ
  '\u05B3': { symbol: 'o', ipa: 'o', name: 'hataf-kamatz', length: 'ultrashort' }  // ֳ
};

/**
 * Age-Normed Phoneme Acquisition Data for Hebrew
 * Based on research on Hebrew-speaking children's phonological development
 *
 * Ages are when 90% of children can produce the sound correctly
 */
const PHONEME_ACQUISITION_AGES = {
  // Early sounds (acquired by age 2-3)
  'early': {
    maxAge: 3,
    phonemes: ['m', 'n', 'b', 'p', 't', 'd', 'h', 'w'],
    letters: ['מ', 'נ', 'ב', 'פּ', 'ט', 'ד', 'ה'],
    description: 'Earliest acquired sounds, suitable for youngest children'
  },

  // Middle sounds (acquired by age 3-4)
  'middle': {
    maxAge: 4,
    phonemes: ['k', 'g', 'f', 'v', 'y', 'l'],
    letters: ['כּ', 'ק', 'ג', 'פ', 'ו', 'י', 'ל'],
    description: 'Moderately challenging sounds for preschoolers'
  },

  // Late sounds (acquired by age 4-6)
  'late': {
    maxAge: 6,
    phonemes: ['s', 'z', 'sh', 'ts', 'r', 'kh'],
    letters: ['ס', 'ז', 'ש', 'צ', 'ר', 'כ', 'ח'],
    description: 'Later acquired sounds, often targets for therapy'
  },

  // Complex sounds (acquired after age 6)
  'complex': {
    maxAge: 8,
    phonemes: ['kh', 'ts', 'r'],
    letters: ['ח', 'צ', 'ר'],
    description: 'Most challenging sounds, common therapy targets'
  }
};

/**
 * Common phonological processes in Hebrew-speaking children
 */
const PHONOLOGICAL_PROCESSES = {
  'stopping': {
    description: 'Replacing fricatives with stops',
    examples: { 'ש': 'ת', 'כ': 'ק', 'ח': 'ק' },
    typicalAge: '2-4'
  },
  'fronting': {
    description: 'Replacing velar/uvular sounds with alveolar',
    examples: { 'כ': 'ת', 'ק': 'ת', 'ג': 'ד' },
    typicalAge: '2-3.5'
  },
  'gliding': {
    description: 'Replacing liquids with glides',
    examples: { 'ר': 'י', 'ל': 'י' },
    typicalAge: '2-5'
  },
  'cluster_reduction': {
    description: 'Simplifying consonant clusters',
    examples: { 'שמ': 'ש', 'בר': 'ב' },
    typicalAge: '2-4'
  },
  'final_consonant_deletion': {
    description: 'Omitting final consonants',
    examples: { 'סוס': 'סו', 'חתול': 'חתו' },
    typicalAge: '2-3'
  }
};

class HebrewPhoneticProcessor {
  /**
   * Analyze phonetic structure of a Hebrew word
   * @param {string} word - Hebrew word (with or without nikud)
   * @returns {Object} Phonetic analysis
   */
  analyzePhonetics(word) {
    if (!word || typeof word !== 'string') {
      return null;
    }

    const analysis = {
      word,
      consonants: this._extractConsonants(word),
      vowels: this._extractVowels(word),
      phonemes: this._extractPhonemes(word),
      syllables: this._syllabify(word),
      articulationDifficulty: 0,
      targetAge: null,
      soundPositions: {}
    };

    analysis.articulationDifficulty = this._calculateArticulationDifficulty(analysis);
    analysis.targetAge = this._determineTargetAge(analysis);
    analysis.soundPositions = this._analyzeSoundPositions(analysis);

    logger.debug(`Phonetic analysis for '${word}':`, analysis);

    return analysis;
  }

  /**
   * Get phonemes appropriate for a specific age group
   * @param {string} ageGroup - Age group ('2-3', '3-4', '4-6')
   * @returns {Array} Array of appropriate phonemes
   */
  getPhonemesForAge(ageGroup) {
    const ageMap = {
      '2-3': ['early'],
      '3-4': ['early', 'middle'],
      '4-6': ['early', 'middle', 'late']
    };

    const categories = ageMap[ageGroup] || ['early'];
    const phonemes = [];

    categories.forEach(category => {
      if (PHONEME_ACQUISITION_AGES[category]) {
        phonemes.push(...PHONEME_ACQUISITION_AGES[category].letters);
      }
    });

    return [...new Set(phonemes)]; // Remove duplicates
  }

  /**
   * Get phoneme information
   * @param {string} letter - Hebrew letter
   * @returns {Object|null} Phoneme data
   */
  getPhonemeInfo(letter) {
    return HEBREW_CONSONANTS[letter] || null;
  }

  /**
   * Find words with specific phoneme in specific position
   * @param {Array} words - Array of Hebrew words
   * @param {string} targetSound - Hebrew letter to target
   * @param {string} position - 'initial', 'medial', or 'final'
   * @returns {Array} Filtered words
   */
  filterBySound(words, targetSound, position = 'any') {
    return words.filter(word => {
      const cleanWord = this._removeNikud(word);
      const positions = this._findSoundPositions(cleanWord, targetSound);

      if (position === 'any') {
        return positions.length > 0;
      }

      return positions.includes(position);
    });
  }

  /**
   * Assess if a word is appropriate for a given age group based on phonetics
   * @param {string} word - Hebrew word
   * @param {string} ageGroup - Age group ('2-3', '3-4', '4-6')
   * @returns {Object} Appropriateness assessment
   */
  assessAgeAppropriateness(word, ageGroup) {
    const analysis = this.analyzePhonetics(word);
    const appropriatePhonemes = this.getPhonemesForAge(ageGroup);

    const wordPhonemes = analysis.consonants.map(c => c.letter);
    const inappropriatePhonemes = wordPhonemes.filter(
      p => !appropriatePhonemes.includes(p)
    );

    return {
      appropriate: inappropriatePhonemes.length === 0,
      inappropriatePhonemes,
      difficulty: analysis.articulationDifficulty,
      targetAge: analysis.targetAge,
      recommendation: inappropriatePhonemes.length === 0
        ? 'Appropriate for age group'
        : `Contains sounds too advanced: ${inappropriatePhonemes.join(', ')}`
    };
  }

  /**
   * Generate minimal pairs for phoneme discrimination
   * @param {string} sound1 - First Hebrew phoneme
   * @param {string} sound2 - Second Hebrew phoneme
   * @returns {Array} Array of minimal pair examples
   */
  generateMinimalPairs(sound1, sound2) {
    // Common minimal pairs in Hebrew for therapy
    const minimalPairs = {
      'ב-פּ': [
        { word1: 'בַּת', word2: 'פַּת', meaning1: 'daughter', meaning2: 'slice' },
        { word1: 'בָּר', word2: 'פָּר', meaning1: 'son', meaning2: 'bull' }
      ],
      'כּ-ת': [
        { word1: 'כַּד', word2: 'תַּד', meaning1: 'pitcher', meaning2: 'peg' },
        { word1: 'כֹּל', word2: 'תֹּל', meaning1: 'all', meaning2: 'mound' }
      ],
      'ש-ס': [
        { word1: 'שָׂם', word2: 'סָם', meaning1: 'put', meaning2: 'drug' },
        { word1: 'שַׁר', word2: 'סַר', meaning1: 'sang', meaning2: 'turned' }
      ],
      'ר-ל': [
        { word1: 'רָץ', word2: 'לָץ', meaning1: 'ran', meaning2: 'jester' },
        { word1: 'רַב', word2: 'לַב', meaning1: 'rabbi', meaning2: 'heart' }
      ],
      'כ-ח': [
        { word1: 'כַּף', word2: 'חַף', meaning1: 'spoon', meaning2: 'innocent' },
        { word1: 'כָּל', word2: 'חָל', meaning1: 'ate', meaning2: 'sand' }
      ]
    };

    const pairKey = `${sound1}-${sound2}`;
    const reversePairKey = `${sound2}-${sound1}`;

    return minimalPairs[pairKey] || minimalPairs[reversePairKey] || [];
  }

  /**
   * Get all consonants organized by manner of articulation
   * Useful for planning articulation hierarchy
   */
  getConsonantsByManner() {
    const byManner = {};

    Object.entries(HEBREW_CONSONANTS).forEach(([letter, data]) => {
      if (!byManner[data.manner]) {
        byManner[data.manner] = [];
      }
      byManner[data.manner].push({ letter, ...data });
    });

    return byManner;
  }

  /**
   * Get all consonants organized by place of articulation
   */
  getConsonantsByPlace() {
    const byPlace = {};

    Object.entries(HEBREW_CONSONANTS).forEach(([letter, data]) => {
      if (!byPlace[data.place]) {
        byPlace[data.place] = [];
      }
      byPlace[data.place].push({ letter, ...data });
    });

    return byPlace;
  }

  /**
   * Get phonological processes typical for age
   */
  getTypicalProcessesForAge(ageGroup) {
    const maxAge = {
      '2-3': 3,
      '3-4': 4,
      '4-6': 6
    }[ageGroup] || 6;

    return Object.entries(PHONOLOGICAL_PROCESSES)
      .filter(([_, data]) => {
        const processMaxAge = parseFloat(data.typicalAge.split('-')[1]);
        return processMaxAge >= maxAge;
      })
      .map(([process, data]) => ({ process, ...data }));
  }

  // ===== PRIVATE METHODS =====

  /**
   * Remove nikud (vowel points) from word
   */
  _removeNikud(word) {
    return word.replace(/[\u0591-\u05C7]/g, '');
  }

  /**
   * Extract consonants from word
   */
  _extractConsonants(word) {
    const cleanWord = this._removeNikud(word);
    const consonants = [];

    for (const letter of cleanWord) {
      if (HEBREW_CONSONANTS[letter]) {
        consonants.push({
          letter,
          ...HEBREW_CONSONANTS[letter]
        });
      }
    }

    return consonants;
  }

  /**
   * Extract vowels from word (nikud marks)
   */
  _extractVowels(word) {
    const vowels = [];

    for (const char of word) {
      if (HEBREW_VOWELS[char]) {
        vowels.push({
          mark: char,
          ...HEBREW_VOWELS[char]
        });
      }
    }

    return vowels;
  }

  /**
   * Extract all phonemes (consonants + vowels)
   */
  _extractPhonemes(word) {
    const consonants = this._extractConsonants(word);
    const vowels = this._extractVowels(word);

    return {
      consonants: consonants.map(c => c.symbol),
      vowels: vowels.map(v => v.symbol),
      count: consonants.length + vowels.length
    };
  }

  /**
   * Syllabify word (simplified)
   */
  _syllabify(word) {
    const cleanWord = this._removeNikud(word);
    const syllables = [];
    let currentSyllable = '';

    // Simplified syllabification based on CV structure
    for (let i = 0; i < cleanWord.length; i++) {
      currentSyllable += cleanWord[i];

      // Break after vowel letters or after 2-3 consonants
      if (['א', 'ו', 'י', 'ה'].includes(cleanWord[i]) || currentSyllable.length >= 3) {
        syllables.push(currentSyllable);
        currentSyllable = '';
      }
    }

    if (currentSyllable) {
      syllables.push(currentSyllable);
    }

    return syllables.length > 0 ? syllables : [cleanWord];
  }

  /**
   * Calculate articulation difficulty (0-10 scale)
   */
  _calculateArticulationDifficulty(analysis) {
    let difficulty = 0;

    // Base difficulty from number of syllables
    difficulty += Math.min(analysis.syllables.length, 5);

    // Add difficulty for late-acquired phonemes
    const latePhonemes = PHONEME_ACQUISITION_AGES.late.letters;
    const complexPhonemes = PHONEME_ACQUISITION_AGES.complex.letters;

    analysis.consonants.forEach(consonant => {
      if (complexPhonemes.includes(consonant.letter)) {
        difficulty += 2;
      } else if (latePhonemes.includes(consonant.letter)) {
        difficulty += 1;
      }
    });

    // Normalize to 0-10
    return Math.min(difficulty, 10);
  }

  /**
   * Determine minimum target age for word
   */
  _determineTargetAge(analysis) {
    let maxAge = 2;

    analysis.consonants.forEach(consonant => {
      Object.entries(PHONEME_ACQUISITION_AGES).forEach(([category, data]) => {
        if (data.letters.includes(consonant.letter)) {
          maxAge = Math.max(maxAge, data.maxAge);
        }
      });
    });

    if (maxAge <= 3) return '2-3';
    if (maxAge <= 4) return '3-4';
    if (maxAge <= 6) return '4-6';
    return '6+';
  }

  /**
   * Find positions of a sound in a word
   */
  _findSoundPositions(word, sound) {
    const positions = [];
    const cleanWord = this._removeNikud(word);

    for (let i = 0; i < cleanWord.length; i++) {
      if (cleanWord[i] === sound) {
        if (i === 0) {
          positions.push('initial');
        } else if (i === cleanWord.length - 1) {
          positions.push('final');
        } else {
          positions.push('medial');
        }
      }
    }

    return [...new Set(positions)];
  }

  /**
   * Analyze sound positions in word
   */
  _analyzeSoundPositions(analysis) {
    const positions = {
      initial: [],
      medial: [],
      final: []
    };

    const cleanWord = this._removeNikud(analysis.word);

    analysis.consonants.forEach((consonant, index) => {
      if (index === 0) {
        positions.initial.push(consonant.letter);
      } else if (index === analysis.consonants.length - 1) {
        positions.final.push(consonant.letter);
      } else {
        positions.medial.push(consonant.letter);
      }
    });

    return positions;
  }
}

// Export singleton instance
export default new HebrewPhoneticProcessor();
