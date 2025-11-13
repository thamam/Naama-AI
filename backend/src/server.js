import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import logger from './config/logger.js';
import connectDatabase from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

// Validate configuration
try {
  config.validate();
} catch (error) {
  logger.error('Configuration validation failed:', error.message);
  process.exit(1);
}

// Create Express app
const app = express();

// Connect to database
connectDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Naama-AI Speech Therapy Activity Generator API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/password'
      },
      activities: {
        generate: 'POST /api/activities/generate',
        list: 'GET /api/activities',
        get: 'GET /api/activities/:id',
        delete: 'DELETE /api/activities/:id',
        stats: 'GET /api/activities/stats'
      }
    },
    documentation: `${config.apiBaseUrl}/api/docs`
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`
    ================================================
    🚀 Server running in ${config.env} mode
    🌐 URL: ${config.apiBaseUrl}
    📝 API: ${config.apiBaseUrl}/api
    ================================================
  `);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...');

  server.close(() => {
    logger.info('HTTP server closed');

    // Close database connection
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
