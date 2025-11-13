# Naama-AI Backend API

Backend API server for the Naama-AI Speech Therapy Activity Generator. This service provides secure, scalable endpoints for generating age-appropriate speech therapy activities using LLM technology.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

- ✅ **RESTful API** with Express.js
- ✅ **JWT Authentication** for secure access
- ✅ **LLM Integration** with Anthropic Claude 3.5 Haiku
- ✅ **Provider Abstraction** for easy LLM switching
- ✅ **MongoDB Database** for data persistence
- ✅ **Rate Limiting** to control costs and prevent abuse
- ✅ **Input Validation** with express-validator
- ✅ **Error Handling** with custom error classes
- ✅ **Logging** with Winston
- ✅ **Security** with Helmet, CORS, and HTTPS
- ✅ **Hebrew Language Support** with proper nikud handling

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **MongoDB** 6.0 or higher (local or MongoDB Atlas)
- **Anthropic API Key** (get one at https://console.anthropic.com/)

Check versions:
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
mongod --version  # Should be v6.x or higher
```

## Installation

### 1. Clone the Repository

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- express, mongoose, jsonwebtoken
- @anthropic-ai/sdk
- helmet, cors, express-rate-limit
- winston, morgan
- and more...

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# Mac (Homebrew):
brew services start mongodb-community

# Linux (systemd):
sudo systemctl start mongod

# Windows:
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Use it in `.env` file

## Configuration

### 1. Create Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and set the following values:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database (update with your MongoDB connection string)
MONGODB_URI=mongodb://localhost:27017/naama-ai

# JWT Secret (generate a random string for production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
ANTHROPIC_MAX_TOKENS=2048

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # 100 requests per window

# Logging
LOG_LEVEL=info
```

**Important:**
- Replace `ANTHROPIC_API_KEY` with your actual API key
- Generate a strong JWT_SECRET for production (use: `openssl rand -base64 32`)
- Update `MONGODB_URI` if using MongoDB Atlas or different port

### 3. Verify Configuration

The server will validate required environment variables on startup. Missing values will cause the server to exit with an error message.

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Production Mode

```bash
npm start
```

### Expected Output

```
2025-11-13 10:00:00 [info]: MongoDB Connected: localhost
2025-11-13 10:00:00 [info]: LLM provider 'anthropic' initialized
2025-11-13 10:00:00 [info]:
    ================================================
    🚀 Server running in development mode
    🌐 URL: http://localhost:5000
    📝 API: http://localhost:5000/api
    ================================================
```

### Health Check

Verify the server is running:
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-13T10:00:00.000Z",
  "environment": "development"
}
```

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints Overview

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |

#### Activity Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/activities/generate` | Generate new activity | Yes |
| GET | `/api/activities` | List user's activities | Yes |
| GET | `/api/activities/:id` | Get specific activity | Yes |
| DELETE | `/api/activities/:id` | Delete activity | Yes |
| GET | `/api/activities/stats` | Get usage statistics | Yes |

### Detailed Endpoint Documentation

#### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "clinician@example.com",
  "password": "SecurePassword123",
  "name": "Dr. Sarah Cohen",
  "organization": "Speech Therapy Clinic"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "clinician@example.com",
      "name": "Dr. Sarah Cohen",
      "role": "clinician",
      "organization": "Speech Therapy Clinic",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "clinician@example.com",
  "password": "SecurePassword123"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ...user object... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Generate Activity

```http
POST /api/activities/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "activityType": "articulation",
  "ageGroup": "4-6",
  "targetSound": "s",
  "language": "en",
  "soundPosition": "initial",
  "itemCount": 8,
  "description": "Practice 'S' sound for 5-year-old"
}
```

**Request Parameters:**

| Parameter | Type | Required | Values | Description |
|-----------|------|----------|--------|-------------|
| activityType | string | Yes | `picture_matching`, `sequencing`, `articulation` | Type of activity |
| ageGroup | string | Yes | `2-3`, `3-4`, `4-6` | Target age group |
| language | string | No | `en`, `he` | Language (default: `en`) |
| targetSound | string | Conditional | Any phoneme | Required for articulation |
| theme | string | No | Any string | Theme for matching/sequencing |
| soundPosition | string | No | `initial`, `medial`, `final` | Position of target sound |
| itemCount | number | No | 1-20 | Number of items (auto-calculated if omitted) |

