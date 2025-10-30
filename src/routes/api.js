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

    await req.db.insert('queries', {
      client_id: req.client.id,
      query,
      url,
      response: result,
      confidence: result.confidence,
      processing_time: result.processingTime
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', validateApiKey, async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('queries')
      .select('confidence, processing_time')
      .eq('client_id', req.client.id);

    if (error) throw error;

    const analytics = {
      total: data.length,
      avgConfidence: data.reduce((sum, q) => sum + (q.confidence || 0), 0) / (data.length || 1),
      avgProcessingTime: data.reduce((sum, q) => sum + (q.processing_time || 0), 0) / (data.length || 1)
    };

    res.json({
      client: req.client.domain,
      analytics
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
