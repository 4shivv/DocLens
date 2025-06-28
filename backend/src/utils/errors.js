/**
 * Custom API Error class for structured error handling
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error class
 */
class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error class
 */
class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error class
 */
class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error class
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error class
 */
class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error class
 */
class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(429, message, { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Service Unavailable Error class
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable', service = null) {
    super(503, message, { service });
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Processing Error class for document processing failures
 */
class ProcessingError extends ApiError {
  constructor(message = 'Document processing failed', processingStage = null) {
    super(422, message, { processingStage });
    this.name = 'ProcessingError';
  }
}

/**
 * External Service Error class
 */
class ExternalServiceError extends ApiError {
  constructor(service, message = 'External service error', statusCode = 503) {
    super(statusCode, message, { service });
    this.name = 'ExternalServiceError';
  }
}

/**
 * File Error class
 */
class FileError extends ApiError {
  constructor(message = 'File operation failed', operation = null) {
    super(400, message, { operation });
    this.name = 'FileError';
  }
}

/**
 * Database Error class
 */
class DatabaseError extends ApiError {
  constructor(message = 'Database operation failed', operation = null) {
    super(500, message, { operation });
    this.name = 'DatabaseError';
  }
}

/**
 * Configuration Error class
 */
class ConfigurationError extends ApiError {
  constructor(message = 'Configuration error', configKey = null) {
    super(500, message, { configKey });
    this.name = 'ConfigurationError';
  }
}

/**
 * Create error from HTTP status code
 */
const createErrorFromStatus = (statusCode, message = null, details = null) => {
  const defaultMessages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable'
  };

  const errorMessage = message || defaultMessages[statusCode] || 'Unknown Error';

  switch (statusCode) {
    case 400:
      return new ValidationError(errorMessage, details);
    case 401:
      return new AuthenticationError(errorMessage);
    case 403:
      return new AuthorizationError(errorMessage);
    case 404:
      return new NotFoundError(errorMessage);
    case 409:
      return new ConflictError(errorMessage);
    case 422:
      return new ProcessingError(errorMessage, details?.processingStage);
    case 429:
      return new RateLimitError(errorMessage, details?.retryAfter);
    case 503:
      return new ServiceUnavailableError(errorMessage, details?.service);
    default:
      return new ApiError(statusCode, errorMessage, details);
  }
};

/**
 * Check if error is operational (safe to expose to client)
 */
const isOperationalError = (error) => {
  return error instanceof ApiError && error.isOperational;
};

/**
 * Format error for client response
 */
const formatErrorForClient = (error) => {
  if (isOperationalError(error)) {
    return {
      message: error.message,
      ...(error.details && { details: error.details }),
      type: error.name
    };
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    return {
      message: 'Internal Server Error',
      type: 'InternalError'
    };
  }

  return {
    message: error.message,
    type: error.name || 'UnknownError',
    ...(error.stack && { stack: error.stack })
  };
};

/**
 * Common error messages
 */
const ErrorMessages = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: 'Invalid username or password',
  ACCESS_DENIED: 'Access denied',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  
  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_UUID: 'Invalid UUID format',
  
  // File Operations
  FILE_NOT_FOUND: 'File not found',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_UPLOAD_FAILED: 'File upload failed',
  FILE_PROCESSING_FAILED: 'File processing failed',
  
  // Document Processing
  DOCUMENT_NOT_FOUND: 'Document not found',
  PROCESSING_IN_PROGRESS: 'Document is currently being processed',
  PROCESSING_FAILED: 'Document processing failed',
  ANALYSIS_FAILED: 'Document analysis failed',
  OCR_FAILED: 'Text extraction failed',
  
  // External Services
  GEMINI_API_ERROR: 'AI analysis service unavailable',
  FIREBASE_ERROR: 'Database service unavailable',
  STORAGE_ERROR: 'File storage service unavailable',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  UPLOAD_RATE_LIMIT: 'Too many file uploads, please try again later',
  
  // System
  INTERNAL_ERROR: 'An internal error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  MAINTENANCE_MODE: 'System is under maintenance'
};

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  ProcessingError,
  ExternalServiceError,
  FileError,
  DatabaseError,
  ConfigurationError,
  createErrorFromStatus,
  isOperationalError,
  formatErrorForClient,
  ErrorMessages
};
