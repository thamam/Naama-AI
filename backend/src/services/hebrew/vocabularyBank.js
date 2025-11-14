/**
 * Clinical Hebrew Vocabulary Bank
 *
 * Curated vocabulary lists for Israeli speech therapy:
 * - Age-appropriate words
 * - Culturally relevant themes
 * - Phonetically organized
 * - Therapeutic value (high-frequency, functional words)
 *
 * Organized by:
 * - Themes (animals, food, family, etc.)
 * - Age groups (2-3, 3-4, 4-6)
 * - Target phonemes
 * - Word complexity
 */

const logger = require('../../config/logger');
const phoneticProcessor = require('./phoneticProcessor');
const morphologicalAnalyzer = require('./morphologicalAnalyzer');

/**
 * Thematic vocabulary organized by age group and cultural relevance
 */
const VOCABULARY_BY_THEME = {
  animals: {
    '2-3': [
      { word: 'כלב', nikud: 'כֶּלֶב', meaning: 'dog', targetSounds: ['כ', 'ל', 'ב'] },
      { word: 'חתול', nikud: 'חָתוּל', meaning: 'cat', targetSounds: ['ח', 'ת', 'ל'] },
      { word: 'ציפור', nikud: 'צִפּוֹר', meaning: 'bird', targetSounds: ['צ', 'פ', 'ר'] },
      { word: 'דג', nikud: 'דָּג', meaning: 'fish', targetSounds: ['ד', 'ג'] },
      { word: 'פרה', nikud: 'פָּרָה', meaning: 'cow', targetSounds: ['פ', 'ר', 'ה'] },
      { word: 'סוס', nikud: 'סוּס', meaning: 'horse', targetSounds: ['ס', 'ו', 'ס'] },
      { word: 'ברווז', nikud: 'בַּרְוָז', meaning: 'duck', targetSounds: ['ב', 'ר', 'ו', 'ז'] }
    ],
    '3-4': [
      { word: 'פיל', nikud: 'פִּיל', meaning: 'elephant', targetSounds: ['פ', 'י', 'ל'] },
      { word: 'ארי', nikud: 'אֲרִי', meaning: 'lion', targetSounds: ['א', 'ר', 'י'] },
      { word: 'ג\'ירפה', nikud: 'גִ\'ירָפָה', meaning: 'giraffe', targetSounds: ['ג', 'ר', 'פ'] },
      { word: 'קוף', nikud: 'קוֹף', meaning: 'monkey', targetSounds: ['ק', 'ו', 'פ'] },
      { word: 'דוב', nikud: 'דֹּב', meaning: 'bear', targetSounds: ['ד', 'ו', 'ב'] },
      { word: 'זאב', nikud: 'זְאֵב', meaning: 'wolf', targetSounds: ['ז', 'א', 'ב'] },
      { word: 'שועל', nikud: 'שׁוּעָל', meaning: 'fox', targetSounds: ['ש', 'ו', 'ע', 'ל'] },
      { word: 'צב', nikud: 'צָב', meaning: 'turtle', targetSounds: ['צ', 'ב'] },
      { word: 'ארנב', nikud: 'אַרְנָב', meaning: 'rabbit', targetSounds: ['א', 'ר', 'נ', 'ב'] }
    ],
    '4-6': [
      { word: 'תנין', nikud: 'תַּנִּין', meaning: 'crocodile', targetSounds: ['ת', 'נ', 'י', 'ן'] },
      { word: 'נמר', nikud: 'נָמֵר', meaning: 'tiger', targetSounds: ['נ', 'מ', 'ר'] },
      { word: 'זברה', nikud: 'זֶבְרָה', meaning: 'zebra', targetSounds: ['ז', 'ב', 'ר'] },
      { word: 'קנגורו', nikud: 'קֶנְגּוּרוּ', meaning: 'kangaroo', targetSounds: ['ק', 'נ', 'ג', 'ר'] },
      { word: 'דולפין', nikud: 'דּוֹלְפִין', meaning: 'dolphin', targetSounds: ['ד', 'ל', 'פ', 'נ'] },
      { word: 'פינגווין', nikud: 'פִּינְגְּוִין', meaning: 'penguin', targetSounds: ['פ', 'נ', 'ג', 'ו', 'ן'] }
    ]
  },

  food: {
    '2-3': [
      { word: 'לחם', nikud: 'לֶחֶם', meaning: 'bread', targetSounds: ['ל', 'ח', 'מ'] },
      { word: 'חלב', nikud: 'חָלָב', meaning: 'milk', targetSounds: ['ח', 'ל', 'ב'] },
      { word: 'מים', nikud: 'מַיִם', meaning: 'water', targetSounds: ['מ', 'י', 'ם'] },
      { word: 'תפוח', nikud: 'תַּפּוּחַ', meaning: 'apple', targetSounds: ['ת', 'פ', 'ח'] },
      { word: 'בננה', nikud: 'בָּנָנָה', meaning: 'banana', targetSounds: ['ב', 'נ', 'ה'] },
      { word: 'עוגה', nikud: 'עוּגָה', meaning: 'cake', targetSounds: ['ע', 'ג', 'ה'] },
      { word: 'ביצה', nikud: 'בֵּיצָה', meaning: 'egg', targetSounds: ['ב', 'צ', 'ה'] }
    ],
    '3-4': [
      { word: 'גבינה', nikud: 'גְּבִינָה', meaning: 'cheese', targetSounds: ['ג', 'ב', 'נ'] },
      { word: 'חמאה', nikud: 'חֶמְאָה', meaning: 'butter', targetSounds: ['ח', 'מ', 'א'] },
      { word: 'דבש', nikud: 'דְּבַשׁ', meaning: 'honey', targetSounds: ['ד', 'ב', 'ש'] },
      { word: 'שוקולד', nikud: 'שׁוֹקוֹלָד', meaning: 'chocolate', targetSounds: ['ש', 'ק', 'ל', 'ד'] },
      { word: 'גלידה', nikud: 'גְּלִידָה', meaning: 'ice cream', targetSounds: ['ג', 'ל', 'ד'] },
      { word: 'עגבניה', nikud: 'עַגְבַּנִיָּה', meaning: 'tomato', targetSounds: ['ע', 'ג', 'ב', 'נ'] },
      { word: 'מלפפון', nikud: 'מְלָפְפוֹן', meaning: 'cucumber', targetSounds: ['מ', 'ל', 'פ', 'נ'] },
      { word: 'גזר', nikud: 'גֶּזֶר', meaning: 'carrot', targetSounds: ['ג', 'ז', 'ר'] }
    ],
    '4-6': [
      { word: 'תותים', nikud: 'תּוּתִים', meaning: 'strawberries', targetSounds: ['ת', 'ו', 'ם'] },
      { word: 'אבטיח', nikud: 'אֲבַטִּיחַ', meaning: 'watermelon', targetSounds: ['א', 'ב', 'ט', 'ח'] },
      { word: 'אננס', nikud: 'אֲנָנָס', meaning: 'pineapple', targetSounds: ['א', 'נ', 'ס'] },
      { word: 'פיצה', nikud: 'פִּיצָה', meaning: 'pizza', targetSounds: ['פ', 'צ', 'ה'] },
      { word: 'המבורגר', nikud: 'הַמְבּוּרְגֶּר', meaning: 'hamburger', targetSounds: ['ה', 'מ', 'ב', 'ר', 'ג'] },
      { word: 'ספגטי', nikud: 'סְפָּגֶטִי', meaning: 'spaghetti', targetSounds: ['ס', 'פ', 'ג', 'ט'] }
    ]
  },

  family: {
    '2-3': [
      { word: 'אבא', nikud: 'אַבָּא', meaning: 'dad', targetSounds: ['א', 'ב', 'א'] },
      { word: 'אמא', nikud: 'אִמָּא', meaning: 'mom', targetSounds: ['א', 'מ', 'א'] },
      { word: 'תינוק', nikud: 'תִּינוֹק', meaning: 'baby', targetSounds: ['ת', 'נ', 'ק'] },
      { word: 'אח', nikud: 'אָח', meaning: 'brother', targetSounds: ['א', 'ח'] },
      { word: 'אחות', nikud: 'אָחוֹת', meaning: 'sister', targetSounds: ['א', 'ח', 'ת'] }
    ],
    '3-4': [
      { word: 'סבא', nikud: 'סָבָא', meaning: 'grandpa', targetSounds: ['ס', 'ב', 'א'] },
      { word: 'סבתא', nikud: 'סָבְתָא', meaning: 'grandma', targetSounds: ['ס', 'ב', 'ת'] },
      { word: 'דוד', nikud: 'דּוֹד', meaning: 'uncle', targetSounds: ['ד', 'ו', 'ד'] },
      { word: 'דודה', nikud: 'דּוֹדָה', meaning: 'aunt', targetSounds: ['ד', 'ו', 'ד', 'ה'] },
      { word: 'בן דוד', nikud: 'בֶּן דּוֹד', meaning: 'cousin (m)', targetSounds: ['ב', 'נ', 'ד'] }
    ],
    '4-6': [
      { word: 'משפחה', nikud: 'מִשְׁפָּחָה', meaning: 'family', targetSounds: ['מ', 'ש', 'פ', 'ח'] },
      { word: 'הורים', nikud: 'הוֹרִים', meaning: 'parents', targetSounds: ['ה', 'ר', 'ם'] },
      { word: 'אחים', nikud: 'אַחִים', meaning: 'siblings', targetSounds: ['א', 'ח', 'ם'] }
    ]
  },

  body_parts: {
    '2-3': [
      { word: 'ראש', nikud: 'רֹאשׁ', meaning: 'head', targetSounds: ['ר', 'ש'] },
      { word: 'עין', nikud: 'עַיִן', meaning: 'eye', targetSounds: ['ע', 'י', 'נ'] },
      { word: 'אף', nikud: 'אַף', meaning: 'nose', targetSounds: ['א', 'פ'] },
      { word: 'פה', nikud: 'פֶּה', meaning: 'mouth', targetSounds: ['פ', 'ה'] },
      { word: 'יד', nikud: 'יָד', meaning: 'hand', targetSounds: ['י', 'ד'] },
      { word: 'רגל', nikud: 'רֶגֶל', meaning: 'leg/foot', targetSounds: ['ר', 'ג', 'ל'] }
    ],
    '3-4': [
      { word: 'אוזן', nikud: 'אֹזֶן', meaning: 'ear', targetSounds: ['א', 'ז', 'נ'] },
      { word: 'שיניים', nikud: 'שִׁנַּיִם', meaning: 'teeth', targetSounds: ['ש', 'נ', 'ם'] },
      { word: 'לשון', nikud: 'לָשׁוֹן', meaning: 'tongue', targetSounds: ['ל', 'ש', 'נ'] },
      { word: 'בטן', nikud: 'בֶּטֶן', meaning: 'belly', targetSounds: ['ב', 'ט', 'נ'] },
      { word: 'גב', nikud: 'גַּב', meaning: 'back', targetSounds: ['ג', 'ב'] },
      { word: 'אצבע', nikud: 'אֶצְבַּע', meaning: 'finger', targetSounds: ['א', 'צ', 'ב', 'ע'] }
    ],
    '4-6': [
      { word: 'כתף', nikud: 'כָּתֵף', meaning: 'shoulder', targetSounds: ['כ', 'ת', 'פ'] },
      { word: 'מרפק', nikud: 'מַרְפֵּק', meaning: 'elbow', targetSounds: ['מ', 'ר', 'פ', 'ק'] },
      { word: 'ברך', nikud: 'בֶּרֶךְ', meaning: 'knee', targetSounds: ['ב', 'ר', 'כ'] },
      { word: 'קרסול', nikud: 'קַרְסוֹל', meaning: 'ankle', targetSounds: ['ק', 'ר', 'ס', 'ל'] }
    ]
  },

  actions: {
    '2-3': [
      { word: 'אוכל', nikud: 'אוֹכֵל', meaning: 'eating', targetSounds: ['א', 'כ', 'ל'], root: 'אכל' },
      { word: 'שותה', nikud: 'שׁוֹתֶה', meaning: 'drinking', targetSounds: ['ש', 'ת', 'ה'], root: 'שתה' },
      { word: 'ישן', nikud: 'יָשֵׁן', meaning: 'sleeping', targetSounds: ['י', 'ש', 'נ'], root: 'ישן' },
      { word: 'הולך', nikud: 'הוֹלֵךְ', meaning: 'walking', targetSounds: ['ה', 'ל', 'כ'], root: 'הלך' },
      { word: 'רץ', nikud: 'רָץ', meaning: 'running', targetSounds: ['ר', 'צ'], root: 'רוץ' }
    ],
    '3-4': [
      { word: 'קופץ', nikud: 'קוֹפֵץ', meaning: 'jumping', targetSounds: ['ק', 'פ', 'צ'], root: 'קפץ' },
      { word: 'רוקד', nikud: 'רוֹקֵד', meaning: 'dancing', targetSounds: ['ר', 'ק', 'ד'], root: 'רקד' },
      { word: 'שר', nikud: 'שָׁר', meaning: 'singing', targetSounds: ['ש', 'ר'], root: 'שיר' },
      { word: 'משחק', nikud: 'מְשַׂחֵק', meaning: 'playing', targetSounds: ['מ', 'ש', 'ח', 'ק'], root: 'שחק' },
      { word: 'צובע', nikud: 'צוֹבֵעַ', meaning: 'painting/coloring', targetSounds: ['צ', 'ב', 'ע'], root: 'צבע' },
      { word: 'בונה', nikud: 'בּוֹנֶה', meaning: 'building', targetSounds: ['ב', 'נ', 'ה'], root: 'בנה' }
    ],
    '4-6': [
      { word: 'מטפס', nikud: 'מְטַפֵּס', meaning: 'climbing', targetSounds: ['מ', 'ט', 'פ', 'ס'], root: 'טפס' },
      { word: 'שוחה', nikud: 'שׂוֹחֶה', meaning: 'swimming', targetSounds: ['ש', 'ח', 'ה'], root: 'שחה' },
      { word: 'רוכב', nikud: 'רוֹכֵב', meaning: 'riding', targetSounds: ['ר', 'כ', 'ב'], root: 'רכב' },
      { word: 'מציי​ר', nikud: 'מְצַיֵּר', meaning: 'drawing', targetSounds: ['מ', 'צ', 'י', 'ר'], root: 'צור' }
    ]
  },

  colors: {
    '2-3': [
      { word: 'אדום', nikud: 'אָדֹם', meaning: 'red', targetSounds: ['א', 'ד', 'מ'] },
      { word: 'כחול', nikud: 'כָּחֹל', meaning: 'blue', targetSounds: ['כ', 'ח', 'ל'] },
      { word: 'צהוב', nikud: 'צָהֹב', meaning: 'yellow', targetSounds: ['צ', 'ה', 'ב'] }
    ],
    '3-4': [
      { word: 'ירוק', nikud: 'יָרֹק', meaning: 'green', targetSounds: ['י', 'ר', 'ק'] },
      { word: 'לבן', nikud: 'לָבָן', meaning: 'white', targetSounds: ['ל', 'ב', 'נ'] },
      { word: 'שחור', nikud: 'שָׁחֹר', meaning: 'black', targetSounds: ['ש', 'ח', 'ר'] },
      { word: 'ורוד', nikud: 'וָרֹד', meaning: 'pink', targetSounds: ['ו', 'ר', 'ד'] },
      { word: 'כתום', nikud: 'כָּתֹם', meaning: 'orange', targetSounds: ['כ', 'ת', 'מ'] }
    ],
    '4-6': [
      { word: 'סגול', nikud: 'סָגֹל', meaning: 'purple', targetSounds: ['ס', 'ג', 'ל'] },
      { word: 'חום', nikud: 'חוּם', meaning: 'brown', targetSounds: ['ח', 'ו', 'מ'] },
      { word: 'אפור', nikud: 'אָפֹר', meaning: 'gray', targetSounds: ['א', 'פ', 'ר'] }
    ]
  },

  israeli_culture: {
    '2-3': [
      { word: 'חלה', nikud: 'חַלָּה', meaning: 'challah bread', targetSounds: ['ח', 'ל', 'ה'] },
      { word: 'שבת', nikud: 'שַׁבָּת', meaning: 'Sabbath', targetSounds: ['ש', 'ב', 'ת'] }
    ],
    '3-4': [
      { word: 'חנוכייה', nikud: 'חֲנֻכִּיָּה', meaning: 'Hanukkah menorah', targetSounds: ['ח', 'נ', 'כ', 'י'] },
      { word: 'סביבון', nikud: 'סְבִיבוֹן', meaning: 'dreidel', targetSounds: ['ס', 'ב', 'י', 'נ'] },
      { word: 'חמסה', nikud: 'חַמְסָה', meaning: 'hamsa', targetSounds: ['ח', 'מ', 'ס'] },
      { word: 'פלאפל', nikud: 'פָלָאפֶל', meaning: 'falafel', targetSounds: ['פ', 'ל', 'א', 'פ', 'ל'] },
      { word: 'חומוס', nikud: 'חֻמּוּס', meaning: 'hummus', targetSounds: ['ח', 'מ', 'ס'] }
    ],
    '4-6': [
      { word: 'ישראל', nikud: 'יִשְׂרָאֵל', meaning: 'Israel', targetSounds: ['י', 'ש', 'ר', 'א', 'ל'] },
      { word: 'ירושלים', nikud: 'יְרוּשָׁלַיִם', meaning: 'Jerusalem', targetSounds: ['י', 'ר', 'ש', 'ל', 'ם'] },
      { word: 'כיפה', nikud: 'כִּיפָּה', meaning: 'kippah', targetSounds: ['כ', 'י', 'פ', 'ה'] }
    ]
  },

  emotions: {
    '2-3': [
      { word: 'שמח', nikud: 'שָׂמֵחַ', meaning: 'happy', targetSounds: ['ש', 'מ', 'ח'] },
      { word: 'עצוב', nikud: 'עָצוּב', meaning: 'sad', targetSounds: ['ע', 'צ', 'ב'] }
    ],
    '3-4': [
      { word: 'כועס', nikud: 'כּוֹעֵס', meaning: 'angry', targetSounds: ['כ', 'ע', 'ס'] },
      { word: 'מפחד', nikud: 'מְפַחֵד', meaning: 'scared', targetSounds: ['מ', 'פ', 'ח', 'ד'] },
      { word: 'נרגש', nikud: 'נִרְגָּשׁ', meaning: 'excited', targetSounds: ['נ', 'ר', 'ג', 'ש'] }
    ],
    '4-6': [
      { word: 'מופתע', nikud: 'מֻפְתָּע', meaning: 'surprised', targetSounds: ['מ', 'פ', 'ת', 'ע'] },
      { word: 'גאה', nikud: 'גֵּאֶה', meaning: 'proud', targetSounds: ['ג', 'א', 'ה'] },
      { word: 'מבולבל', nikud: 'מְבֻלְבָּל', meaning: 'confused', targetSounds: ['מ', 'ב', 'ל', 'ב', 'ל'] }
    ]
  }
};

