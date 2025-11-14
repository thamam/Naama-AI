# Naama-AI API Documentation

**Version:** 1.0.0 (Phase 2.5 & Phase 3)
**Base URL:** `http://localhost:5000/api` (development)
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [Activities](#activities)
3. [Feedback](#feedback)
4. [Analytics](#analytics)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Authentication

### Register
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "Dr. Sarah Cohen",
  "email": "sarah@example.com",
  "password": "SecurePassword123!",
  "role": "clinician"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Cohen",
    "email": "sarah@example.com",
    "role": "clinician"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
**POST** `/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "sarah@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Dr. Sarah Cohen",
    "email": "sarah@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Activities

All activity endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Generate Activity
**POST** `/activities/generate`

Generates a new therapeutic activity using AI.

**Request Body:**
```json
{
  "activityType": "articulation",
  "ageGroup": "3-4",
  "language": "he",
  "targetSound": "ש",
  "soundPosition": "initial",
  "itemCount": 6,
  "theme": "animals",
  "nikudLevel": "full"
}
```

**Parameters:**

| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| activityType | string | ✅ Yes | `articulation`, `rhyming`, `morphological`, `prosody`, `bilingual`, `picture_matching`, `sequencing` | Activity type |
| ageGroup | string | ✅ Yes | `2-3`, `3-4`, `4-6` | Child's age group |
| language | string | ❌ No | `en`, `he` | Language (default: `en`) |
| targetSound | string | ⚠️ Conditional | Any Hebrew/English letter | Required for `articulation` |
| soundPosition | string | ❌ No | `initial`, `medial`, `final`, `any` | Position of target sound |
| itemCount | number | ❌ No | 1-20 | Number of items (auto if omitted) |
| theme | string | ❌ No | `animals`, `food`, `family`, etc. | Activity theme |
| nikudLevel | string | ❌ No | `none`, `minimal`, `partial`, `full` | Hebrew nikud level |

**Response:** `201 Created`
```json
{
  "success": true,
  "activity": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "articulation",
    "ageGroup": "3-4",
    "language": "he",
    "targetSound": "ש",
    "content": {
      "title": "תרגול צליל 'ש'",
      "instructions": "הנחיות מפורטות לקלינאית...",
      "targetSound": "ש",
      "words": [
        {
          "word": "שׁוּלְחָן",
          "phonetic": "shul-chan",
          "syllables": 2,
          "syllableBreakdown": "שׁוּל-חָן",
          "soundPosition": "initial",
          "difficulty": "easy",
          "visualCue": "תמונה של שולחן",
          "practiceTip": "...",
          "root": "ש-ל-ח",
          "meaning": "table"
        }
        // ... more words
      ],
      "warmUpExercises": ["..."],
      "tips": "...",
      "commonMistakes": "...",
      "progressionSuggestions": "..."
    },
    "hebrewLinguistics": {
      "targetPhonemes": ["ש"],
      "nikudLevel": "full",
      "nikudCoverage": 94.2,
      "validationScore": 87,
      "ageAppropriateScore": 92,
      "rootsUsed": [...]
    },
    "llmProvider": "local_hebrew",
    "llmTokensUsed": 1245,
    "generationTime": 3420,
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  "metadata": {
    "provider": "local_hebrew",
    "model": "dicta/dictalm2.0-instruct",
    "tokensUsed": 1245,
    "generationTime": 3420
  }
}
```

### Hebrew Activity Example - Rhyming
**POST** `/activities/generate`

```json
{
  "activityType": "rhyming",
  "ageGroup": "4-6",
  "language": "he",
  "theme": "animals",
  "itemCount": 5
}
```

**Response Content:**
```json
{
  "content": {
    "title": "משחק חרוזים - חיות",
    "instructions": "...",
    "rhymingPairs": [
      {
        "words": ["כֶּלֶב", "לֵב"],
        "syllableCount": [2, 1],
        "rhymeType": "perfect",
        "phoneticSimilarity": 85,
        "rhymingEnding": "-ֶב",
        "visualCues": ["תמונה של כלב", "תמונה של לב"],
        "difficulty": "easy",
        "practiceActivity": "הצב את הכלב ליד הלב"
      }
      // ... more pairs
    ],
    "gameIdeas": [...],
    "tips": "..."
  }
}
```

### List Activities
**GET** `/activities`

Retrieves user's activities with pagination and filtering.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| limit | number | Items per page | 20 |
| skip | number | Items to skip | 0 |
| type | string | Filter by activity type | - |
| ageGroup | string | Filter by age group | - |
| language | string | Filter by language | - |

**Example Request:**
```
GET /activities?limit=10&type=articulation&language=he
```

**Response:** `200 OK`
```json
{
  "success": true,
  "activities": [
    {
      "_id": "...",
      "type": "articulation",
      "ageGroup": "3-4",
      "language": "he",
      "targetSound": "ש",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "usageCount": 3
      // Note: 'content' field excluded in list view
    }
    // ... more activities
  ],
  "total": 45,
  "limit": 10,
  "skip": 0
}
```

### Get Single Activity
**GET** `/activities/:id`

Retrieves full activity details including content.

**Response:** `200 OK`
```json
{
  "success": true,
  "activity": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "articulation",
    "content": {
      // Full content object
    },
    "hebrewLinguistics": {
      // Full metadata
    }
    // ... all fields
  }
}
```

### Delete Activity
**DELETE** `/activities/:id`

Deletes an activity.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Activity deleted successfully"
}
```

### Get Statistics
**GET** `/activities/stats`

Returns user's activity statistics.

**Response:** `200 OK`
```json
{
  "success": true,
  "stats": {
    "totalActivities": 127,
    "byType": {
      "articulation": 45,
      "rhyming": 23,
      "morphological": 18,
      "prosody": 15,
      "bilingual": 12,
      "picture_matching": 8,
      "sequencing": 6
    },
    "byLanguage": {
      "he": 95,
      "en": 32
    },
    "byAgeGroup": {
      "2-3": 35,
      "3-4": 58,
      "4-6": 34
    }
  }
}
```

---

## Feedback

### Submit Feedback
**POST** `/feedback`

Submits feedback for an activity.

**Request Body:**
```json
{
  "activityId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "feedbackType": "quality",
  "therapeuticValue": 5,
  "hebrewQualityRating": 4,
  "nikudCorrectness": 5,
  "ageAppropriateness": 5,
  "clinicalAccuracy": 4,
  "comments": "מצוין! הניקוד מדויק ואוצר המילים מתאים לגיל",
  "suggestedEdit": "",
  "issues": [],
  "positiveAspects": ["engaging_content", "excellent_nikud", "therapeutically_effective"],
  "wouldRecommend": true
}
```

**Parameters:**

| Field | Type | Required | Range | Description |
|-------|------|----------|-------|-------------|
| activityId | ObjectId | ✅ Yes | - | Activity being reviewed |
| rating | number | ✅ Yes | 1-5 | Overall rating |
| feedbackType | string | ✅ Yes | `quality`, `accuracy`, `usability`, `bug`, `feature_request`, `other` | Type of feedback |
| therapeuticValue | number | ✅ Yes | 1-5 | Clinical/therapeutic value |
| hebrewQualityRating | number | ❌ No | 1-5 | Hebrew content quality (for Hebrew activities) |
| nikudCorrectness | number | ❌ No | 1-5 | Nikud accuracy (for Hebrew activities) |
| ageAppropriateness | number | ❌ No | 1-5 | Age appropriateness |
| clinicalAccuracy | number | ❌ No | 1-5 | Clinical accuracy |
| comments | string | ❌ No | max 2000 chars | Detailed comments |
| suggestedEdit | string | ❌ No | max 1000 chars | Suggested improvements |
| wouldRecommend | boolean | ❌ No | - | Would recommend to colleagues |

**Response:** `201 Created`
```json
{
  "success": true,
  "feedback": {
    "_id": "...",
    "activityId": "507f1f77bcf86cd799439011",
    "rating": 5,
    "createdAt": "2025-01-15T11:00:00.000Z"
  }
}
```

### Get Activity Feedback
**GET** `/feedback/activity/:id`

Retrieves all feedback for a specific activity.

**Response:** `200 OK`
```json
{
  "success": true,
  "feedback": [
    {
      "_id": "...",
      "rating": 5,
      "feedbackType": "quality",
      "comments": "...",
      "createdAt": "2025-01-15T11:00:00.000Z"
    }
  ],
  "stats": {
    "totalFeedback": 3,
    "avgRating": 4.7,
    "avgTherapeuticValue": 4.3
  }
}
```

### Get User Feedback
**GET** `/feedback/user`

Retrieves user's submitted feedback.

**Query Parameters:**
- `limit` (number): Items per page (default: 20)
- `skip` (number): Items to skip (default: 0)

### Get Feedback Statistics
**GET** `/feedback/stats`

Retrieves aggregate feedback statistics.

**Query Parameters:**
- `activityType` (string): Filter by activity type
- `language` (string): Filter by language
- `dateFrom` (ISO 8601 date): Start date
- `dateTo` (ISO 8601 date): End date

**Response:** `200 OK`
```json
{
  "success": true,
  "stats": {
    "overall": {
      "totalFeedback": 156,
      "avgRating": 4.3,
      "avgTherapeuticValue": 4.5,
      "avgHebrewQuality": 4.2,
      "avgNikudCorrectness": 4.7
    },
    "byActivityType": [
      {
        "_id": "articulation",
        "count": 67,
        "avgRating": 4.4,
        "avgTherapeuticValue": 4.6
      }
      // ... more types
    ],
    "feedbackTypeDistribution": [
      { "_id": "quality", "count": 98 },
      { "_id": "accuracy", "count": 32 },
      { "_id": "usability", "count": 18 },
      { "_id": "bug", "count": 8 }
    ]
  }
}
```

### Update Feedback
**PATCH** `/feedback/:id`

Updates user's own feedback.

**Request Body:** (partial update)
```json
{
  "rating": 4,
  "comments": "Updated comment..."
}
```

### Delete Feedback
**DELETE** `/feedback/:id`

Deletes user's own feedback.

---

## Analytics

### Get Analytics Summary
**GET** `/analytics/summary`

Comprehensive analytics dashboard data.

**Query Parameters:**
- `dateFrom` (ISO 8601): Start date for filtering
- `dateTo` (ISO 8601): End date for filtering
- `type` (string): Activity type filter
- `language` (string): Language filter

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total": 127,
      "byType": [
        { "_id": "articulation", "count": 45 },
        // ... more
      ],
      "byLanguage": [
        { "_id": "he", "count": 95 },
        { "_id": "en", "count": 32 }
      ],
      "byAgeGroup": [
        { "_id": "3-4", "count": 58 },
        // ... more
      ],
      "byProvider": [
        {
          "_id": "local_hebrew",
          "count": 78,
          "avgTokens": 1150,
          "totalTokens": 89700,
          "avgGenerationTime": 2850
        },
        {
          "_id": "anthropic",
          "count": 49,
          "avgTokens": 1450,
          "totalTokens": 71050,
          "avgGenerationTime": 5200
        }
      ],
      "overTime": [
        { "_id": "2025-01-10", "count": 12 },
        { "_id": "2025-01-11", "count": 15 },
        // ... daily counts
      ]
    },
    "costs": {
      "breakdown": [
        {
          "provider": "local_hebrew",
          "activities": 78,
          "tokens": 89700,
          "avgTokensPerActivity": 1150,
          "avgGenerationTime": 2850,
          "estimatedCost": 0.0000
        },
        {
          "provider": "anthropic",
          "activities": 49,
          "tokens": 71050,
          "avgTokensPerActivity": 1450,
          "avgGenerationTime": 5200,
          "estimatedCost": 1.0658
        }
      ],
      "totalCost": 1.0658,
      "totalActivities": 127,
      "savings": {
        "amount": 1.3455,
        "percentage": 56
      }
    },
    "quality": {
      "feedback": {
        "totalFeedback": 156,
        "avgRating": 4.3,
        "avgTherapeuticValue": 4.5
      },
      "hebrewQuality": {
        "count": 95,
        "avgValidationScore": 84.2,
        "avgNikudCoverage": 92.5,
        "avgAgeAppropriateScore": 88.7
      },
      "usage": {
        "totalUsage": 423,
        "avgUsagePerActivity": 3.3
      }
    },
    "providerStatus": {
      "default": "anthropic",
      "hebrewProvider": "local_hebrew",
      "hebrewRoutingEnabled": true,
      "hebrewProviderAvailable": true,
      "providers": {
        "local_hebrew": {
          "available": true,
          "responseTime": 245,
          "model": "dicta/dictalm2.0-instruct",
          "type": "local"
        },
        "anthropic": {
          "available": true,
          "type": "cloud"
        }
      }
    },
    "generatedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

### Get Activity Metrics
**GET** `/analytics/activities`

Detailed activity generation metrics.

### Get Cost Analysis
**GET** `/analytics/costs`

Provider costs and savings analysis.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "breakdown": [
      {
        "provider": "local_hebrew",
        "activities": 78,
        "tokens": 89700,
        "estimatedCost": 0.0000
      },
      {
        "provider": "anthropic",
        "activities": 49,
        "tokens": 71050,
        "estimatedCost": 1.0658
      }
    ],
    "totalCost": 1.0658,
    "savings": {
      "amount": 1.3455,
      "percentage": 56
    }
  }
}
```

**Cost Calculation:**
- Local Hebrew LLM: $0 per token (free)
- Anthropic Claude: ~$0.000015 per token (Claude Haiku)
- Savings = (Local activities × avg cloud tokens × cloud cost)

### Get Quality Metrics
**GET** `/analytics/quality`

Quality metrics from feedback and validation.

### Get Hebrew Metrics
**GET** `/analytics/hebrew`

Hebrew-specific analytics.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "byType": [
      {
        "_id": "articulation",
        "count": 35,
        "avgValidationScore": 86.2,
        "avgNikudCoverage": 93.8,
        "avgAgeAppropriateScore": 89.5
      }
      // ... more types
    ],
    "rootsUsed": [
      {
        "_id": "כ-ת-ב",
        "count": 23,
        "meaning": "writing"
      },
      {
        "_id": "ד-ב-ר",
        "count": 18,
        "meaning": "speaking"
      }
      // ... top 20 roots
    ],
    "phonemesUsed": [
      { "_id": "ש", "count": 45 },
      { "_id": "ר", "count": 32 },
      { "_id": "כ", "count": 28 }
      // ... all phonemes
    ],
    "total": 95
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [
    // Validation errors (if applicable)
    {
      "field": "targetSound",
      "message": "Target sound is required for articulation activities"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Scenarios

**Authentication Error:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "activityType",
      "message": "Invalid activity type"
    }
  ]
}
```

