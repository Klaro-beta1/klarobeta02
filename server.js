/**
 * KLARO AI - ENHANCED BACKEND API SERVER
 * A production-ready AI assistant service for websites
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes and middleware
const apiRoutes = require('./src/routes/api');
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const { errorHandler } = require('./src/middleware/errorHandler');
const { requestLogger } = require('./src/middleware/logger');
const { validateApiKey } = require('./src/middleware/auth');
const SupabaseDatabase = require('./src/utils/supabase');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Supabase database
const db = new SupabaseDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for embed
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // In development, allow all origins
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Database middleware
app.use(db.middleware());

// Serve static files (embed script, assets)
app.use(express.static('public', {
  maxAge: NODE_ENV === 'production' ? '1d' : '0',
  etag: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve demo page
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'demo.html'));
});

// Serve embed script with proper headers
app.get('/klaro.js', (req, res) => {
  res.set({
    'Content-Type': 'application/javascript',
    'Cache-Control': NODE_ENV === 'production' ? 'public, max-age=3600' : 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.sendFile(path.join(__dirname, 'public', 'klaro.js'));
});

// Serve dashboard (if built)
const dashboardPath = path.join(__dirname, 'dashboard', 'build');
app.use('/dashboard', express.static(dashboardPath));

// Dashboard fallback for SPA routing
app.get('/dashboard/*', (req, res) => {
  res.sendFile(path.join(dashboardPath, 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found.',
    path: req.originalUrl
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Klaro AI Assistant API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Embed script: http://localhost:${PORT}/klaro.js`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  
  if (NODE_ENV === 'development') {
    console.log('\n📝 Development Notes:');
    console.log('- Copy your Claude API key to .env file');
    console.log('- Test the embed script at /klaro.js?key=test');
    console.log('- Admin dashboard available at /dashboard');
  }
});

module.exports = app;