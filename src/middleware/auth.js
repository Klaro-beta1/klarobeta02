const jwt = require('jsonwebtoken');
const { DatabaseService } = require('../utils/database');

const db = new DatabaseService();

/**
 * Validate API Key middleware
 * Used for client API requests
 */
async function validateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        error: 'Missing API key',
        message: 'Please provide your API key in the X-API-Key header'
      });
    }

    // Validate API key format
    if (!apiKey.startsWith('klaro_')) {
      return res.status(401).json({
        error: 'Invalid API key format',
        message: 'API key must start with "klaro_"'
      });
    }

    // Check if API key exists and is active
    const client = await db.getClient(apiKey);
    if (!client) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is not valid or has been deactivated'
      });
    }

    if (client.status !== 'active') {
      return res.status(403).json({
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Add client info to request
    req.apiKey = apiKey;
    req.client = client;
    
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to validate API key'
    });
  }
}

/**
 * Require authentication middleware
 * Used for admin routes
 */
function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid authentication token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Admin access required'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to authenticate request'
    });
  }
}

/**
 * Optional authentication middleware
 * Adds user info if token is present, but doesn't require it
 */
function optionalAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
}

module.exports = {
  validateApiKey,
  requireAuth,
  optionalAuth
};