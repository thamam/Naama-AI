import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  // User who generated this activity
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Activity metadata
  type: {
    type: String,
    enum: ['picture_matching', 'sequencing', 'articulation', 'rhyming', 'morphological', 'prosody', 'bilingual'],
    required: true
  },
  ageGroup: {
    type: String,
    enum: ['2-3', '3-4', '4-6'],
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'he'],
    default: 'en'
  },

  // Generation inputs
  inputPrompt: {
    type: String,
    required: true
  },
  targetSound: String,
  theme: String,
  customization: {
    difficulty: String,
    colorTheme: String,
    itemCount: Number
  },

  // Generated content
  content: {
    title: String,
    instructions: String,
    items: [{
      type: mongoose.Schema.Types.Mixed
    }],
    metadata: mongoose.Schema.Types.Mixed
  },

  // Hebrew Linguistic Metadata (Phase 2)
  hebrewLinguistics: {
    // Phonetic data
    targetPhonemes: [String], // Hebrew letters targeted in activity
    phonemePositions: { // Where target sounds appear
      initial: Number,
      medial: Number,
      final: Number
    },
    phonologicalComplexity: Number, // 0-10 scale

    // Morphological data
    rootsUsed: [{ // Hebrew roots (שורשים) used
      root: String,
      meaning: String,
      occurrences: Number
    }],
    patternsUsed: [String], // Binyanim patterns used
    morphologicalComplexity: Number, // 0-10 scale

    // Nikud data
    nikudLevel: {
      type: String,
      enum: ['none', 'minimal', 'partial', 'full']
    },
    nikudCoverage: Number, // Percentage of words with nikud

    // Vocabulary metadata
    vocabularyThemes: [String], // Themes used (animals, food, etc.)
    vocabularyComplexity: Number, // Average word complexity
    culturalRelevance: Boolean, // Contains Israeli cultural content

    // Validation results
    validationScore: Number, // 0-100 from content validator
    validationWarnings: [String],

    // Age appropriateness
    ageAppropriateScore: Number, // 0-100
    inappropriateWords: [String] // Words that may be too complex
  },

  // Bilingual support metadata (for Hebrew-English activities)
  bilingualMetadata: {
    primaryLanguage: String, // 'he' or 'en'
    secondaryLanguage: String,
    translationPairs: Number, // Count of word pairs
    codeSwitch: Boolean // Whether activity includes code-switching
  },

  // LLM Generation info
  llmProvider: {
    type: String,
    default: 'anthropic'
  },
  llmModel: String,
  llmTokensUsed: Number,
  generationTime: Number, // milliseconds

  // Version control
  version: {
    type: Number,
    default: 1
  },
  parentActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },

  // Usage tracking
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: Date,

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
activitySchema.index({ userId: 1, type: 1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, ageGroup: 1 });
activitySchema.index({ language: 1, type: 1, ageGroup: 1 }); // Phase 2: Hebrew filtering
activitySchema.index({ 'hebrewLinguistics.targetPhonemes': 1 }); // Phase 2: Phoneme search
activitySchema.index({ 'hebrewLinguistics.vocabularyThemes': 1 }); // Phase 2: Theme search

// Method to track usage
activitySchema.methods.recordUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

// Method to populate Hebrew linguistic metadata
activitySchema.methods.populateHebrewMetadata = async function(hebrewServices) {
  if (this.language !== 'he') {
    return; // Only for Hebrew activities
  }

  const { contentValidator, phoneticProcessor, morphologicalAnalyzer, nikudAssigner } = hebrewServices;

  // Extract all Hebrew words from content
  const words = contentValidator.extractHebrewWords(this.content);

  // Initialize metadata
  this.hebrewLinguistics = {
    targetPhonemes: [],
    phonemePositions: { initial: 0, medial: 0, final: 0 },
    phonologicalComplexity: 0,
    rootsUsed: [],
    patternsUsed: [],
    morphologicalComplexity: 0,
    nikudLevel: 'none',
    nikudCoverage: 0,
    vocabularyThemes: this.theme ? [this.theme] : [],
    vocabularyComplexity: 0,
    culturalRelevance: false,
    validationScore: 0,
    validationWarnings: [],
    ageAppropriateScore: 0,
    inappropriateWords: []
  };

  if (words.length === 0) {
    return;
  }

  // Analyze phonetics
  const phoneticsResults = words.map(word => phoneticProcessor.analyzePhonetics(word));
  this.hebrewLinguistics.phonologicalComplexity =
    phoneticsResults.reduce((sum, r) => sum + r.articulationDifficulty, 0) / phoneticsResults.length;

  // Collect target phonemes
  if (this.targetSound) {
    this.hebrewLinguistics.targetPhonemes = [this.targetSound];
  }

  // Analyze morphology
  const morphologyResults = words.map(word => morphologicalAnalyzer.analyzeWord(word));
  const roots = morphologyResults
    .filter(r => r.root && r.root.confidence !== 'low')
    .map(r => r.root);

  // Count unique roots
  const rootCounts = {};
  roots.forEach(root => {
    const rootKey = root.letters.join('');
    rootCounts[rootKey] = (rootCounts[rootKey] || 0) + 1;
  });

  this.hebrewLinguistics.rootsUsed = Object.entries(rootCounts).map(([root, count]) => ({
    root,
    meaning: roots.find(r => r.letters.join('') === root)?.meaning || 'unknown',
    occurrences: count
  }));

  this.hebrewLinguistics.morphologicalComplexity =
    morphologyResults.reduce((sum, r) => sum + r.phonologicalComplexity, 0) / morphologyResults.length;

  // Check nikud coverage
  const allText = words.join(' ');
  const nikudStats = nikudAssigner.getNikudStatistics(allText);
  this.hebrewLinguistics.nikudCoverage = parseFloat(nikudStats.coverage);

  if (nikudStats.coverage >= 90) {
    this.hebrewLinguistics.nikudLevel = 'full';
  } else if (nikudStats.coverage >= 50) {
    this.hebrewLinguistics.nikudLevel = 'partial';
  } else if (nikudStats.coverage > 0) {
    this.hebrewLinguistics.nikudLevel = 'minimal';
  } else {
    this.hebrewLinguistics.nikudLevel = 'none';
  }

  // Validate content
  const validation = contentValidator.validateActivity(this.content, {
    activityType: this.type,
    ageGroup: this.ageGroup,
    language: this.language,
    targetSound: this.targetSound
  });

  this.hebrewLinguistics.validationScore = validation.scores.overall;
  this.hebrewLinguistics.validationWarnings = validation.warnings.map(w => w.message);

  // Calculate age appropriateness
  const ageValidation = contentValidator.validateAgeAppropriateness(words, this.ageGroup);
  this.hebrewLinguistics.ageAppropriateScore =
    (ageValidation.appropriateWords.length / words.length) * 100;
  this.hebrewLinguistics.inappropriateWords =
    ageValidation.inappropriateWords.map(w => w.word);

  await this.save();
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
