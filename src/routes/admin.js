const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { DatabaseService } = require('../utils/database');

const db = new DatabaseService();

/**
 * Get all clients (admin only)
 */
router.get('/clients', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    
    const clients = await db.getAllClients({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    // Add usage statistics for each client
    const clientsWithStats = await Promise.all(
      clients.data.map(async (client) => {
        const usage = await db.getClientUsage(client.apiKey);
        return {
          ...client,
          totalQueries: usage.totalQueries,
          queriesThisMonth: usage.queriesThisMonth,
          lastActive: usage.lastActive
        };
      })
    );

    res.json({
      success: true,
      data: clientsWithStats,
      pagination: clients.pagination,
      total: clients.total
    });

  } catch (error) {
    console.error('Admin clients error:', error);
    res.status(500).json({
      error: 'Failed to fetch clients',
      message: error.message
    });
  }
});

/**
 * Get client details (admin only)
 */
router.get('/clients/:apiKey', requireAuth, async (req, res) => {
  try {
    const { apiKey } = req.params;
    
    const client = await db.getClient(apiKey);
    if (!client) {
      return res.status(404).json({
        error: 'Client not found'
      });
    }

    const analytics = await db.getClientAnalytics(apiKey, '30d');
    const recentQueries = await db.getRecentQueries(apiKey, 20);

    res.json({
      success: true,
      client: {
        ...client,
        analytics,
        recentQueries
      }
    });

  } catch (error) {
    console.error('Admin client details error:', error);
    res.status(500).json({
      error: 'Failed to fetch client details',
      message: error.message
    });
  }
});

/**
 * Update client (admin only)
 */
router.put('/clients/:apiKey', requireAuth, async (req, res) => {
  try {
    const { apiKey } = req.params;
    const updates = req.body;

    // Validate allowed updates
    const allowedFields = ['domain', 'plan', 'status', 'email'];
    const filteredUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        allowedFields
      });
    }

    const updated = await db.updateClient(apiKey, filteredUpdates);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      client: updated
    });

  } catch (error) {
    console.error('Admin client update error:', error);
    res.status(500).json({
      error: 'Failed to update client',
      message: error.message
    });
  }
});

/**
 * Delete client (admin only)
 */
router.delete('/clients/:apiKey', requireAuth, async (req, res) => {
  try {
    const { apiKey } = req.params;
    
    const deleted = await db.deleteClient(apiKey);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    console.error('Admin client delete error:', error);
    res.status(500).json({
      error: 'Failed to delete client',
      message: error.message
    });
  }
});

/**
 * Get system statistics (admin only)
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = await db.getSystemStats();
    
    res.json({
      success: true,
      stats: {
        totalClients: stats.totalClients,
        activeClients: stats.activeClients,
        totalQueries: stats.totalQueries,
        queriesThisMonth: stats.queriesThisMonth,
        queriesThisWeek: stats.queriesThisWeek,
        queriesToday: stats.queriesToday,
        averageQueriesPerClient: stats.averageQueriesPerClient,
        topDomains: stats.topDomains,
        planDistribution: stats.planDistribution,
        revenueEstimate: calculateRevenue(stats.planDistribution)
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * Get recent activity (admin only)
 */
router.get('/activity', requireAuth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const activity = await db.getRecentActivity(parseInt(limit));
    
    res.json({
      success: true,
      activity
    });

  } catch (error) {
    console.error('Admin activity error:', error);
    res.status(500).json({
      error: 'Failed to fetch activity',
      message: error.message
    });
  }
});

/**
 * Create new client (admin only)
 */
router.post('/clients', requireAuth, async (req, res) => {
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
      createdAt: new Date().toISOString(),
      status: 'active'
    });

    res.json({
      success: true,
      client,
      embedCode: `<script src="${process.env.CDN_URL || 'http://localhost:3000'}/klaro.js?key=${apiKey}"></script>`
    });

  } catch (error) {
    console.error('Admin create client error:', error);
    res.status(500).json({
      error: 'Failed to create client',
      message: error.message
    });
  }
});

// Helper function to calculate revenue estimate
function calculateRevenue(planDistribution) {
  const pricing = {
    tier1: 1,    // $1/month
    tier2: 19,   // $19/month
    tier3: 99    // $99/month
  };

  let totalRevenue = 0;
  for (const [plan, count] of Object.entries(planDistribution)) {
    totalRevenue += (pricing[plan] || 0) * count;
  }

  return {
    monthly: totalRevenue,
    annual: totalRevenue * 12
  };
}

module.exports = router;