/**
 * Document model interface and validation schemas
 */

/**
 * Document processing status enum
 */
const ProcessingStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Document types enum
 */
const DocumentType = {
  PDF: 'application/pdf',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  JPG: 'image/jpg'
};

/**
 * Tax form types enum
 */
const TaxFormType = {
  W2: 'W2',
  W4: 'W4',
  '1099_MISC': '1099-MISC',
  '1099_INT': '1099-INT',
  '1099_DIV': '1099-DIV',
  '1040': '1040',
  SCHEDULE_C: 'Schedule C',
  SCHEDULE_D: 'Schedule D',
  UNKNOWN: 'unknown'
};

/**
 * Issue severity levels
 */
const IssueSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * Issue types
 */
const IssueType = {
  MISSING_FIELD: 'missing_field',
  INCONSISTENT_DATA: 'inconsistent_data',
  FORMATTING_ERROR: 'formatting_error',
  CALCULATION_ERROR: 'calculation_error',
  PROCESSING_ERROR: 'processing_error',
  INVALID_VALUE: 'invalid_value',
  DUPLICATE_ENTRY: 'duplicate_entry'
};

/**
 * Risk levels
 */
const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * Processing methods
 */
const ProcessingMethod = {
  GEMINI_AI: 'gemini_ai',
  TESSERACT_OCR: 'tesseract_ocr',
  HYBRID: 'hybrid',
  MANUAL: 'manual'
};

/**
 * Document schema
 */
const DocumentSchema = {
  id: 'string', // UUID
  fileName: 'string',
  originalName: 'string',
  fileSize: 'number', // bytes
  fileType: 'string', // MIME type
  uploadedAt: 'Date',
  updatedAt: 'Date',
  processingStatus: 'string', // ProcessingStatus enum
  processingProgress: 'number', // 0-100
  processingError: 'string?', // error message if failed
  processedAt: 'Date?',
  
  // File storage
  tempFilePath: 'string?',
  storageUrl: 'string?',
  gsUrl: 'string?', // Google Storage URL
  
  // Processing results
  ocrResults: 'OCRResults?',
  aiAnalysis: 'AIAnalysis?',
  
  // Metadata
  processingMethod: 'string?', // ProcessingMethod enum
  processingDuration: 'number?', // milliseconds
  geminiTokensUsed: 'number?',
  confidenceScore: 'number?', // 0-1
  
  // User context (if authentication is added)
  userId: 'string?',
  sessionId: 'string?'
};

/**
 * OCR Results schema
 */
const OCRResultsSchema = {
  text: 'string',
  confidence: 'number', // 0-1
  method: 'string', // 'pdf_text_extraction' | 'tesseract_ocr'
  coordinates: 'Array<CoordinateData>',
  processingDetails: {
    symbols: 'number?',
    words: 'number?',
    lines: 'number?',
    paragraphs: 'number?'
  },
  extractedPatterns: 'Object?'
};

/**
 * Coordinate data schema
 */
const CoordinateDataSchema = {
  type: 'string', // 'word' | 'line' | 'paragraph'
  text: 'string',
  confidence: 'number',
  bbox: {
    x: 'number',
    y: 'number',
    width: 'number',
    height: 'number'
  }
};

/**
 * AI Analysis schema
 */
const AIAnalysisSchema = {
  formType: 'string', // TaxFormType enum
  confidence: 'number', // 0-1
  extractedFields: 'Object', // Key-value pairs of detected fields
  detectedIssues: 'Array<DetectedIssue>',
  simplifiedSummary: 'string',
  completenessScore: 'number', // 0-1
  riskLevel: 'string', // RiskLevel enum
  processingMethod: 'string', // ProcessingMethod enum
  processedAt: 'string', // ISO timestamp
  documentMetadata: 'DocumentMetadata?'
};

/**
 * Detected Issue schema
 */
const DetectedIssueSchema = {
  type: 'string', // IssueType enum
  severity: 'string', // IssueSeverity enum
  field: 'string',
  description: 'string',
  suggestion: 'string',
  coordinates: 'BoundingBox?',
  confidence: 'number?', // 0-1
  category: 'string?'
};

/**
 * Bounding Box schema
 */
const BoundingBoxSchema = {
  x: 'number',
  y: 'number',
  width: 'number',
  height: 'number'
};

/**
 * Document Metadata schema
 */
