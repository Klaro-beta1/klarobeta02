async function validateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key is required'
      });
    }

    const { data: client, error } = await req.supabase
      .from('clients')
      .select('*')
      .eq('api_key', apiKey)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to validate API key'
      });
    }

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
