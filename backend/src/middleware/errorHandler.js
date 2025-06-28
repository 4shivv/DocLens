const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle known error types
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = error.details;
  } else if (error.name === 'MulterError') {
    // Multer file upload errors
    statusCode = 400;
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = 'File upload error';
    }
    details = { code: error.code };
  } else if (error.code === 'ENOENT') {
    statusCode = 404;
    message = 'File not found';
  } else if (error.code === 'ENOSPC') {
    statusCode = 507;
    message = 'Insufficient storage space';
  } else if (error.name === 'FirebaseError') {
    statusCode = 503;
    message = 'Database service unavailable';
    details = { service: 'firebase' };
  } else if (error.message?.includes('Gemini') || error.message?.includes('API')) {
    statusCode = 503;
    message = 'AI service temporarily unavailable';
    details = { service: 'gemini' };
  } else if (error.name === 'TimeoutError') {
    statusCode = 408;
    message = 'Request timeout';
  } else if (error.name === 'RangeError' || error.name === 'TypeError') {
    statusCode = 400;
    message = 'Invalid request data';
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        originalError: error.message 
      })
    }
  };

  // Add request ID if available
  if (req.requestId) {
    errorResponse.error.requestId = req.requestId;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);

  // Log additional details for critical errors
  if (statusCode >= 500) {
    logger.error('Critical error details:', {
      statusCode,
      message,
      details,
      requestId: req.requestId,
      stack: error.stack
    });
  }
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Async error wrapper to catch promise rejections
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request timeout handler
 */
const timeoutHandler = (timeoutMs = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeoutMs, () => {
      const error = new ApiError(408, 'Request timeout');
      next(error);
    });
    next();
  };
};

/**
 * Add request ID for tracking
 */
const requestIdHandler = (req, res, next) => {
  const { v4: uuidv4 } = require('uuid');
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  timeoutHandler,
  requestIdHandler
};