const DocumentMetadataSchema = {
  fileName: 'string',
  fileSize: 'number',
  fileType: 'string',
  uploadedAt: 'Date',
  dimensions: 'ImageDimensions?',
  pageCount: 'number?'
};

/**
 * Image Dimensions schema
 */
const ImageDimensionsSchema = {
  width: 'number',
  height: 'number',
  aspectRatio: 'number'
};

/**
 * Processing Job schema (for queue management)
 */
const ProcessingJobSchema = {
  id: 'string', // UUID
  documentId: 'string', // UUID
  status: 'string', // 'queued' | 'processing' | 'completed' | 'failed'
  priority: 'number', // 1-10, higher = more priority
  createdAt: 'Date',
  startedAt: 'Date?',
  completedAt: 'Date?',
  error: 'string?',
  retryCount: 'number',
  maxRetries: 'number',
  processingStage: 'string?',
  estimatedDuration: 'number?', // milliseconds
  actualDuration: 'number?' // milliseconds
};

/**
 * Analysis Report schema
 */
const AnalysisReportSchema = {
  documentId: 'string',
  fileName: 'string',
  generatedAt: 'Date',
  reportType: 'string', // 'summary' | 'detailed' | 'issues_only'
  
  summary: {
    formType: 'string',
    completenessScore: 'number',
    riskLevel: 'string',
    totalIssues: 'number',
    criticalIssues: 'number',
    processingConfidence: 'number'
  },
  
  details: {
    extractedFields: 'Object',
    detectedIssues: 'Array<DetectedIssue>',
    recommendations: 'Array<string>',
    nextSteps: 'Array<string>'
  },
  
  metadata: {
    processingMethod: 'string',
    processingDuration: 'number',
    tokensUsed: 'number?',
    apiVersion: 'string'
  }
};

/**
 * User Feedback schema (for future implementation)
 */
const UserFeedbackSchema = {
  id: 'string',
  documentId: 'string',
  rating: 'number', // 1-5
  feedback: 'string?',
  category: 'string', // 'accuracy' | 'usability' | 'performance' | 'other'
  isAccurate: 'boolean?',
  suggestions: 'string?',
  submittedAt: 'Date',
  userAgent: 'string?',
  ipAddress: 'string?'
};

/**
 * Validation functions
 */
const isValidProcessingStatus = (status) => {
  return Object.values(ProcessingStatus).includes(status);
};

const isValidTaxFormType = (formType) => {
  return Object.values(TaxFormType).includes(formType);
};

const isValidIssueSeverity = (severity) => {
  return Object.values(IssueSeverity).includes(severity);
};

const isValidIssueType = (type) => {
  return Object.values(IssueType).includes(type);
};

const isValidRiskLevel = (riskLevel) => {
  return Object.values(RiskLevel).includes(riskLevel);
};

/**
 * Default values
 */
const DefaultValues = {
  PROCESSING_PROGRESS: 0,
  CONFIDENCE_SCORE: 0.5,
  COMPLETENESS_SCORE: 0.5,
  RISK_LEVEL: RiskLevel.MEDIUM,
  PROCESSING_STATUS: ProcessingStatus.PENDING,
  FORM_TYPE: TaxFormType.UNKNOWN,
  MAX_RETRIES: 3,
  PRIORITY: 5
};

/**
 * Constraints
 */
const Constraints = {
  MAX_FILE_SIZE: 52428800, // 50MB
  MAX_FILENAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_SUGGESTION_LENGTH: 500,
  MIN_CONFIDENCE_SCORE: 0,
  MAX_CONFIDENCE_SCORE: 1,
  MAX_PROCESSING_RETRIES: 3,
  PROCESSING_TIMEOUT: 300000 // 5 minutes
};

module.exports = {
  // Enums
  ProcessingStatus,
  DocumentType,
  TaxFormType,
  IssueSeverity,
  IssueType,
  RiskLevel,
  ProcessingMethod,
  
  // Schemas
  DocumentSchema,
  OCRResultsSchema,
  CoordinateDataSchema,
  AIAnalysisSchema,
  DetectedIssueSchema,
  BoundingBoxSchema,
  DocumentMetadataSchema,
  ImageDimensionsSchema,
  ProcessingJobSchema,
  AnalysisReportSchema,
  UserFeedbackSchema,
  
  // Validation functions
  isValidProcessingStatus,
  isValidTaxFormType,
  isValidIssueSeverity,
  isValidIssueType,
  isValidRiskLevel,
  
  // Constants
  DefaultValues,
  Constraints
};
