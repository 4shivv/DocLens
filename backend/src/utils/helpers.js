const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generate a random UUID v4
 */
const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Generate a secure random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a password using bcrypt-like algorithm
 */
const hashPassword = async (password, saltRounds = 12) => {
  const bcrypt = require('bcrypt');
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verify a password against a hash
 */
const verifyPassword = async (password, hash) => {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hash);
};

/**
 * Sanitize filename for safe storage
 */
const sanitizeFilename = (filename) => {
  // Remove or replace unsafe characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

/**
 * Get file extension from filename
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase().slice(1);
};

/**
 * Get MIME type from file extension
 */
const getMimeType = (filename) => {
  const mime = require('mime-types');
  return mime.lookup(filename) || 'application/octet-stream';
};

/**
 * Format file size in human-readable format
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration in human-readable format
 */
const formatDuration = (milliseconds) => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate UUID format
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Deep clone an object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined and null values from object
 */
const cleanObject = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanObject(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

/**
 * Create a timeout promise
 */
const timeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), ms);
  });
};

/**
 * Wrap a promise with timeout
 */
const withTimeout = (promise, ms) => {
  return Promise.race([promise, timeout(ms)]);
};

/**
 * Check if a file exists
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Ensure directory exists, create if not
 */
const ensureDirectory = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
};

/**
 * Get file stats safely
 */
const getFileStats = async (filePath) => {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    return null;
  }
};

/**
 * Calculate file hash
 */
const calculateFileHash = async (filePath, algorithm = 'sha256') => {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash(algorithm);
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

/**
 * Validate environment variables
 */
const validateEnvVars = (requiredVars) => {
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Parse boolean environment variable
 */
const parseBooleanEnv = (envVar, defaultValue = false) => {
  const value = process.env[envVar];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Parse integer environment variable
 */
const parseIntEnv = (envVar, defaultValue = 0) => {
  const value = process.env[envVar];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Mask sensitive data for logging
 */
const maskSensitiveData = (data, sensitiveFields = ['password', 'token', 'key', 'secret']) => {
  const masked = { ...data };
  
  for (const field of sensitiveFields) {
    if (masked[field]) {
      const value = masked[field].toString();
      masked[field] = value.length > 4 
        ? value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2)
        : '*'.repeat(value.length);
    }
  }
  
  return masked;
};

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         'unknown';
};

/**
 * Paginate array
 */
const paginateArray = (array, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const paginatedItems = array.slice(offset, offset + limit);
  
  return {
    data: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit,
      hasNextPage: offset + limit < array.length,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Create API response wrapper
 */
const createApiResponse = (data = null, message = 'Success', success = true, meta = {}) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...meta
  };
};

module.exports = {
  generateUUID,
  generateRandomString,
  hashPassword,
  verifyPassword,
  sanitizeFilename,
  getFileExtension,
  getMimeType,
  formatFileSize,
  formatDuration,
  isValidEmail,
  isValidUUID,
  deepClone,
  cleanObject,
  sleep,
  retryWithBackoff,
  timeout,
  withTimeout,
  fileExists,
  ensureDirectory,
  getFileStats,
  calculateFileHash,
  validateEnvVars,
  parseBooleanEnv,
  parseIntEnv,
  maskSensitiveData,
  getClientIP,
  paginateArray,
  createApiResponse
};
