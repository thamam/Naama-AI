# Phase 2: Hebrew Specialization & Local LLM Integration

## Overview

Phase 2 enhances Naama-AI with advanced Hebrew linguistic processing and local Hebrew LLM integration, enabling cost-effective, high-quality Hebrew speech therapy content generation.

**Completion Date:** November 2025
**Status:** ✅ Complete

---

## Key Features Implemented

### 1. Local Hebrew LLM Integration

#### DictaLM 2.0 Support
- **Model:** DictaLM 2.0-Instruct - open-source Hebrew-focused language model
- **Deployment:** Via Ollama, LM Studio, vLLM, or any OpenAI-compatible server
- **Benefits:**
  - Cost-effective for high-volume Hebrew generation
  - Superior Hebrew linguistic accuracy
  - Privacy-preserving (runs locally)
  - Israeli clinical context awareness

#### Intelligent Routing & Failover
- **Hybrid Architecture:**
  - Hebrew requests → Local DictaLM 2.0 (when available)
  - Non-Hebrew/complex requests → Claude API
  - Automatic failover if local model unavailable
- **Health Monitoring:**
  - Periodic health checks every 5 minutes
  - Automatic fallback to Claude if local service down
  - Transparent error handling and logging

#### Configuration
Add to `.env`:
```bash
# Enable local Hebrew LLM
LOCAL_HEBREW_LLM_ENABLED=true
LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:11434
LOCAL_HEBREW_LLM_MODEL=dicta-il/dictalm2.0-instruct
LOCAL_HEBREW_LLM_BACKEND=ollama
LOCAL_HEBREW_LLM_MAX_TOKENS=2048
LOCAL_HEBREW_LLM_TEMPERATURE=0.7
LOCAL_HEBREW_LLM_TIMEOUT=120000
```

---

### 2. Hebrew Linguistic Processing Pipeline

#### Morphological Analysis (`morphologicalAnalyzer.js`)
Comprehensive Hebrew morphological analysis including:

