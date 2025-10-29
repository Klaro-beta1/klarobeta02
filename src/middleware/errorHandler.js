/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let status = 500;
  let message = 'Internal server error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
    details = err.details;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    message = 'Not found';
  } else if (err.name === 'RateLimitError') {
    status = 429;
    message = 'Too many requests';
  } else if (err.code === 'ECONNREFUSED') {
    status = 503;
    message = 'Service unavailable';
  } else if (err.code === 'ENOTFOUND') {
    status = 502;
    message = 'Bad gateway';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Something went wrong';
    details = null;
  } else if (process.env.NODE_ENV === 'development') {
    details = {
      stack: err.stack,
      ...details
    };
  }

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(details && { details })
  });
}

/**
 * 404 handler for unmatched routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    status: 404,
    timestamp: new Date().toISOString()
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};