const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../middleware/auth');
const { AIService } = require('../utils/aiService');
const { ScrapingService } = require('../utils/scrapingService');
const { DatabaseService } = require('../utils/database');
const RealAiService = require('../services/realAiService');
const HybridAiService = require('../services/hybridAiService');

const aiService = new AIService();
const scrapingService = new ScrapingService();
const db = new DatabaseService();
const realAiService = new RealAiService();
const hybridAiService = new HybridAiService();

/**
 * Main AI Query Endpoint
 * Handles user questions and returns AI responses with optional element highlighting
 */
router.post('/query', validateApiKey, async (req, res) => {
  try {
    const { apiKey } = req;
    const { query, url, dom, userAgent, timestamp } = req.body;

    // Validate required fields
    if (!query || !url) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['query', 'url']
      });
    }

    // Get client information
    const client = await db.getClient(apiKey);
    if (!client) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check usage limits based on plan
    const usage = await db.getClientUsage(apiKey);
    const limits = {
      tier1: 1000,  // 1000 queries per month
      tier2: 10000, // 10000 queries per month
      tier3: 50000  // 50000 queries per month
    };

    if (usage.monthlyQueries >= (limits[client.plan] || limits.tier1)) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        message: `You have reached your monthly limit of ${limits[client.plan]} queries. Please upgrade your plan.`,
        currentUsage: usage.monthlyQueries,
        limit: limits[client.plan]
      });
    }

    // Log the query for analytics
    await db.logQuery({
      apiKey,
      query,
      url,
      userAgent,
      timestamp: timestamp || new Date().toISOString()
    });

    // Get or scrape page data
    let pageData = await db.getPageData(url);
    if (!pageData || isDataStale(pageData.lastUpdated)) {
      console.log(`Scraping fresh data for: ${url}`);
      pageData = await scrapingService.scrapePage(url);
      if (pageData) {
        await db.savePageData(url, pageData);
      }
    }

    // Generate AI response using hybrid AI service (with fallbacks)
    console.log(`🤖 Processing query with hybrid AI: "${query}" for ${url}`);
    const aiResponse = await hybridAiService.processQuery(query, url, dom);

    // Return response
    res.json({
      message: aiResponse.message,
      highlight: aiResponse.highlight,
      steps: aiResponse.steps,
      confidence: aiResponse.confidence,
      processingTime: aiResponse.processingTime
    });

  } catch (error) {
    console.error('Query processing error:', error);
    
    // Return user-friendly error messages
    if (error.message.includes('Claude API')) {
      return res.status(503).json({
        error: 'AI service temporarily unavailable',
        message: 'Please try again in a moment.'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process your query. Please try again.'
    });
  }
});

/**
 * Bulk Website Scraping Endpoint
 * Scrapes multiple pages of a website for better AI context
 */
router.post('/scrape', validateApiKey, async (req, res) => {
  try {
    const { apiKey } = req;
    const { domain, maxPages = 50 } = req.body;

    if (!domain) {
      return res.status(400).json({
        error: 'Missing required field: domain'
      });
    }

    const client = await db.getClient(apiKey);
    if (!client) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Validate domain matches client's registered domain
    const clientDomain = new URL(client.domain).hostname;
    const requestedDomain = new URL(domain).hostname;
    
    if (clientDomain !== requestedDomain) {
      return res.status(403).json({
        error: 'Domain mismatch',
        message: 'You can only scrape pages from your registered domain.'
      });
    }

    // Start scraping process
    const scrapingJob = await scrapingService.scrapeWebsite(domain, maxPages);
    
    // Store scraped data
    for (const [url, data] of Object.entries(scrapingJob.pages)) {
      await db.savePageData(url, data);
    }

    res.json({
      success: true,
      pagesScraped: scrapingJob.pagesScraped,
      totalPages: scrapingJob.totalPages,
      errors: scrapingJob.errors,
      message: `Successfully scraped ${scrapingJob.pagesScraped} pages`
    });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      error: 'Scraping failed',
      message: 'Failed to scrape website. Please try again.'
    });
  }
});

/**
 * Client Analytics Endpoint
 * Returns usage statistics and recent queries
 */
router.get('/analytics', validateApiKey, async (req, res) => {
  try {
    const { apiKey } = req;
    const { timeframe = '30d' } = req.query;

    const client = await db.getClient(apiKey);
    if (!client) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const analytics = await db.getClientAnalytics(apiKey, timeframe);

    res.json({
      domain: client.domain,
      plan: client.plan,
      timeframe,
      totalQueries: analytics.totalQueries,
      queriesThisMonth: analytics.queriesThisMonth,
      averageResponseTime: analytics.averageResponseTime,
      topQueries: analytics.topQueries,
      recentQueries: analytics.recentQueries,
      dailyStats: analytics.dailyStats,
      usageLimit: getUsageLimit(client.plan),
      remainingQueries: getUsageLimit(client.plan) - analytics.queriesThisMonth
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: 'Please try again later.'
    });
  }
});

/**
 * Test Endpoint
 * For testing API connectivity and authentication
 */
router.get('/test', validateApiKey, async (req, res) => {
  try {
    const { apiKey } = req;
    const client = await db.getClient(apiKey);
    
    res.json({
      success: true,
      message: 'API connection successful',
      client: {
        domain: client.domain,
        plan: client.plan,
        createdAt: client.createdAt
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
});

/**
 * Client Registration Endpoint (for development/testing)
 */
router.post('/register', async (req, res) => {
  try {
    const { domain, plan = 'tier1', email } = req.body;

    if (!domain) {
      return res.status(400).json({
        error: 'Missing required field: domain'
      });
    }

    // Validate domain format
    try {
      new URL(domain);
    } catch (e) {
      return res.status(400).json({
        error: 'Invalid domain format',
        message: 'Please provide a valid URL (e.g., https://example.com)'
      });
    }

    // Generate API key
    const apiKey = 'klaro_' + Math.random().toString(36).substr(2, 20);

    // Create client record
    const client = await db.createClient({
      apiKey,
      domain,
      plan,
      email,
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      apiKey,
      domain,
      plan,
      embedCode: `<script src="${process.env.CDN_URL || 'http://localhost:3000'}/klaro.js?key=${apiKey}"></script>`,
      message: 'Client registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Failed to register client. Please try again.'
    });
  }
});

/**
 * AI Services Health Check Endpoint
 * Check the status of all AI services (FireCrawl, GLM, OpenAI)
 */
router.get('/ai-health', async (req, res) => {
  try {
    const healthStatus = await hybridAiService.healthCheck();
    
    res.json({
      success: true,
      services: healthStatus,
      overall: healthStatus.fallback ? 'operational' : 'degraded',
      note: 'Hybrid AI service provides intelligent fallbacks when external APIs are unavailable'
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message
    });
  }
});

// Helper functions
function isDataStale(lastUpdated, maxAge = 24 * 60 * 60 * 1000) { // 24 hours
  return !lastUpdated || (Date.now() - new Date(lastUpdated).getTime()) > maxAge;
}

function getUsageLimit(plan) {
  const limits = {
    tier1: 1000,
    tier2: 10000,
    tier3: 50000
  };
  return limits[plan] || limits.tier1;
}

module.exports = router;