**Features:**
- **Root Extraction (שורש):** Identifies 3-letter Hebrew roots
- **Pattern Recognition (משקל):** Detects binyanim (pa'al, pi'el, hif'il, etc.)
- **Affix Analysis:** Identifies prefixes (ה, ו, ב, כ, ל, מ, ש) and suffixes
- **Word Family Generation:** Groups words by shared roots
- **Complexity Assessment:** 0-10 scale for therapeutic difficulty

**Example Usage:**
```javascript
const morphologicalAnalyzer = require('./services/hebrew/morphologicalAnalyzer');

// Analyze a word
const analysis = morphologicalAnalyzer.analyzeWord('כותב');
// Returns: {
//   root: { letters: ['כ', 'ת', 'ב'], meaning: 'write', confidence: 'high' },
//   pattern: { name: 'Pa\'al participle', confidence: 'medium' },
//   prefixes: [],
//   suffixes: [],
//   syllables: ['כו', 'תב'],
//   phonologicalComplexity: 4
// }

// Get word family
const family = morphologicalAnalyzer.getWordFamily('כתב');
// Returns: ['כותב', 'כתיבה', 'מכתב']

// Filter by age
const words = ['כלב', 'משפחה', 'מתנפח'];
const ageAppropriate = morphologicalAnalyzer.filterByComplexity(words, '2-3');
```

**Data:**
- 20+ common Hebrew roots with examples
- 5 major binyanim patterns
- Prefix and suffix parsing rules

---

#### Phonetic Processing (`phoneticProcessor.js`)
Clinical-grade Hebrew phonetic analysis:

**Features:**
- **Phoneme Inventory:** Complete Hebrew consonant and vowel systems
- **Age-Normed Acquisition:** Based on research on Hebrew phonological development
  - Early sounds (age 2-3): מ, נ, ב, פּ, ט, ד, ה
  - Middle sounds (age 3-4): כּ, ק, ג, פ, ו, י, ל
  - Late sounds (age 4-6): ס, ז, ש, צ, ר, כ, ח
- **Articulation Difficulty:** 0-10 scale based on sound complexity
- **Sound Position Analysis:** Initial, medial, final position tracking
- **Minimal Pairs:** Phoneme discrimination pairs for therapy
- **Phonological Processes:** Stopping, fronting, gliding, cluster reduction

**Example Usage:**
```javascript
const phoneticProcessor = require('./services/hebrew/phoneticProcessor');

// Analyze phonetics
const analysis = phoneticProcessor.analyzePhonetics('שמח');
// Returns: {
//   consonants: [{ letter: 'ש', ipa: 'ʃ', manner: 'fricative', ... }],
//   vowels: [...],
//   articulationDifficulty: 6,
//   targetAge: '4-6',
//   soundPositions: { initial: ['ש'], medial: ['מ'], final: ['ח'] }
// }

// Get appropriate phonemes for age
const phonemes = phoneticProcessor.getPhonemesForAge('2-3');
// Returns: ['מ', 'נ', 'ב', 'פּ', 'ט', 'ד', 'ה']

// Filter words by target sound
const words = ['שלום', 'כלב', 'שמש', 'בית'];
const withShin = phoneticProcessor.filterBySound(words, 'ש', 'initial');
// Returns: ['שלום', 'שמש']

// Generate minimal pairs
const pairs = phoneticProcessor.generateMinimalPairs('ב', 'פּ');
// Returns: [
//   { word1: 'בַּת', word2: 'פַּת', meaning1: 'daughter', meaning2: 'slice' },
//   ...
// ]
```

---

#### Nikud Assignment (`nikudAssigner.js`)
Dynamic vowel point (nikud) assignment system:

**Features:**
- **Age-Specific Nikud:** Adjusts vowel coverage based on age group
  - 2-3 years: 90%+ coverage (full nikud)
  - 3-4 years: 80%+ coverage (full nikud)
  - 4-6 years: 50%+ coverage (partial nikud)
- **Dictionary-Based:** 100+ common words with correct nikud
- **Rule-Based Fallback:** Intelligent nikud guessing for unknown words
- **Nikud Validation:** Checks correctness against dictionary
- **Statistics:** Coverage analysis and nikud type counting

**Example Usage:**
```javascript
const nikudAssigner = require('./services/hebrew/nikudAssigner');

// Add nikud based on age
const text = 'הילד אוכל תפוח';
const withNikud = nikudAssigner.assignNikud(text, {
  ageGroup: '2-3',
  nikudLevel: 'auto' // or 'full', 'partial', 'minimal'
});
// Returns: 'הַיֶּלֶד אוֹכֵל תַּפּוּחַ'

// Get statistics
const stats = nikudAssigner.getNikudStatistics(withNikud);
// Returns: {
//   totalCharacters: 19,
//   nikudMarks: 12,
//   coverage: 85.7,
//   nikudTypes: { PATACH: 3, TZERE: 2, ... }
// }

// Validate nikud
const validation = nikudAssigner.validateNikud('אוֹכֵל', 'אוכל');
// Returns: { isValid: true, message: 'Correct nikud' }

// Get common words with nikud for age
const words = nikudAssigner.getCommonWordsWithNikud('2-3');
```

---

#### Clinical Vocabulary Bank (`vocabularyBank.js`)
Curated, age-appropriate Hebrew vocabulary:

**Features:**
- **8 Thematic Categories:**
  - Animals (חיות)
  - Food (אוכל)
  - Family (משפחה)
  - Body Parts (חלקי גוף)
  - Actions (פעולות)
  - Colors (צבעים)
  - Israeli Culture (תרבות ישראלית)
  - Emotions (רגשות)
- **Age-Graded:** Separate word lists for 2-3, 3-4, 4-6 age groups
- **Phonetically Organized:** Words tagged by target sounds
- **Cultural Relevance:** Israeli-specific content (falafel, hummus, Shabbat, etc.)
- **180+ Words Total:** High-frequency, functional vocabulary

**Example Usage:**
```javascript
const vocabularyBank = require('./services/hebrew/vocabularyBank');

// Get vocabulary by theme
const animals = vocabularyBank.getVocabularyByTheme('animals', '2-3');
// Returns: [
//   { word: 'כלב', nikud: 'כֶּלֶב', meaning: 'dog', targetSounds: ['כ', 'ל', 'ב'] },
//   { word: 'חתול', nikud: 'חָתוּל', meaning: 'cat', targetSounds: ['ח', 'ת', 'ל'] },
//   ...
// ]

// Get by target phoneme
const wordsWithR = vocabularyBank.getVocabularyByPhoneme('ר', 'initial', '3-4');
// Returns: ['ראש', 'רגל', 'רוקד', 'רץ', 'ריח', 'רעב']

// Get random vocabulary
const random = vocabularyBank.getRandomVocabulary({
  count: 6,
  theme: 'food',
  ageGroup: '3-4'
});

// Get Israeli cultural vocabulary
const cultural = vocabularyBank.getCulturalVocabulary('3-4');
// Returns: [
//   { word: 'חנוכייה', meaning: 'Hanukkah menorah', ... },
//   { word: 'סביבון', meaning: 'dreidel', ... },
//   ...
// ]

// Search vocabulary
const results = vocabularyBank.searchVocabulary('dog');
// Returns all vocabulary items matching 'dog' or 'כלב'

// Get statistics
const stats = vocabularyBank.getStatistics();
// Returns: {
//   totalWords: 180,
//   totalThemes: 8,
//   totalPhonemes: 6,
//   byTheme: { animals: 25, food: 30, ... },
//   byAge: { '2-3': 50, '3-4': 70, '4-6': 60 }
// }
```

---

#### Content Validation (`contentValidator.js`)
Comprehensive validation for Hebrew activities:

**Features:**
- **Multi-Dimensional Validation:**
  - Nikud coverage (age-appropriate)
  - Vocabulary complexity
  - Phonetic appropriateness
  - Structural integrity
  - Cultural relevance
- **Scoring System:** 0-100 for each dimension + overall
- **Error, Warning, Suggestion System:**
  - Errors: Critical issues blocking activity use
  - Warnings: Non-critical concerns
  - Suggestions: Improvement recommendations
- **Age-Specific Rules:** Different thresholds for each age group

**Example Usage:**
```javascript
const contentValidator = require('./services/hebrew/contentValidator');

// Validate complete activity
const validation = contentValidator.validateActivity(content, {
  activityType: 'articulation',
  ageGroup: '3-4',
  language: 'he',
  targetSound: 'ש'
});

// Returns: {
//   isValid: true,
//   errors: [],
//   warnings: [
//     { type: 'nikud_coverage', message: '...', severity: 'warning' }
//   ],
//   scores: {
//     nikud: 85,
//     vocabulary: 92,
//     phonetics: 88,
//     structure: 100,
//     overall: 91.25
//   },
//   suggestions: [
//     { type: 'add_nikud', message: 'Consider adding...', priority: 'medium' }
//   ]
// }

// Validate nikud only
const nikudValidation = contentValidator.validateNikud(text, '2-3');

// Validate word
const wordValidation = contentValidator.validateWord('משחק');

// Validate age appropriateness
const ageValidation = contentValidator.validateAgeAppropriateness(words, '2-3');

// Validate target sound presence
const soundValidation = contentValidator.validateTargetSound(words, 'ש', 'initial');

// Extract Hebrew words
const words = contentValidator.extractHebrewWords(content);

// Get summary
const summary = contentValidator.getValidationSummary(validation);
// Returns: "Overall Score: 91.3/100\n✓ Content passes all validation checks\n⚠ 1 warning(s)..."
```

---

### 3. Database Schema Extensions

#### Enhanced Activity Model

**New Activity Types:**
- `rhyming`: Hebrew rhyming activities
- `morphological`: Root and pattern recognition
- `prosody`: Rhythm and intonation practice
- `bilingual`: Hebrew-English mixed activities

**Hebrew Linguistics Metadata:**
```javascript
hebrewLinguistics: {
  // Phonetic tracking
  targetPhonemes: ['ש', 'ר'],
  phonemePositions: { initial: 5, medial: 3, final: 2 },
  phonologicalComplexity: 6.5,

  // Morphological tracking
  rootsUsed: [
    { root: 'שחק', meaning: 'play', occurrences: 3 },
    { root: 'רוץ', meaning: 'run', occurrences: 2 }
  ],
  patternsUsed: ['Pa\'al', 'Pi\'el'],
  morphologicalComplexity: 5.2,

  // Nikud tracking
  nikudLevel: 'full',
  nikudCoverage: 92.5,

  // Vocabulary metadata
  vocabularyThemes: ['actions', 'animals'],
  vocabularyComplexity: 4.8,
  culturalRelevance: true,

  // Quality metrics
  validationScore: 91.3,
  validationWarnings: [],
  ageAppropriateScore: 95,
  inappropriateWords: []
}
```

**Bilingual Metadata:**
```javascript
bilingualMetadata: {
  primaryLanguage: 'he',
  secondaryLanguage: 'en',
  translationPairs: 6,
  codeSwitch: true
}
```

**New Database Indexes:**
- `{ language: 1, type: 1, ageGroup: 1 }` - Hebrew activity filtering
- `{ 'hebrewLinguistics.targetPhonemes': 1 }` - Phoneme-based search
- `{ 'hebrewLinguistics.vocabularyThemes': 1 }` - Theme-based search

**New Model Method:**
```javascript
// Automatically populate Hebrew metadata
await activity.populateHebrewMetadata(hebrewServices);
```

---

### 4. Deployment Setup

#### Installing Ollama (Recommended for Local LLM)

**On Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**On macOS:**
```bash
brew install ollama
```

**On Windows:**
Download from https://ollama.com/download

#### Installing DictaLM 2.0

```bash
# Pull the model (requires ~8GB disk space)
ollama pull dicta-il/dictalm2.0-instruct

# Verify installation
ollama list

# Test the model
ollama run dicta-il/dictalm2.0-instruct "שלום, איך אתה?"
```

#### Starting Ollama Server

```bash
# Start Ollama server (default: localhost:11434)
ollama serve

# Or start with custom host/port
OLLAMA_HOST=0.0.0.0:8080 ollama serve
```

#### Alternative: LM Studio

1. Download LM Studio: https://lmstudio.ai/
2. Search for "DictaLM" in model library
3. Download DictaLM 2.0-Instruct
4. Start local server (default: localhost:1234)
5. Update `.env`:
   ```bash
   LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:1234
   LOCAL_HEBREW_LLM_BACKEND=lmstudio
   ```

#### Hardware Recommendations

**Minimum (CPU only):**
- CPU: 4+ cores
- RAM: 16GB
- Disk: 10GB free
- Speed: 20-60 seconds per generation

**Recommended (GPU accelerated):**
- GPU: NVIDIA with 8GB+ VRAM (RTX 3060 or better)
- RAM: 16GB system RAM
- Disk: 10GB free
- Speed: 2-10 seconds per generation

**Quantization Options:**
- Q4: Smallest, fastest, good quality (~4GB)
- Q5: Balanced (~5GB)
- Q8: Best quality, slower (~8GB)
- FP16: Full precision (~12GB)

---

## Architecture

### Hybrid LLM Strategy

```
Request Flow:
┌─────────────────────┐
│ Activity Generation │
│      Request        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│  LLMFactory Router      │
│                         │
│  Is Hebrew?   ┌────────┐│
│  Is Simple?   │ YES    ││
│  Local Up?    └────┬───┘│
└──────────────────┬─┴────┘
                   │   │
          ┌────────┘   └─────────┐
          │                      │
          ▼                      ▼
┌──────────────────┐  ┌─────────────────┐
│  Local Hebrew    │  │  Claude API     │
│  DictaLM 2.0     │  │  (Fallback)     │
│                  │  │                 │
│  Pros:           │  │  Pros:          │
│  - Free          │  │  - Fast cloud   │
│  - Private       │  │  - Always up    │
│  - Hebrew expert │  │  - English OK   │
│                  │  │                 │
│  Cons:           │  │  Cons:          │
│  - Need GPU      │  │  - Costs $      │
│  - Local only    │  │  - Privacy      │
└──────────────────┘  └─────────────────┘
```

### Hebrew Processing Pipeline

```
Hebrew Activity Generation:
┌───────────────────┐
│  1. Generate      │
│     (LLM)         │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  2. Add Nikud     │
│     (Auto)        │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  3. Validate      │
│     (Multi-dim)   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  4. Analyze       │
│     Linguistics   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  5. Store with    │
│     Metadata      │
└───────────────────┘
```

---

## API Usage Examples

### Generate Hebrew Activity with Local LLM

```javascript
// POST /api/activities/generate
{
  "activityType": "articulation",
  "ageGroup": "3-4",
  "language": "he",
  "targetSound": "ש",
  "theme": "animals",
  "soundPosition": "initial",
  "itemCount": 6
}

// Response:
{
  "success": true,
  "data": {
    "activity": {
      "_id": "...",
      "type": "articulation",
      "language": "he",
      "content": {
        "title": "תרגול צליל ש׳",
        "instructions": "הצביעו על התמונות והגידו את השמות בקול רם",
        "items": [
          { "word": "שׁוּעָל", "image": "fox", "meaning": "fox" },
          { "word": "שֶׁמֶשׁ", "image": "sun", "meaning": "sun" },
          ...
        ]
      },
      "hebrewLinguistics": {
        "targetPhonemes": ["ש"],
        "nikudLevel": "full",
        "nikudCoverage": 95,
        "phonologicalComplexity": 5.5,
        "validationScore": 92,
        "ageAppropriateScore": 98
      },
      "llmProvider": "local_hebrew_ollama",
      "llmModel": "dicta-il/dictalm2.0-instruct",
      "llmTokensUsed": 245,
      "generationTime": 3500
    }
  }
}
```

### Get Provider Status

```javascript
// GET /api/llm/status

// Response:
{
  "default": "anthropic",
  "hebrewProvider": "local_hebrew",
  "hebrewRoutingEnabled": true,
  "hebrewProviderAvailable": true,
  "providers": {
    "anthropic": { "available": true, "type": "cloud" },
    "local_hebrew": {
      "available": true,
      "responseTime": 125,
      "endpoint": "http://localhost:11434",
      "backend": "ollama",
      "model": "dicta-il/dictalm2.0-instruct"
    }
  }
}
```

---

## Cost Analysis

### Cloud vs. Local Comparison

**Scenario: 1,000 Hebrew activities/month**

#### Cloud Only (Phase 1):
- Cost per activity: ~$0.015 (Claude Haiku)
- Monthly cost: **$15**
- Annual cost: **$180**

#### Hybrid (Phase 2):
- Local LLM: 900 activities (90%) → **$0**
- Cloud fallback: 100 activities (10%) → **$1.50**
- Monthly cost: **$1.50**
- Annual cost: **$18**
- **Savings: $162/year (90% reduction)**

#### Hardware Investment:
- Mid-range GPU (RTX 4060): ~$300
- Payback period: **~2 months** at 1,000 activities/month

**Break-even Points:**
- 100 activities/month: ~20 months
- 500 activities/month: ~4 months
- 1,000 activities/month: ~2 months
- 5,000 activities/month: ~2 weeks

---

## Testing

### Run Hebrew Service Tests

```bash
cd backend
npm test services/hebrew
```

### Manual Testing

```javascript
// Test morphological analyzer
const morphologicalAnalyzer = require('./src/services/hebrew/morphologicalAnalyzer');
console.log(morphologicalAnalyzer.analyzeWord('משחק'));

// Test phonetic processor
const phoneticProcessor = require('./src/services/hebrew/phoneticProcessor');
console.log(phoneticProcessor.analyzePhonetics('שלום'));

// Test nikud assigner
const nikudAssigner = require('./src/services/hebrew/nikudAssigner');
console.log(nikudAssigner.assignNikud('הילד אוכל', { ageGroup: '2-3' }));

// Test vocabulary bank
const vocabularyBank = require('./src/services/hebrew/vocabularyBank');
console.log(vocabularyBank.getVocabularyByTheme('animals', '2-3'));

// Test content validator
const contentValidator = require('./src/services/hebrew/contentValidator');
console.log(contentValidator.validateWord('כלב'));
```

### Test Local LLM Integration

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Test generation
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "dicta-il/dictalm2.0-instruct",
  "prompt": "צור רשימה של 5 חיות בעברית",
  "stream": false
}'
```

---

## Troubleshooting

### Local LLM Not Available

**Problem:** Hebrew routing disabled, falling back to Claude
**Solutions:**
1. Check Ollama is running: `ollama list`
2. Verify endpoint in `.env`: `LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:11434`
3. Check model is installed: `ollama pull dicta-il/dictalm2.0-instruct`
4. Enable routing: `LOCAL_HEBREW_LLM_ENABLED=true`
5. Restart backend server

### Slow Generation Times

**Problem:** Local LLM takes 30+ seconds per request
**Solutions:**
1. Use GPU acceleration (CUDA for NVIDIA)
2. Use smaller quantization (Q4 instead of FP16)
3. Reduce max tokens: `LOCAL_HEBREW_LLM_MAX_TOKENS=1024`
4. Increase timeout: `LOCAL_HEBREW_LLM_TIMEOUT=180000`

### Nikud Issues

**Problem:** Generated text has incorrect or missing nikud
**Solutions:**
1. Increase nikud level: `nikudLevel: 'full'`
2. Use dictionary words from vocabularyBank
3. Manually validate with `nikudAssigner.validateNikud()`
4. Check age group settings

### Database Migration

**Problem:** Existing activities don't have Hebrew metadata
**Solution:**
```javascript
// Populate metadata for existing Hebrew activities
const Activity = require('./models/Activity');
const hebrewServices = require('./services/hebrew');

const activities = await Activity.find({ language: 'he' });
for (const activity of activities) {
  await activity.populateHebrewMetadata(hebrewServices);
}
```

---

## Future Enhancements (Phase 3+)

### Short-term (Next 3-6 months)
- [ ] Fine-tune DictaLM 2.0 on speech therapy data
- [ ] Add more Hebrew activity types (rhyming, prosody)
- [ ] Build analytics dashboard for Hebrew metrics
- [ ] Implement bilingual Hebrew-English activities
- [ ] Add audio pronunciation guides

### Long-term (6-18 months)
- [ ] Multi-modal support (images + Hebrew text)
- [ ] Real-time progress tracking with Hebrew phoneme charts
- [ ] Parent/therapist collaboration features
- [ ] Mobile app with offline Hebrew LLM
- [ ] Integration with Israeli health system APIs

---

## Contributors

**Phase 2 Lead:** Claude (AI Assistant)
**Project Owner:** Naama-AI Team
**Model Provider:** Dicta (DictaLM 2.0)
**LLM Infrastructure:** Ollama Project

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/thamam/Naama-AI/issues
- Documentation: See README.md
- Hebrew LLM Docs: https://docs.claude.com/en/docs/claude-code/
