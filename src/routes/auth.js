const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { DatabaseService } = require('../utils/database');

const db = new DatabaseService();

/**
 * Admin Login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Check if this is the default admin login
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@klaro.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPassword) {
      const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token,
        user: {
          email,
          role: 'admin'
        }
      });
    }

    // TODO: Implement proper user authentication with database
    res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

/**
 * Client Registration
 */
router.post('/register', async (req, res) => {
  try {
    const { email, domain, name } = req.body;

    if (!email || !domain || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, domain, and name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        error: 'Invalid domain',
        message: 'Please provide a valid domain (e.g., example.com)'
      });
    }

    // Check if client already exists
    const existingClient = await db.getClient(email);
    if (existingClient) {
      return res.status(409).json({
        error: 'Client already exists',
        message: 'A client with this email already exists'
      });
    }

    // Create new client
    const client = await db.createClient({
      email,
      domain,
      name,
      status: 'active'
    });

    res.status(201).json({
      message: 'Client registered successfully',
      client: {
        id: client.id,
        email: client.email,
        domain: client.domain,
        name: client.name,
        apiKey: client.api_key,
        status: client.status,
        createdAt: client.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

/**
 * Token Validation
 */
router.get('/validate', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    res.json({
      valid: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    });

  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
      valid: false
    });
  }
});

/**
 * Logout (client-side token removal)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;