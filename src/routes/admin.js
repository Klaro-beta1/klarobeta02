const express = require('express');
const router = express.Router();

router.get('/clients', async (req, res, next) => {
  try {
    const clients = await req.db.all('SELECT id, email, domain, name, plan, status, created_at FROM clients ORDER BY created_at DESC');
    res.json({ clients });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const totalClients = await req.db.get('SELECT COUNT(*) as count FROM clients');
    const totalQueries = await req.db.get('SELECT COUNT(*) as count FROM queries');
    const avgConfidence = await req.db.get('SELECT AVG(confidence) as avg FROM queries');

    res.json({
      totalClients: totalClients.count,
      totalQueries: totalQueries.count,
      avgConfidence: avgConfidence.avg || 0
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
