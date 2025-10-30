const express = require('express');
const router = express.Router();

router.get('/clients', async (req, res, next) => {
  try {
    const clients = await req.db.all('clients', 'id, email, domain, name, plan, status, created_at');
    res.json({ clients });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const clients = await req.db.all('clients');
    const queries = await req.db.all('queries');

    const avgConfidence = queries.reduce((sum, q) => sum + (q.confidence || 0), 0) / (queries.length || 1);

    res.json({
      totalClients: clients.length,
      totalQueries: queries.length,
      avgConfidence
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
