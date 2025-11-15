import mongoose from 'mongoose';

/**
 * Feedback Schema
 * Phase 3: Clinical validation and feedback collection
 */
const feedbackSchema = new mongoose.Schema({
  // User who submitted feedback
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Activity being reviewed
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true,
    index: true
  },

  // General ratings
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },

  feedbackType: {
    type: String,
    enum: ['quality', 'accuracy', 'usability', 'bug', 'feature_request', 'other'],
    required: true
  },

  // Hebrew-specific quality ratings (for Hebrew activities)
  hebrewQualityRating: {
    type: Number,
    min: 1,
    max: 5
  },

  nikudCorrectness: {
    type: Number,
    min: 1,
    max: 5
  },

  // Clinical assessment
  therapeuticValue: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },

  ageAppropriateness: {
    type: Number,
    min: 1,
    max: 5
  },

  clinicalAccuracy: {
    type: Number,
    min: 1,
    max: 5
  },

  // Detailed feedback
  comments: {
    type: String,
    maxlength: 2000
  },

  suggestedEdit: {
    type: String,
    maxlength: 1000
  },

  // Specific issues (for structured feedback)
  issues: [{
    type: {
      type: String,
      enum: [
        'incorrect_nikud',
        'inappropriate_vocabulary',
        'incorrect_phonetics',
        'cultural_insensitivity',
        'age_inappropriate',
        'grammar_error',
        'content_error',
        'other'
      ]
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],

  // Positive aspects (structured feedback)
  positiveAspects: [{
    type: String,
    enum: [
      'engaging_content',
      'appropriate_difficulty',
      'excellent_nikud',
      'culturally_relevant',
      'therapeutically_effective',
      'well_structured',
      'good_visual_cues',
      'other'
    ]
  }],

  // Would use again?
  wouldRecommend: {
    type: Boolean
  },

  // Status
  status: {
    type: String,
    enum: ['new', 'reviewed', 'addressed', 'archived'],
    default: 'new'
  },

  // Admin response
  adminResponse: {
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    response: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ activityId: 1 });
feedbackSchema.index({ feedbackType: 1, status: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ therapeuticValue: 1 });

// Static method to get aggregate feedback stats
feedbackSchema.statics.getAggregateStats = async function(filters = {}) {
  const pipeline = [];

  // Apply filters if provided
  if (Object.keys(filters).length > 0) {
    pipeline.push({ $match: filters });
  }

  pipeline.push({
    $group: {
      _id: null,
      totalFeedback: { $sum: 1 },
      avgRating: { $avg: '$rating' },
      avgTherapeuticValue: { $avg: '$therapeuticValue' },
      avgHebrewQuality: { $avg: '$hebrewQualityRating' },
      avgNikudCorrectness: { $avg: '$nikudCorrectness' },
      avgAgeAppropriateness: { $avg: '$ageAppropriateness' },
      avgClinicalAccuracy: { $avg: '$clinicalAccuracy' },
      feedbackByType: {
        $push: {
          type: '$feedbackType',
          rating: '$rating'
        }
      }
    }
  });

  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

// Static method to get feedback stats by activity type
feedbackSchema.statics.getStatsByActivityType = async function() {
  const pipeline = [
    {
      $lookup: {
        from: 'activities',
        localField: 'activityId',
        foreignField: '_id',
        as: 'activity'
      }
    },
    {
      $unwind: '$activity'
    },
    {
      $group: {
        _id: '$activity.type',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        avgTherapeuticValue: { $avg: '$therapeuticValue' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];

  return await this.aggregate(pipeline);
};

// Instance method to mark as reviewed
feedbackSchema.methods.markAsReviewed = async function(adminUserId, response) {
  this.status = 'reviewed';
  this.adminResponse = {
    respondedBy: adminUserId,
    response,
    respondedAt: new Date()
  };
  await this.save();
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