**Rate Limit Error:**
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## Rate Limiting

Rate limits protect the API from abuse and ensure fair usage.

**Limits:**
- **General API:** 100 requests per 15 minutes per IP
- **Activity Generation:** 10 generations per hour per user
- **Authentication:** 5 attempts per 15 minutes per IP

**Rate Limit Headers:**
All responses include rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642252800
```

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests",
  "retryAfter": 300
}
```

---

## Example Usage

### Complete Flow Example (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token;

// 1. Register
async function register() {
  const response = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Dr. Sarah Cohen',
    email: 'sarah@example.com',
    password: 'SecurePass123!'
  });
  token = response.data.token;
  console.log('Registered:', response.data.user);
}

// 2. Generate Hebrew Articulation Activity
async function generateActivity() {
  const response = await axios.post(
    `${BASE_URL}/activities/generate`,
    {
      activityType: 'articulation',
      ageGroup: '3-4',
      language: 'he',
      targetSound: 'ש',
      soundPosition: 'initial',
      itemCount: 6
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const activity = response.data.activity;
  console.log('Generated activity:', activity._id);
  console.log('Provider used:', activity.llmProvider);
  console.log('Words:', activity.content.words.map(w => w.word));

  return activity._id;
}

// 3. Submit Feedback
async function submitFeedback(activityId) {
  const response = await axios.post(
    `${BASE_URL}/feedback`,
    {
      activityId,
      rating: 5,
      feedbackType: 'quality',
      therapeuticValue: 5,
      hebrewQualityRating: 5,
      nikudCorrectness: 4,
      comments: 'מצוין! הניקוד מדויק'
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  console.log('Feedback submitted:', response.data.feedback._id);
}

// 4. Get Analytics
async function getAnalytics() {
  const response = await axios.get(`${BASE_URL}/analytics/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = response.data.data;
  console.log('Total activities:', data.metrics.total);
  console.log('Total cost:', data.costs.totalCost);
  console.log('Savings:', data.costs.savings.amount);
}

// Run complete flow
async function main() {
  try {
    await register();
    const activityId = await generateActivity();
    await submitFeedback(activityId);
    await getAnalytics();
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

main();
```

---

## Webhooks (Future)

*Webhook support planned for Phase 4 - will allow real-time notifications for activity generation completion, feedback submission, etc.*

---

## Changelog

**v1.0.0 (Phase 2.5 & 3) - 2025-01**
- ✅ Added 4 new Hebrew activity types (rhyming, morphological, prosody, bilingual)
- ✅ Enhanced articulation with Hebrew specialization
- ✅ Added feedback collection endpoints
- ✅ Added analytics endpoints
- ✅ Added Hebrew-specific metrics
- ✅ Provider status reporting

**v0.2.0 (Phase 2) - 2024-12**
- Added Hebrew LLM integration
- Added Hebrew linguistic services
- Intelligent routing (Hebrew → local, English → Claude)

**v0.1.0 (Phase 1) - 2024-11**
- Initial API release
- Basic activity generation
- Authentication

---

**Support:** support@naama-ai.com
**Documentation:** https://docs.naama-ai.com
