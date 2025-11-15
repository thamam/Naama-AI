# Testing Guide - Naama-AI Phase 2.5 & Phase 3

## Overview

This guide provides comprehensive testing procedures for the Naama-AI speech therapy platform, focusing on Phase 2.5 (Enhanced Activity Templates with Hebrew Integration) and Phase 3 (Clinical Validation).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local LLM Setup Verification](#local-llm-setup-verification)
3. [Integration Tests](#integration-tests)
4. [Manual Testing Checklist](#manual-testing-checklist)
5. [Performance Testing](#performance-testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js >= 18.0.0
- MongoDB >= 6.0
- Ollama (for local Hebrew LLM) or LM Studio
- npm or yarn

### Environment Setup

```bash
# 1. Clone and navigate to repository
cd Naama-AI

# 2. Install dependencies
cd backend
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start MongoDB
# (Ensure MongoDB is running on your system)

# 5. Run database migrations if needed
npm run migrate
```

---

## Local LLM Setup Verification

### Option 1: Ollama with DictaLM 2.0

```bash
# 1. Verify Ollama installation
ollama --version

# 2. Check if DictaLM 2.0 is installed
ollama list

# Expected output should include: dicta/dictalm2.0-instruct

# 3. If not installed, pull the model
ollama pull dicta/dictalm2.0-instruct

# 4. Test the model
ollama run dicta/dictalm2.0-instruct "שלום, מה שלומך?"

# 5. Check Ollama service status
curl http://localhost:11434/api/tags
```

### Option 2: LM Studio

```bash
# 1. Launch LM Studio application
# 2. Load DictaLM 2.0 model from model library
# 3. Start local server (default: http://localhost:1234)
# 4. Test endpoint:

curl http://localhost:1234/v1/models
```

### Verify Configuration

```bash
# Check backend configuration
cat backend/.env | grep LOCAL_HEBREW

# Expected variables:
# LOCAL_HEBREW_LLM_ENABLED=true
# LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:11434  # or 1234 for LM Studio
# LOCAL_HEBREW_LLM_MODEL=dicta/dictalm2.0-instruct
# LOCAL_HEBREW_LLM_BACKEND=ollama  # or lmstudio
```

### Test Provider Health

```bash
# Start backend server
cd backend
npm run dev

# In another terminal, check provider status
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/analytics/summary
```

Look for `providerStatus` in the response:
```json
{
  "providerStatus": {
    "hebrewProviderAvailable": true,
    "providers": {
      "local_hebrew": {
        "available": true,
        "responseTime": 245,
        "model": "dicta/dictalm2.0-instruct"
      }
    }
  }
}
```

---

## Integration Tests

### Running the Test Suite

```bash
# Navigate to backend directory
cd backend

# Run all integration tests
npm test backend/tests/integration/hebrewGeneration.test.js

# Run with verbose output
npm test -- --reporter spec backend/tests/integration/hebrewGeneration.test.js

# Run specific test suite
npm test -- --grep "Articulation Activity"
```

### Expected Test Results

✅ **All tests should pass** with the following scenarios:

1. **Hebrew Articulation Activity with Target Sound ש**
   - Activity generated successfully
   - Contains vocabulary with target sound
   - Nikud coverage ≥ 80%
   - Hebrew linguistics metadata populated
   - Local LLM used when available

2. **Rhyming Activity (Hebrew)**
   - Activity generated with rhyming pairs
   - Phonetic similarity verified
   - Age-appropriate vocabulary

3. **Morphological Activity (Hebrew)**
   - Word families generated
   - Shared roots verified
   - Root meanings included

4. **Failover Logic**
   - Claude fallback works when local LLM unavailable
   - Fallback metadata included

5. **Hebrew Linguistic Services**
   - VocabularyBank returns filtered words
   - NikudAssigner adds vowel points
   - PhoneticProcessor provides phoneme info
   - ContentValidator scores content

6. **Performance**
   - Generation completes in <20 seconds
   - Reasonable token usage

### Test Output Example

```
Hebrew Activity Generation Integration Tests
  Articulation Activity (Hebrew) with Target Sound ש
    ✓ Activity generated successfully
      Activity ID: 507f1f77bcf86cd799439011
      Provider: local_hebrew
      Tokens: 1245
      Generation time: 3420ms
    ✓ Found 6 words with target sound ש
    ✓ Nikud coverage: 94.2%
    ✓ Hebrew Linguistics Metadata:
        Validation score: 87
        Nikud coverage: 94.2%
        Age appropriate score: 92
        Target phonemes: ש
        Roots used: 4

  6 passing (12.4s)
```

---

## Manual Testing Checklist

### 1. Activity Generation - All Types

#### Test 1.1: Hebrew Articulation Activity
- [ ] **Navigate to Activity Generator**
- [ ] **Fill in parameters:**
  - Activity Type: `articulation`
  - Age Group: `3-4`
  - Language: `Hebrew (he)`
  - Target Sound: `ש`
  - Sound Position: `initial`
  - Item Count: `6`
- [ ] **Click "Generate"**
- [ ] **Verify generated activity:**
  - Title is in Hebrew with nikud
  - Instructions are clear and in Hebrew
  - 6 words with target sound ש
  - Each word has nikud (vowel points)
  - Syllable breakdown provided
  - Visual cues included
  - Warm-up exercises present
- [ ] **Check metadata:**
  - Provider used (local_hebrew or anthropic)
  - Generation time
  - Token usage
- [ ] **Repeat for different sounds:** `ב`, `כ`, `ת`, `ר`

#### Test 1.2: Rhyming Activity (Hebrew)
- [ ] **Parameters:**
  - Activity Type: `rhyming`
  - Age Group: `4-6`
  - Language: `Hebrew (he)`
  - Theme: `animals` (optional)
  - Item Count: `5`
- [ ] **Verify:**
  - 5+ rhyming pairs/triplets generated
  - Words actually rhyme (test pronunciation)
  - Phonetic similarity scores included
  - Visual cues present
  - Game ideas provided

#### Test 1.3: Morphological Activity (Hebrew)
- [ ] **Parameters:**
  - Activity Type: `morphological`
  - Age Group: `4-6`
  - Language: `Hebrew (he)`
  - Item Count: `3`
- [ ] **Verify:**
  - 3+ word families
  - Each family has shared root
  - Root meaning explained
  - Example sentences included
  - Game activities suggested

#### Test 1.4: Prosody Activity (Hebrew)
- [ ] **Parameters:**
  - Activity Type: `prosody`
  - Age Group: `3-4`
  - Language: `Hebrew (he)`
  - Prosody Type: `rhythm`
- [ ] **Verify:**
  - Rhythm exercises included
  - Syllable counting activities
  - Visual and audio guidance
  - Stress patterns marked
  - Musical connections suggested

#### Test 1.5: Bilingual Activity (Hebrew-English)
- [ ] **Parameters:**
  - Activity Type: `bilingual`
  - Age Group: `4-6`
  - Primary Language: `Hebrew (he)`
  - Item Count: `10`
- [ ] **Verify:**
  - Translation pairs in both languages
  - Hebrew has nikud
  - Cultural notes included
  - Code-switching examples
  - Parent guidance provided

### 2. Hebrew Linguistic Quality

#### Test 2.1: Nikud Correctness (Vowel Points)
- [ ] **Generate multiple Hebrew activities (age 3-4)**
- [ ] **Check nikud on 20+ words:**
  - Kamatz (ָ), Patach (ַ), Segol (ֶ), Tzere (ֵ), Chirik (ִ), Cholam (ֹ), Kubutz (ֻ), Shuruk (וּ)
  - Dagesh present where needed (בּ, פּ, כּ, etc.)
  - Shva (ְ) used correctly
- [ ] **Validate with native Hebrew speaker**
- [ ] **Check age-appropriate nikud levels:**
  - Age 2-3: Full nikud (100%)
  - Age 3-4: Full nikud (100%)
  - Age 4-6: Partial nikud (70-80%)

#### Test 2.2: Vocabulary Appropriateness
- [ ] **Age 2-3 activities should have:**
  - 1-2 syllable words only
  - Concrete, familiar objects (אמא, אבא, כלב, חתול, לחם, מים)
  - No abstract concepts
- [ ] **Age 3-4 activities should have:**
  - 1-3 syllable words
  - Common daily vocabulary
  - Simple verbs and adjectives
- [ ] **Age 4-6 activities should have:**
  - 2-4 syllable words
  - More complex concepts
  - Can include simple phrases

#### Test 2.3: Phonetic Accuracy
- [ ] **Generate articulation activity for each Hebrew sound:**
  - ב, פ, כ, ת, ד, ג, ק, ר, ש, צ, ח, ע, א
- [ ] **Verify:**
  - Target sound appears in specified position (initial/medial/final)
  - Minimal pairs included where appropriate
  - Age-normed difficulty (check against phoneme acquisition ages)

### 3. Intelligent Routing & Failover

#### Test 3.1: Local LLM Routing
- [ ] **Ensure Ollama/LM Studio is running**
- [ ] **Generate Hebrew activity**
- [ ] **Check console logs or metadata:**
  - Should show: `Routing Hebrew request to local LLM`
  - Provider should be: `local_hebrew`
- [ ] **Verify in analytics endpoint:**
  ```bash
  curl -H "Authorization: Bearer TOKEN" \
    http://localhost:5000/api/analytics/costs
  ```
  - Hebrew activities should have cost: $0 (local)

#### Test 3.2: Fallback to Claude
- [ ] **Stop Ollama/LM Studio:**
  ```bash
  # If using Ollama:
  pkill ollama
  ```
- [ ] **Generate Hebrew activity**
- [ ] **Check logs:**
  - Should show: `Local Hebrew LLM is unavailable, will use fallback`
  - Provider should be: `anthropic`
  - Metadata should include: `fallback: true`
- [ ] **Activity should still generate successfully**

#### Test 3.3: English Activities use Claude
- [ ] **Generate English activity (any type)**
- [ ] **Verify provider:** `anthropic`
- [ ] **Should NOT route to local LLM**

### 4. Database & Metadata

#### Test 4.1: Hebrew Linguistics Metadata
- [ ] **Generate Hebrew activity**
- [ ] **Query database to verify metadata:**
  ```javascript
  // Use MongoDB Compass or CLI
  db.activities.findOne(
    { language: 'he' },
    { hebrewLinguistics: 1 }
  )
  ```
- [ ] **Check fields populated:**
  - `targetPhonemes`: Array of target sounds
  - `phonemePositions`: initial/medial/final counts
  - `rootsUsed`: Array of Hebrew roots with meanings
  - `nikudLevel`: full/partial/minimal
  - `nikudCoverage`: Percentage (0-100)
  - `validationScore`: Quality score (0-100)
  - `validationWarnings`: Array of issues
  - `ageAppropriateScore`: Age suitability (0-100)

#### Test 4.2: Bilingual Metadata
- [ ] **Generate bilingual activity**
- [ ] **Check `bilingualMetadata`:**
  - `primaryLanguage`: 'he' or 'en'
  - `secondaryLanguage`: 'en' or 'he'
  - `translationPairs`: Count
  - `codeSwitch`: Boolean

### 5. Feedback System

#### Test 5.1: Submit Feedback
- [ ] **Generate an activity**
- [ ] **Submit feedback via API:**
  ```bash
  curl -X POST http://localhost:5000/api/feedback \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "activityId": "ACTIVITY_ID",
      "rating": 5,
      "feedbackType": "quality",
      "therapeuticValue": 5,
      "hebrewQualityRating": 5,
      "nikudCorrectness": 4,
      "comments": "Excellent Hebrew activity with proper nikud"
    }'
  ```
- [ ] **Verify feedback saved in database**

#### Test 5.2: View Feedback
- [ ] **Get feedback for activity:**
  ```bash
  curl http://localhost:5000/api/feedback/activity/ACTIVITY_ID \
    -H "Authorization: Bearer TOKEN"
  ```
- [ ] **Get aggregate stats:**
  ```bash
  curl http://localhost:5000/api/feedback/stats \
    -H "Authorization: Bearer TOKEN"
  ```

### 6. Analytics

#### Test 6.1: Activity Metrics
- [ ] **Generate 10+ activities (mix of Hebrew and English, various types)**
- [ ] **Query analytics:**
  ```bash
  curl http://localhost:5000/api/analytics/summary \
    -H "Authorization: Bearer TOKEN"
  ```
- [ ] **Verify response includes:**
  - Total activities
  - Breakdown by type
  - Breakdown by language
  - Breakdown by age group
  - Provider usage statistics
  - Usage over time graph data

#### Test 6.2: Cost Analysis
- [ ] **Query cost endpoint:**
  ```bash
  curl http://localhost:5000/api/analytics/costs \
    -H "Authorization: Bearer TOKEN"
  ```
- [ ] **Verify:**
  - Local Hebrew activities have $0 cost
  - Claude activities have estimated cost
  - Savings calculation present
  - Token usage tracked

#### Test 6.3: Hebrew-Specific Metrics
- [ ] **Query Hebrew analytics:**
  ```bash
  curl http://localhost:5000/api/analytics/hebrew \
    -H "Authorization: Bearer TOKEN"
  ```
- [ ] **Check:**
  - Metrics by activity type
  - Top roots used
  - Phonemes targeted
  - Quality scores

### 7. Performance Testing

#### Test 7.1: Generation Speed
- [ ] **Measure generation time for each activity type:**
  - Hebrew Articulation: Target < 10s
  - Rhyming: Target < 12s
  - Morphological: Target < 15s
  - Prosody: Target < 10s
  - Bilingual: Target < 15s
- [ ] **Local LLM should be faster than Claude for simple requests**
- [ ] **Check token usage is reasonable (<2000 tokens per activity)**

#### Test 7.2: Concurrent Requests
- [ ] **Use Apache Bench or similar:**
  ```bash
  ab -n 20 -c 5 -T 'application/json' \
    -H "Authorization: Bearer TOKEN" \
    -p activity_request.json \
    http://localhost:5000/api/activities/generate
  ```
- [ ] **Verify:**
  - No failures
  - Reasonable response times
  - Server remains stable

---

## Performance Testing

### Expected Benchmarks

| Metric | Target | Notes |
|--------|--------|-------|
| Generation Time (Hebrew, Local) | < 10s | Using Ollama on decent hardware |
| Generation Time (Hebrew, Claude) | < 15s | API latency included |
| Token Usage (Articulation) | 800-1500 | Depends on complexity |
| Token Usage (Morphological) | 1200-2000 | More complex generation |
| Nikud Coverage (Age 2-4) | ≥ 90% | Full nikud expected |
| Validation Score | ≥ 75 | Hebrew content quality |
| Memory Usage | < 500MB | Backend process |
| Database Query Time | < 100ms | For typical queries |

### Load Testing

```bash
# Install artillery (if not already installed)
npm install -g artillery

# Run load test
artillery quick --count 10 --num 5 \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/activities/generate

# Monitor server resources
htop  # or top on macOS
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Local Hebrew LLM Not Available
**Symptoms:** Activities always use `anthropic` provider

**Solutions:**
1. Check Ollama is running:
   ```bash
   curl http://localhost:11434/api/tags
   ```
2. Verify model is installed:
   ```bash
   ollama list
   ```
3. Check backend logs for errors
4. Verify `.env` configuration:
   ```
   LOCAL_HEBREW_LLM_ENABLED=true
   LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:11434
   ```

#### Issue 2: Nikud Not Appearing
**Symptoms:** Hebrew words have no vowel points

**Solutions:**
1. Check browser/terminal supports Hebrew Unicode
2. Verify `nikudLevel` parameter is not `none`
3. Check database encoding (should be UTF-8)
4. Test with Hebrew text editor to confirm rendering

#### Issue 3: Test Failures
**Symptoms:** Integration tests fail

**Solutions:**
1. Ensure database is clean (drop test database between runs)
2. Check all environment variables set
3. Verify models are loaded
4. Increase timeout values if generation is slow
5. Check Claude API key is valid

#### Issue 4: Validation Scores Are Low
**Symptoms:** `hebrewLinguistics.validationScore < 60`

**Solutions:**
1. This may indicate LLM output quality issues
2. Check prompt templates are being used correctly
3. Verify vocabulary bank has sufficient data
4. Consider fine-tuning prompts
5. Report specific examples for improvement

#### Issue 5: Generation Too Slow
**Symptoms:** Takes > 20 seconds to generate

**Solutions:**
1. Local LLM: Check hardware (GPU acceleration enabled?)
2. Claude: Check network latency, API rate limits
3. Optimize prompts (reduce token count)
4. Consider caching common generations
5. Check database query performance

### Debug Mode

Enable debug logging:

```bash
# In .env
LOG_LEVEL=debug

# Run backend
npm run dev

# You'll see detailed logs including:
# - Provider selection
# - Prompt assembly
# - LLM requests/responses
# - Hebrew processing steps
# - Validation results
```

### Getting Help

If you encounter issues not covered here:

1. Check logs: `backend/logs/combined.log`
2. Review Phase 2 documentation: `PHASE2_DOCUMENTATION.md`
3. Check deployment guide: `DEPLOYMENT_GUIDE.md`
4. Open an issue on GitHub with:
   - Error logs
   - Test output
   - Environment details
   - Steps to reproduce

---

## Success Criteria Summary

Phase 2.5 & Phase 3 testing is successful when:

✅ All 7 activity types generate correctly in Hebrew
✅ Nikud coverage ≥ 80% for age-appropriate activities
✅ Local Hebrew LLM routes correctly (when available)
✅ Failover to Claude works seamlessly
✅ Hebrew linguistic metadata populated accurately
✅ Vocabulary is age-appropriate
✅ Feedback system operational
✅ Analytics tracking all metrics
✅ Integration tests pass (>80% coverage)
✅ Performance meets benchmarks
✅ No critical bugs identified

---

## Next Steps

After completing this testing guide:

1. Document any bugs found
2. Submit feedback via the feedback system
3. Review analytics to identify patterns
4. Prepare for clinical pilot with 5-10 clinicians
5. Iterate based on real-world usage data

**Ready for Clinical Pilot! 🚀**