/**
 * Vocabulary organized by target phoneme
 * Useful for articulation therapy
 */
const VOCABULARY_BY_PHONEME = {
  'ש': {
    initial: ['שולחן', 'שמש', 'שועל', 'שמח', 'שר', 'שותה', 'שחור', 'שבת'],
    medial: ['משחק', 'ישן', 'בושה', 'נושא', 'משפחה'],
    final: ['ראש', 'שמש', 'דש']
  },
  'ר': {
    initial: ['ראש', 'רגל', 'רוקד', 'רץ', 'ריח', 'רעב'],
    medial: ['ברווז', 'גזר', 'פרה', 'עגור', 'ארנב', 'ירוק', 'אדום'],
    final: ['ספר', 'כדור', 'גשר', 'חצר', 'נייר']
  },
  'צ': {
    initial: ['צב', 'ציפור', 'צבע', 'צהוב', 'צעצוע'],
    medial: ['אצבע', 'מצא', 'עצוב'],
    final: ['ביצה', 'רץ', 'קופץ', 'עץ']
  },
  'ל': {
    initial: ['לחם', 'לשון', 'לבן', 'לילה', 'לב'],
    medial: ['ילד', 'כלב', 'בלון', 'חלב', 'חולצה', 'מלפפון'],
    final: ['אוכל', 'גדול', 'קטן', 'סוס', 'ציפור']
  },
  'כ': {
    initial: ['כלב', 'כדור', 'כחול', 'כתום', 'כף', 'כובע'],
    medial: ['מכונית', 'שוקולד', 'זוכר', 'סוכר'],
    final: ['הולך', 'אוכל', 'ספר', 'דרך']
  },
  'ח': {
    initial: ['חתול', 'חלב', 'חלה', 'חום', 'חולצה', 'חלון'],
    medial: ['שוחה', 'פותח', 'מפתח'],
    final: ['תפוח', 'לוח', 'רוח', 'בוקר']
  }
};