Response (200 OK):
```json
{
  "success": true,
  "message": "Activity generated successfully",
  "data": {
    "activity": {
      "_id": "507f1f77bcf86cd799439011",
      "type": "articulation",
      "ageGroup": "4-6",
      "language": "en",
      "targetSound": "s",
      "content": {
        "title": "Practice 'S' Sound",
        "instructions": "Have the child repeat each word...",
        "words": [
          {
            "word": "sun",
            "phonetic": "sʌn",
            "syllables": 1,
            "soundPosition": "initial",
            "difficulty": "easy",
            "visualCue": "bright yellow sun in the sky",
            "practiceTip": "Emphasize the 's' sound at the beginning"
          },
          // ... more words
        ],
        "warmUpExercises": [...],
        "tips": "...",
        "commonMistakes": "...",
        "progressionSuggestions": "..."
      },
      "createdAt": "2025-11-13T10:00:00.000Z"
    },
    "metadata": {
      "provider": "anthropic",
      "model": "claude-3-5-haiku-20241022",
      "tokensUsed": 1523,
      "generationTime": 2341
    }
  }
}
```

#### 4. List Activities

```http
GET /api/activities?limit=20&skip=0&type=articulation&ageGroup=4-6
Authorization: Bearer YOUR_JWT_TOKEN
```

Query Parameters:
- `limit` (number, default: 20): Number of activities to return
- `skip` (number, default: 0): Number of activities to skip (pagination)
- `type` (string, optional): Filter by activity type
- `ageGroup` (string, optional): Filter by age group

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "_id": "...",
        "type": "articulation",
        "ageGroup": "4-6",
        "title": "Practice 'S' Sound",
        "createdAt": "2025-11-13T10:00:00.000Z"
      },
      // ... more activities (content excluded in list view)
    ],
    "count": 20
  }
}
```

#### 5. Get Activity by ID

```http
GET /api/activities/507f1f77bcf86cd799439011
Authorization: Bearer YOUR_JWT_TOKEN
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "activity": {
      // Full activity object including content
    }
  }
}
```

#### 6. Get Statistics

```http
GET /api/activities/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "totalActivities": 45,
    "byType": [
      {
        "_id": "articulation",
        "count": 20,
        "totalUsage": 156,
        "avgTokens": 1523.5
      },
      {
        "_id": "picture_matching",
        "count": 15,
        "totalUsage": 98,
        "avgTokens": 1124.3
      },
      {
        "_id": "sequencing",
        "count": 10,
        "totalUsage": 67,
        "avgTokens": 1456.7
      }
    ],
    "apiUsage": {
      "totalRequests": 45,
      "lastRequest": "2025-11-13T10:00:00.000Z"
    }
  }
}
```

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "stack": "Error stack trace (development only)"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Rate Limiting

**General API:** 100 requests per 15 minutes
**Activity Generation:** 10 requests per minute
**Authentication:** 5 attempts per 15 minutes

Rate limit headers are included in responses:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1699876543
```

## Architecture

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration and setup
│   │   ├── index.js     # Main config
│   │   ├── database.js  # MongoDB connection
│   │   └── logger.js    # Winston logger
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   └── activityController.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # JWT authentication
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   └── Activity.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   └── activityRoutes.js
│   ├── services/        # Business logic
│   │   ├── llm/         # LLM provider abstraction
│   │   │   ├── BaseLLMProvider.js
│   │   │   ├── AnthropicProvider.js
│   │   │   └── LLMFactory.js
│   │   ├── activityGenerator.js
│   │   └── promptAssembler.js
│   ├── templates/       # Prompt templates
│   │   ├── pictureMatchingPrompt.js
│   │   ├── sequencingPrompt.js
│   │   └── articulationPrompt.js
│   └── server.js        # Express app entry point
├── logs/                # Log files (auto-created)
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Example environment file
├── .gitignore
├── package.json
└── README.md
```

### Key Components

**1. LLM Provider Abstraction**
- `BaseLLMProvider`: Abstract base class
- `AnthropicProvider`: Anthropic Claude implementation
- `LLMFactory`: Creates and caches provider instances
- Easy to add new providers (OpenAI, Cohere, etc.)

**2. Prompt Templates**
- Modular templates for each activity type
- Support for multiple languages (EN, HE)
- Age-appropriate content guidelines
- Structured JSON output format

**3. Security Layers**
- JWT authentication
- Rate limiting (general + per-endpoint)
- Input validation
- Helmet security headers
- CORS configuration
- HTTPS support (production)

**4. Database Models**
- User: Authentication and profile
- Activity: Generated activities with metadata
- Mongoose schemas with validation
- Indexes for efficient queries

## Security

### Best Practices Implemented

1. **API Key Security**
   - Never exposed to frontend
   - Stored in environment variables
   - Validated on server startup

2. **Authentication**
   - JWT tokens with expiration
   - Secure password hashing (bcrypt)
   - Token verification on protected routes

3. **Rate Limiting**
   - Prevents API abuse
   - Controls LLM costs
   - Per-user and per-IP limits

4. **Input Validation**
   - express-validator for all inputs
   - Mongoose schema validation
   - Sanitization of user data

5. **Error Handling**
   - No sensitive data in error messages
   - Stack traces only in development
   - Comprehensive logging

6. **HTTPS/TLS**
   - Required for production
   - Secure communication
   - Certificate management

7. **CORS**
   - Configured for specific frontend origin
   - Credentials support
   - Preflight handling

### Production Security Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Use HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Configure firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use environment-specific `.env` files
- [ ] Implement API key rotation
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Testing

### Manual Testing with curl

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

**Generate Activity:**
```bash
curl -X POST http://localhost:5000/api/activities/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "activityType": "articulation",
    "ageGroup": "4-6",
    "targetSound": "s",
    "language": "en"
  }'
