const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../middleware/auth');
const HybridAiService = require('../services/hybridAiService');

const aiService = new HybridAiService();

router.post('/query', validateApiKey, async (req, res, next) => {
  try {
    const { query, url, dom } = req.body;

    if (!query || !url) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Query and URL are required'
      });
    }

    const result = await aiService.processQuery(query, url, dom);

    await req.db.run(
      'INSERT INTO queries (client_id, query, url, response, confidence, processing_time) VALUES (?, ?, ?, ?, ?, ?)',
      [req.client.id, query, url, JSON.stringify(result), result.confidence, result.processingTime]
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', validateApiKey, async (req, res, next) => {
  try {
    const queries = await req.db.all(
      'SELECT COUNT(*) as total, AVG(confidence) as avgConfidence, AVG(processing_time) as avgProcessingTime FROM queries WHERE client_id = ?',
      [req.client.id]
    );

    res.json({
      client: req.client.domain,
      analytics: queries[0]
    });
  } catch (error) {
    next(error);
  }
});

router.get('/ai-health', async (req, res, next) => {
  try {
    const health = await aiService.healthCheck();

    res.json({
      success: true,
      services: health,
      overall: health.fallback ? 'operational' : 'degraded',
      note: 'Hybrid AI service provides intelligent fallbacks when external APIs are unavailable'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
