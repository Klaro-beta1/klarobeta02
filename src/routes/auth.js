const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res, next) => {
  try {
    const { email, domain, name, plan = 'tier1' } = req.body;

    if (!email || !domain || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, domain, and name are required'
      });
    }

    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        error: 'Invalid domain',
        message: 'Please provide a valid domain (e.g., example.com)'
      });
    }

    const existing = await req.db.get('clients', '*', { email });
    if (existing) {
      return res.status(409).json({
        error: 'Client already exists',
        message: 'A client with this email or domain already exists'
      });
    }

    const apiKey = `klaro_${uuidv4().replace(/-/g, '')}`;

    const client = await req.db.insert('clients', {
      email,
      domain,
      name,
      api_key: apiKey,
      plan,
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
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: { email, role: 'admin' }
      });
    }

    res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
