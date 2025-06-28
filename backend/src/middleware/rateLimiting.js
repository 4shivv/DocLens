const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General API rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      type: 'rate_limit_exceeded',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        type: 'rate_limit_exceeded',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
      }
    });
  }
});

/**
 * Stricter rate limiter for file uploads
 */
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per 15 minutes
  message: {
    success: false,
    error: {
      message: 'Too many file uploads from this IP, please try again later.',
      type: 'upload_rate_limit_exceeded',
      retryAfter: 900
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      fileName: req.file?.originalname
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many file uploads from this IP, please try again later.',
        type: 'upload_rate_limit_exceeded',
        retryAfter: 900
      }
    });
  }
});

/**
 * Rate limiter for processing requests
 */
const processingRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 processing requests per 5 minutes
  message: {
    success: false,
    error: {
      message: 'Too many processing requests from this IP, please try again later.',
      type: 'processing_rate_limit_exceeded',
      retryAfter: 300
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn(`Processing rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      documentId: req.params.id
    });
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many processing requests from this IP, please try again later.',
        type: 'processing_rate_limit_exceeded',
        retryAfter: 300
      }
    });
  }
});

/**
 * Rate limiter for health check endpoints (very permissive)
 */
const healthCheckRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 health checks per minute
  message: {
    success: false,
    error: {
      message: 'Too many health check requests.',
      type: 'health_check_rate_limit_exceeded'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Custom rate limiter factory
 */
const createCustomRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      success: false,
      error: {
        message: 'Rate limit exceeded',
        type: 'rate_limit_exceeded'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Rate limiter that varies by endpoint
 */
const dynamicRateLimit = (req, res, next) => {
  // Different limits based on endpoint
  if (req.path.includes('/upload')) {
    return uploadRateLimit(req, res, next);
  } else if (req.path.includes('/process')) {
    return processingRateLimit(req, res, next);
  } else if (req.path.includes('/health')) {
    return healthCheckRateLimit(req, res, next);
  } else {
    return generalLimiter(req, res, next);
  }
};

/**
 * Rate limiter with API key bypass
 */
const rateLimitWithApiKeyBypass = (baseRateLimit) => {
  return (req, res, next) => {
    // Skip rate limiting for requests with valid API keys
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.API_KEY) {
      return next();
    }
    
    return baseRateLimit(req, res, next);
  };
};

/**
 * Middleware to log rate limit hits
 */
const logRateLimitHits = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      logger.warn('Rate limit hit:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  generalLimiter,
  uploadRateLimit,
  processingRateLimit,
  healthCheckRateLimit,
  dynamicRateLimit,
  createCustomRateLimit,
  rateLimitWithApiKeyBypass,
  logRateLimitHits
};
