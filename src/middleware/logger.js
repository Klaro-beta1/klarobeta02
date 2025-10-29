/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(
      `${new Date().toISOString()} - ${logLevel} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
    
    // Log additional details for errors
    if (res.statusCode >= 400) {
      console.log(`  User-Agent: ${req.get('User-Agent')}`);
      console.log(`  IP: ${req.ip}`);
      if (req.headers['x-api-key']) {
        console.log(`  API Key: ${req.headers['x-api-key'].substring(0, 10)}...`);
      }
    }
  });
  
  next();
}

/**
 * API usage logger
 * Logs API usage for analytics
 */
function apiUsageLogger(req, res, next) {
  // Only log API routes
  if (!req.path.startsWith('/api/')) {
    return next();
  }
  
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    apiKey: req.headers['x-api-key']?.substring(0, 10) + '...' || null,
    responseTime: null,
    statusCode: null
  };
  
  const start = Date.now();
  
  res.on('finish', () => {
    logData.responseTime = Date.now() - start;
    logData.statusCode = res.statusCode;
    
    // TODO: Store in database for analytics
    console.log('API Usage:', JSON.stringify(logData));
  });
  
  next();
}

module.exports = {
  requestLogger,
  apiUsageLogger
};