```

### Testing the LLM Integration

The server includes built-in validation and error handling for LLM responses:

1. **Valid JSON check**: Ensures LLM returns parseable JSON
2. **Structure validation**: Verifies required fields exist
3. **Content validation**: Checks activity-specific requirements
4. **Token usage tracking**: Monitors API costs

To test with different prompts, see `src/templates/` directory.

## Deployment

### Environment Setup

**Development:**
```bash
NODE_ENV=development
```

**Production:**
```bash
NODE_ENV=production
```

### Deployment Platforms

**Heroku:**
```bash
# Install Heroku CLI
# Login and create app
heroku create naama-ai-api

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set ANTHROPIC_API_KEY=your-api-key
heroku config:set JWT_SECRET=$(openssl rand -base64 32)

# Deploy
git push heroku main
```

**AWS EC2:**
1. Launch EC2 instance (Ubuntu 22.04 LTS)
2. Install Node.js and MongoDB
3. Clone repository
4. Set up `.env` file
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name naama-ai
   pm2 startup
   pm2 save
   ```
6. Configure Nginx as reverse proxy
7. Set up SSL with Let's Encrypt

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

Build and run:
```bash
docker build -t naama-ai-backend .
docker run -p 5000:5000 --env-file .env naama-ai-backend
```

### MongoDB Production Setup

**MongoDB Atlas (Recommended):**
1. Create account at mongodb.com/cloud/atlas
2. Create cluster
3. Whitelist server IP
4. Create database user
5. Get connection string
6. Update `MONGODB_URI` in `.env`

### Monitoring

**Logging:**
- Logs stored in `logs/` directory
- `error.log`: Error-level logs
- `combined.log`: All logs
- Winston handles log rotation

**Health Checks:**
```bash
# Simple health check
curl http://your-domain.com/health

# Detailed monitoring
# Integrate with services like:
# - Datadog
# - New Relic
# - Sentry (error tracking)
```

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
Error: MongoDB connection failed
```
Solution:
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- Ensure network access (whitelist IP for Atlas)

**2. Anthropic API Error**
```
Error: Invalid Anthropic API key
```
Solution:
- Verify API key in `.env`
- Check key is active at console.anthropic.com
- Ensure no extra spaces in `.env` file

**3. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
Solution:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 PID

# Or change PORT in .env
PORT=5001
```

**4. JWT Token Invalid**
```
Error: Invalid token
```
Solution:
- Token may be expired (default: 7 days)
- Re-authenticate to get new token
- Check JWT_SECRET hasn't changed

## Support and Contributing

For issues, feature requests, or contributions:
1. Check existing issues
2. Create detailed bug reports
3. Follow code style guidelines
4. Write tests for new features

## License

Private - For authorized use only

## Next Steps

After setting up the backend:

1. **Test All Endpoints**: Use the curl examples above
2. **Monitor Logs**: Check `logs/` directory for issues
3. **Integrate Frontend**: Update frontend to call these APIs
4. **Add More Providers**: Implement OpenAI, Cohere, etc.
5. **Add Analytics**: Track usage patterns and costs
6. **Implement Caching**: Add Redis for frequently generated activities
7. **Add Real-time Features**: WebSocket for live generation updates

---

**API Version:** 1.0.0
**Last Updated:** November 2025
**Minimum Node Version:** 18.0.0
