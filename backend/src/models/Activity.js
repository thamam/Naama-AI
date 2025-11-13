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
    enum: ['picture_matching', 'sequencing', 'articulation'],
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

// Method to track usage
activitySchema.methods.recordUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
