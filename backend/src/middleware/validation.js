const { body, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    logger.warn('Validation failed:', errorMessages);
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        errors: errorMessages
      }
    });
  }
  next();
};

/**
 * Validate file upload
 */
const validateFileUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const file = req.file;
    
    // Check file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 52428800; // 50MB
    if (file.size > maxSize) {
      throw new ApiError(413, `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }

    // Validate file type using magic numbers (more secure than extension)
    const { fileTypeFromFile } = await import('file-type');
    const detectedType = await fileTypeFromFile(file.path);
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (detectedType && !allowedMimeTypes.includes(detectedType.mime)) {
      throw new ApiError(400, `File type ${detectedType.mime} not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // If no magic number detected, fall back to extension check
    if (!detectedType) {
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new ApiError(400, `File extension .${fileExtension} not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
      }
    }

    // Add file type info to request
    req.fileInfo = {
      detectedType: detectedType?.mime || `image/${file.originalname.split('.').pop()?.toLowerCase()}`,
      size: file.size,
      originalName: file.originalname
    };

    logger.info(`File validation passed: ${file.originalname} (${file.size} bytes)`);
    next();
  } catch (error) {
    // Clean up uploaded file on validation failure
    if (req.file?.path) {
      const fs = require('fs').promises;
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Failed to clean up invalid file:', unlinkError);
      }
    }
    next(error);
  }
};

/**
 * Validate document ID parameter
 */
const validateDocumentId = [
  param('id')
    .isUUID()
    .withMessage('Document ID must be a valid UUID'),
  handleValidationErrors
];

/**
 * Validate query parameters for listing documents
 */
const validateListQuery = [
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  body('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'failed'])
    .withMessage('Status must be one of: pending, processing, completed, failed'),
  handleValidationErrors
];

/**
 * Validate feedback submission
 */
const validateFeedback = [
  body('documentId')
    .isUUID()
    .withMessage('Document ID must be a valid UUID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Feedback must be a string with maximum 1000 characters'),
  body('category')
    .optional()
    .isIn(['accuracy', 'usability', 'performance', 'other'])
    .withMessage('Category must be one of: accuracy, usability, performance, other'),
  handleValidationErrors
];

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (req, res, next) => {
  // Basic sanitization - in production, consider using a library like DOMPurify
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

/**
 * Validate API key (for future API access)
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    throw new ApiError(401, 'API key required');
  }

  // In production, validate against stored API keys
  if (apiKey !== process.env.API_KEY) {
    throw new ApiError(401, 'Invalid API key');
  }

  next();
};

/**
 * Validate content type for specific endpoints
 */
const validateContentType = (expectedTypes) => {
  return (req, res, next) => {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !expectedTypes.some(type => contentType.includes(type))) {
      throw new ApiError(400, `Content-Type must be one of: ${expectedTypes.join(', ')}`);
    }
    
    next();
  };
};

module.exports = {
  validateFileUpload,
  validateDocumentId,
  validateListQuery,
  validateFeedback,
  sanitizeInput,
  validateApiKey,
  validateContentType,
  handleValidationErrors
};
