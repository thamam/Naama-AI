# Naama-AI Speech Therapy Platform

**AI-Powered Speech Therapy Activity Generator for Israeli Clinicians**

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/thamam/Naama-AI)
[![Phase](https://img.shields.io/badge/phase-2.5%20%26%203-success)](https://github.com/thamam/Naama-AI)
[![License](https://img.shields.io/badge/license-Private-red)](./LICENSE)

Naama-AI is a comprehensive speech therapy platform specifically designed for Israeli speech-language pathologists working with Hebrew-speaking children aged 2-6. The platform leverages advanced AI (local Hebrew LLM + Claude) to generate culturally relevant, linguistically accurate therapeutic activities.

---

## 🌟 Key Features

### Phase 2.5 & 3 (Current)

- **🇮🇱 Hebrew Specialization**
  - Local Hebrew LLM integration (DictaLM 2.0)
  - Automatic nikud (vowel point) assignment
  - Age-normed phoneme data for Hebrew
  - Morphological analysis (root-pattern system)
  - 180+ word vocabulary bank with phonetic tagging
  - Cultural relevance for Israeli context

- **🎯 7 Activity Types**
  - Articulation Practice (תרגול ארטיקולציה)
  - Rhyming Activities (פעילויות חרוזים)
  - Morphological Patterns (תבניות מורפולוגיות)
  - Prosody Activities (פעילויות פרוסודיה)
  - Bilingual Hebrew-English (פעילויות דו-לשוניות)
  - Picture Matching (התאמת תמונות)
  - Sequencing (סדרת אירועים)

- **🤖 Intelligent LLM Routing**
  - Hebrew activities → Local LLM (free, fast, optimized)
  - English activities → Claude API
  - Automatic failover for resilience

- **📊 Analytics & Feedback**
  - Real-time usage analytics
  - Cost tracking and savings calculation
  - Clinical feedback collection
  - Quality metrics monitoring
  - Provider status dashboard

- **🔬 Clinical Validation**
  - Content validation system
  - Age-appropriateness scoring
  - Nikud correctness verification
  - Therapeutic value assessment

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Changelog](#changelog)

---

## 🚀 Quick Start

### For Clinicians

1. **Access the platform** (once deployed)
2. **Register** with your professional email
3. **Generate your first activity:**
   - Select activity type (e.g., Articulation)
   - Choose age group (2-3, 3-4, or 4-6)
   - Select language (Hebrew or English)
   - Set target sound or theme
   - Click "Generate"
4. **Use in therapy session**
5. **Provide feedback** to improve AI

**👉 See detailed guide:** [CLINICIAN_GUIDE.md](./CLINICIAN_GUIDE.md) (Hebrew + English)

### For Developers

```bash
# Clone repository
git clone https://github.com/thamam/Naama-AI.git
cd Naama-AI

# Install frontend dependencies (from root directory)
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Set up environment variables
cp backend/.env.example backend/.env
# Edit .env with your configuration

# Start local Hebrew LLM (Ollama) - OPTIONAL but RECOMMENDED
# Install Ollama first: curl https://ollama.ai/install.sh | sh
ollama pull llama3.2
ollama serve

# Start backend server (in one terminal)
cd backend && npm run dev

# Start frontend (in another terminal, from root directory)
npm run dev

# Access at http://localhost:3000
```

**Note:** Do NOT open `index.html` directly in your browser. This is a Vite-based React application that requires the development server to run properly.

**👉 See detailed setup:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📁 Project Structure

```
Naama-AI/
├── backend/              # Backend API (Node.js + Express)
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic & Hebrew NLP
│   ├── tests/           # Integration tests
│   └── server.js        # Entry point
├── src/                 # Frontend source (React + Vite)
│   ├── components/      # React components
│   ├── data/            # Static data
│   └── utils/           # Utility functions
├── dist/                # Frontend build output (generated)
├── index.html           # Frontend entry point (requires Vite)
├── package.json         # Frontend dependencies
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

**Important Notes:**
- **Frontend** is in the ROOT directory (not in a `frontend/` folder)
- **Backend** is in the `backend/` directory
- Do NOT open `index.html` directly - use `npm run dev` to start the Vite dev server

---

## 📦 Prerequisites

### Required

- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0
- **npm** or **yarn**

### For Local Hebrew LLM (Recommended)

Choose ONE of:

**Option A: Ollama (Recommended)**
```bash
# Install Ollama: https://ollama.ai
curl https://ollama.ai/install.sh | sh

# Pull llama3.2 model (3.2B parameters with Hebrew support)
# Note: DictaLM 2.0 is not currently available in Ollama registry
ollama pull llama3.2

# Start service (runs on http://localhost:11434)
ollama serve

# Verify installation
curl http://localhost:11434/api/tags
```

**Important Notes:**
- First generation request will be slow (cold start, ~2 minutes) while model loads
- Subsequent requests will be fast (~2-5 seconds)
- Increase timeout in `.env` if needed: `LOCAL_HEBREW_LLM_TIMEOUT=300000` (5 minutes)

**Option B: LM Studio**
- Download from: https://lmstudio.ai
- Load DictaLM 2.0 from model library
- Start local server

### For Cloud API

- **Anthropic API Key** (Claude) for fallback/English

---

## 🛠️ Installation

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration:
# - MONGODB_URI (MongoDB Atlas or local MongoDB)
# - NAAMA_CLAUDE_API_KEY (separate from Claude Code, optional if using local LLM only)
# - LOCAL_HEBREW_LLM settings (enable and configure Ollama)
nano .env

# Secure API key setup (alternative to manual editing)
# This script helps set the Claude API key without exposing it in terminal history
bash scripts/set-api-key.sh

# Run database migrations (if needed)
npm run migrate

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend Setup

**Important:** The frontend code is located in the ROOT directory of the repository, not in a separate `frontend` folder.

```bash
# From the root directory of Naama-AI

# Install dependencies
npm install

# Create environment file (if needed)
# The frontend will connect to backend at http://localhost:5000 by default

# Start development server
npm run dev

# App runs on http://localhost:3000 (opens automatically)
```

**Available commands:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally

**Note:** The `index.html` file requires Vite to process JSX/React code. Opening it directly in a browser will result in a blank page.

### Verify Installation

1. **Check backend health:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check provider status:**
   ```bash
   curl http://localhost:5000/api/analytics/summary \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Generate test activity** (see API_DOCUMENTATION.md)

### Troubleshooting Ollama

**Issue: First activity generation times out**
```bash
# This is expected! First request loads the model (cold start)
# Solution: Test Ollama directly to warm it up
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "שלום, מה שלומך?",
  "stream": false
}'

# After this completes, subsequent requests will be fast
```

**Issue: Ollama not responding**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve

# Check available models
ollama list
```

**Issue: Model not found**
```bash
# Pull the model again
ollama pull llama3.2

# Verify it's available
ollama list
```

**Issue: Backend still using Claude API instead of local LLM**
```bash
# Check your .env file has:
# LOCAL_HEBREW_LLM_ENABLED=true
# LOCAL_HEBREW_LLM_MODEL=llama3.2
# LOCAL_HEBREW_LLM_ENDPOINT=http://localhost:11434

# Restart backend to pick up changes
```

---

## 💡 Usage

### Generating Activities

**Via API:**

```bash
curl -X POST http://localhost:5000/api/activities/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activityType": "articulation",
    "ageGroup": "3-4",
    "language": "he",
    "targetSound": "ש",
    "soundPosition": "initial",
    "itemCount": 6
  }'
```

**Via Frontend:**
1. Navigate to Activity Generator
2. Fill in form with parameters
3. Click "Generate Activity"
4. Review and use generated activity

### Activity Types Guide

#### 1. Articulation (תרגול ארטיקולציה)
**Use for:** Phoneme-specific practice, articulation disorders

**Parameters:**
- `targetSound`: Hebrew letter (ב, פ, כ, ת, ש, ר, etc.)
- `soundPosition`: initial, medial, final, any
- `nikudLevel`: full, partial, minimal, none

**Example Output:**
- 6-10 words with target sound
- Full nikud (vowel points)
- Syllable breakdown
- Phonetic transcriptions
- Practice tips
- Visual cues

#### 2. Rhyming (פעילויות חרוזים)
**Use for:** Phonological awareness, pre-literacy

**Parameters:**
- `theme`: animals, food, family, etc.
- `itemCount`: Number of rhyming pairs/triplets

**Example Output:**
- Rhyming word pairs (כֶּלֶב - לֵב)
- Phonetic similarity scores
- Game ideas
- Visual cues

#### 3. Morphological (תבניות מורפולוגיות)
**Use for:** Vocabulary expansion, metalinguistic awareness

**Parameters:**
- `itemCount`: Number of word families

**Example Output:**
- Word families by root (כ-ת-ב: כּוֹתֵב, כָּתַב, מִכְתָּב)
- Root meanings
- Connection explanations
- Interactive games

#### 4. Prosody (פעילויות פרוסודיה)
**Use for:** Rhythm, intonation, fluency

**Parameters:**
- `prosodyType`: syllable, stress, rhythm, intonation, mixed

**Example Output:**
- Syllable counting exercises
- Stress pattern marking
- Rhythm games (clapping, tapping)
- Intonation practice

#### 5. Bilingual (דו-לשוניות)
**Use for:** Bilingual vocabulary, code-switching awareness

**Parameters:**
- `primaryLanguage`: he or en
- `activitySubtype`: translation, codeSwitch, cognates, cultural

**Example Output:**
- Translation pairs (עברית-English)
- Cultural notes
- Code-switching examples
- Parent guidance

**👉 Complete API documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [CLINICIAN_GUIDE.md](./CLINICIAN_GUIDE.md) | **Start here!** Complete guide for clinicians (Hebrew + English) |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference with examples |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Server deployment and configuration |
| [PHASE2_DOCUMENTATION.md](./PHASE2_DOCUMENTATION.md) | Hebrew LLM integration technical details |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Comprehensive testing procedures |
| [USAGE_GUIDE.md](./USAGE_GUIDE.md) | Original MVP usage guide |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│                    (React + Vite)                             │
│              Activity Generator Interface                     │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/REST
┌───────────────────────────┴─────────────────────────────────┐
│                      Backend API                              │
│                  (Node.js + Express)                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Activity Generator Service                   │   │
│  │  ┌──────────────┐  ┌──────────────────────────┐    │   │
│  │  │ Prompt       │  │ Hebrew Services          │    │   │
│  │  │ Assembler    │  │ • Vocabulary Bank        │    │   │
│  │  └──────┬───────┘  │ • Nikud Assigner         │    │   │
│  │         │          │ • Phonetic Processor     │    │   │
│  │         │          │ • Morphological Analyzer │    │   │
│  │         │          │ • Content Validator      │    │   │
│  │         │          └──────────────────────────┘    │   │
│  │         ↓                                            │   │
│  │  ┌──────────────────────────────────────────┐      │   │
│  │  │        LLM Factory (Intelligent Routing)  │      │   │
│  │  └──────────────────────────────────────────┘      │   │
│  │         │                          │                 │   │
│  └─────────┼──────────────────────────┼─────────────────┘   │
│            │                          │                     │
│    ┌───────┴───────┐          ┌──────┴──────────┐          │
│    │ Local Hebrew  │          │  Claude API     │          │
│    │ LLM (DictaLM) │          │  (Anthropic)    │          │
│    │ [Ollama/LM]   │          │                 │          │
│    └───────────────┘          └─────────────────┘          │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Analytics Service  │  Feedback Service               │ │
│  └───────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │    MongoDB     │
                    │   (Database)   │
                    └────────────────┘
```

### Tech Stack

**Backend:**
- Node.js 18+
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Ollama/LM Studio (local LLM)
- Anthropic Claude API

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Axios

**Hebrew NLP:**
- DictaLM 2.0 (Hebrew LLM)
- Custom morphological analyzer
- Custom nikud assignment system
- Phonetic processing engine
- Vocabulary bank with 180+ tagged words

**DevOps:**
- Docker (optional)
- PM2 for process management
- Nginx for reverse proxy

---

## 🧪 Testing

### Run Integration Tests

```bash
cd backend
npm test backend/tests/integration/hebrewGeneration.test.js
```

### Manual Testing

Follow comprehensive manual testing checklist in [TESTING_GUIDE.md](./TESTING_GUIDE.md)

**Key Test Scenarios:**
- ✅ Generate all 7 activity types in Hebrew
- ✅ Verify nikud coverage ≥ 80%
- ✅ Test intelligent routing (Hebrew→local, English→Claude)
- ✅ Test failover (local unavailable → Claude)
- ✅ Validate Hebrew linguistic metadata
- ✅ Test feedback system
- ✅ Verify analytics tracking

---

## 📈 Project Status

### ✅ Phase 1: Backend API & LLM Integration (Completed)
- Basic activity generation
- Authentication system
- Database schema
- Claude API integration

### ✅ Phase 2: Hebrew Specialization & Local LLM (Completed)
- DictaLM 2.0 integration (Ollama/LM Studio)
- Hebrew linguistic services (nikud, phonetics, morphology)
- Vocabulary bank (180+ words)
- Content validator
- Intelligent routing with failover

### ✅ Phase 2.5: Enhanced Activity Templates (Completed - Current)
- 4 new Hebrew activity types (rhyming, morphological, prosody, bilingual)
- Enhanced articulation with Hebrew integration
- Hebrew linguistic services fully integrated into generation
- Activity routes updated and validated
- Comprehensive prompt templates

### ✅ Phase 3: Clinical Validation & Feedback (Completed - Current)
- Feedback collection system
- Analytics service with usage, cost, and quality metrics
- Hebrew-specific analytics
- Provider status monitoring
- CLINICIAN_GUIDE.md (bilingual)
- TESTING_GUIDE.md
- API_DOCUMENTATION.md
- Integration test suite

### 🚧 Phase 4: Clinical Pilot (Next)
- Deploy to production environment
- Onboard 5-10 Israeli clinicians
- Collect real-world usage data
- Iterate based on feedback
- Performance optimization
- Security hardening

### 🔮 Future Phases
- Patient progress tracking
- Activity library with search
- Multi-user collaboration
- Mobile apps (iOS/Android)
- Advanced analytics dashboard
- Webhook integrations

---

## 🤝 Contributing

This is a private project. For authorized contributors:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow coding standards (see CONTRIBUTING.md)
4. Write tests for new features
5. Commit changes (`git commit -m 'Add AmazingFeature'`)
6. Push to branch (`git push origin feature/AmazingFeature`)
7. Open Pull Request

**Development Branch for this Session:**
- `claude/phase2-phase3-hebrew-activities-013vtWDkyyVCpqVks1JyYtjz`

---

## 📝 Changelog

### [1.0.0] - 2025-01-15 (Phase 2.5 & 3)

**Added:**
- 4 new activity types: rhyming, morphological, prosody, bilingual
- Enhanced Hebrew articulation prompt with linguistic services
- Feedback collection system (model, controller, routes)
- Analytics service with 5 endpoints
- Provider status monitoring
- Integration test suite (backend/tests/integration/)
- CLINICIAN_GUIDE.md (bilingual Hebrew-English)
- TESTING_GUIDE.md (comprehensive manual + automated testing)
- API_DOCUMENTATION.md (complete API reference)

**Enhanced:**
- Activity generator now uses Hebrew services for preprocessing/postprocessing
- Automatic nikud assignment based on age group
- Vocabulary filtering by phoneme, theme, and age
- Content validation with quality scoring
- Hebrew linguistic metadata population

**Fixed:**
- Activity validation for all 7 types
- Route validation updated to include new types
- Prompt assembler supports language-specific templates

### [0.2.0] - 2024-12 (Phase 2)

**Added:**
- Local Hebrew LLM integration (DictaLM 2.0)
- Hebrew linguistic services (5 modules)
- Intelligent LLM routing
- Automatic failover
- Extended Activity schema with Hebrew metadata

### [0.1.0] - 2024-11 (Phase 1)

**Added:**
- Initial backend API
- Authentication system
- Basic activity generation
- 3 activity types (picture_matching, sequencing, articulation)
- MongoDB integration
- Claude API integration

---

## 📄 License

**Private** - For evaluation and authorized use only. Not for redistribution.

---

## 👥 Team

**Developed for:** Israeli Speech-Language Pathologists
**Primary Language:** Hebrew (עברית) with English support
**Target Age Range:** 2-6 years
**Platform Maintainer:** Thamam

---

## 📞 Support

**For Clinicians:**
- Email: support@naama-ai.com
- Documentation: https://docs.naama-ai.com
- Guide: [CLINICIAN_GUIDE.md](./CLINICIAN_GUIDE.md)

**For Developers:**
- Issues: https://github.com/thamam/Naama-AI/issues
- API Docs: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Deployment: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🙏 Acknowledgments

- **DictaLM 2.0** - Hebrew language model by Dicta
- **Anthropic Claude** - For advanced language processing
- **Israeli SLP Community** - For clinical guidance and feedback
- **Hebrew NLP Research** - For phoneme acquisition data and linguistic resources

---

**Made with ❤️ for Israeli speech-language pathologists**

*Naama-AI - Empowering clinicians with AI for better therapeutic outcomes*