class VocabularyBank {
  /**
   * Get vocabulary for specific theme and age group
   * @param {string} theme - Theme name
   * @param {string} ageGroup - Age group ('2-3', '3-4', '4-6')
   * @returns {Array} Array of vocabulary items
   */
  getVocabularyByTheme(theme, ageGroup) {
    const themeData = VOCABULARY_BY_THEME[theme];
    if (!themeData) {
      logger.warn(`Theme '${theme}' not found in vocabulary bank`);
      return [];
    }

    const ageData = themeData[ageGroup];
    if (!ageData) {
      logger.warn(`Age group '${ageGroup}' not found for theme '${theme}'`);
      return [];
    }

    return ageData;
  }

  /**
   * Get all available themes
   * @returns {Array} Array of theme names
   */
  getAvailableThemes() {
    return Object.keys(VOCABULARY_BY_THEME);
  }

  /**
   * Get vocabulary for specific target sound
   * @param {string} targetSound - Hebrew letter to target
   * @param {string} position - 'initial', 'medial', 'final', or 'any'
   * @param {string} ageGroup - Optional age group filter
   * @returns {Array} Array of words with target sound
   */
  getVocabularyByPhoneme(targetSound, position = 'any', ageGroup = null) {
    const phonemeData = VOCABULARY_BY_PHONEME[targetSound];
    if (!phonemeData) {
      logger.warn(`Phoneme '${targetSound}' not found in vocabulary bank`);
      return [];
    }

    let words = [];

    if (position === 'any') {
      words = [
        ...(phonemeData.initial || []),
        ...(phonemeData.medial || []),
        ...(phonemeData.final || [])
      ];
    } else {
      words = phonemeData[position] || [];
    }

    // Filter by age if specified
    if (ageGroup) {
      words = words.filter(word => {
        const complexity = morphologicalAnalyzer.assessComplexity(word);
        const maxComplexity = {
          '2-3': 3,
          '3-4': 5,
          '4-6': 8
        }[ageGroup] || 5;
        return complexity <= maxComplexity;
      });
    }

    return words;
  }

