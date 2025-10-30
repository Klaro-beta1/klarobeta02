async function validateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required'
      });
    }

    const client = await req.db.get('clients', '*', { api_key: apiKey });

    if (!client) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key'
      });
    }

    if (client.status !== 'active') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Your account is not active'
      });
    }

    req.client = client;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { validateApiKey };