  /**
   * Get random vocabulary items
   * @param {Object} criteria - Selection criteria
   * @returns {Array} Random vocabulary items
   */
  getRandomVocabulary(criteria = {}) {
    const {
      count = 10,
      theme = null,
      ageGroup = '3-4',
      targetSound = null,
      position = 'any'
    } = criteria;

    let vocabulary = [];

    if (targetSound) {
      vocabulary = this.getVocabularyByPhoneme(targetSound, position, ageGroup);
    } else if (theme) {
      vocabulary = this.getVocabularyByTheme(theme, ageGroup);
    } else {
      // Get from all themes
      vocabulary = this.getAllVocabularyForAge(ageGroup);
    }

    // Shuffle and return requested count
    const shuffled = vocabulary.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get all vocabulary for an age group across all themes
   * @param {string} ageGroup - Age group
   * @returns {Array} All vocabulary for age
   */
  getAllVocabularyForAge(ageGroup) {
    const allVocab = [];

    Object.keys(VOCABULARY_BY_THEME).forEach(theme => {
      const themeVocab = this.getVocabularyByTheme(theme, ageGroup);
      allVocab.push(...themeVocab);
    });

    return allVocab;
  }

  /**
   * Search vocabulary by meaning or word
   * @param {string} query - Search query
   * @returns {Array} Matching vocabulary items
   */
  searchVocabulary(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    Object.values(VOCABULARY_BY_THEME).forEach(themeData => {
      Object.values(themeData).forEach(ageData => {
        ageData.forEach(item => {
          if (
            item.word.includes(query) ||
            item.meaning.toLowerCase().includes(lowerQuery) ||
            item.nikud.includes(query)
          ) {
            results.push(item);
          }
        });
      });
    });

    return results;
  }

  /**
   * Get vocabulary statistics
   * @returns {Object} Statistics about vocabulary bank
   */
  getStatistics() {
    let totalWords = 0;
    const byTheme = {};
    const byAge = { '2-3': 0, '3-4': 0, '4-6': 0 };

    Object.entries(VOCABULARY_BY_THEME).forEach(([theme, themeData]) => {
      byTheme[theme] = 0;

      Object.entries(themeData).forEach(([age, words]) => {
        const count = words.length;
        totalWords += count;
        byTheme[theme] += count;
        byAge[age] += count;
      });
    });

    return {
      totalWords,
      totalThemes: Object.keys(VOCABULARY_BY_THEME).length,
      totalPhonemes: Object.keys(VOCABULARY_BY_PHONEME).length,
      byTheme,
      byAge
    };
  }

  /**
   * Get word pairs for minimal pair therapy
   * @param {string} sound1 - First phoneme
   * @param {string} sound2 - Second phoneme
   * @returns {Array} Minimal pairs
   */
  getMinimalPairs(sound1, sound2) {
    return phoneticProcessor.generateMinimalPairs(sound1, sound2);
  }

  /**
   * Get culturally relevant vocabulary
   * Focuses on Israeli culture and holidays
   * @param {string} ageGroup - Age group
   * @returns {Array} Israeli cultural vocabulary
   */
  getCulturalVocabulary(ageGroup) {
    return this.getVocabularyByTheme('israeli_culture', ageGroup);
  }

  /**
   * Get high-frequency functional words
   * Most useful words for daily communication
   * @param {string} ageGroup - Age group
   * @returns {Array} High-frequency words
   */
  getHighFrequencyWords(ageGroup) {
    // Combine family, actions, body parts, and emotions
    const themes = ['family', 'actions', 'body_parts', 'emotions', 'food'];
    const words = [];

    themes.forEach(theme => {
      words.push(...this.getVocabularyByTheme(theme, ageGroup));
    });

    return words;
  }

  /**
   * Create custom vocabulary list
   * @param {Array} words - Array of Hebrew words
   * @returns {Array} Enriched vocabulary items
   */
  enrichVocabulary(words) {
    return words.map(word => {
      const phonetics = phoneticProcessor.analyzePhonetics(word);
      const morphology = morphologicalAnalyzer.analyzeWord(word);

      return {
        word,
        phonetics,
        morphology,
        complexity: morphology.phonologicalComplexity,
        targetAge: phonetics.targetAge
      };
    });
  }
}

// Export singleton instance
module.exports = new VocabularyBank();
