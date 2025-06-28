/**
 * Shared types and constants between frontend and backend
 */

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    type: string;
    details?: any;
    requestId?: string;
  };
  timestamp?: string;
}

// Document Types
export interface DocumentUploadResponse {
  documentId: string;
  fileName: string;
  fileSize: number;
  status: 'processing' | 'pending';
  estimatedProcessingTime: string;
}

export interface ProcessingStatus {
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  error?: string;
  updatedAt: string;
  processedAt?: string;
}

export interface AnalysisResults {
  documentId: string;
  fileName: string;
  processedAt: string;
  formType: string;
  extractedFields: Record<string, any>;
  detectedIssues: DetectedIssue[];
  simplifiedSummary: string;
  completenessScore: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high';
  ocrResults?: OCRResults;
  aiAnalysis?: AIAnalysis;
}

export interface DetectedIssue {
  type: 'missing_field' | 'inconsistent_data' | 'formatting_error' | 'calculation_error' | 'processing_error';
  severity: 'low' | 'medium' | 'high';
  field: string;
  description: string;
  suggestion: string;
  coordinates?: BoundingBox;
  confidence?: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRResults {
  text: string;
  confidence: number;
  method: string;
  coordinates: CoordinateData[];
  processingDetails?: {
    symbols?: number;
    words?: number;
    lines?: number;
    paragraphs?: number;
  };
}

export interface CoordinateData {
  type: 'word' | 'line' | 'paragraph';
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface AIAnalysis {
  formType: string;
  confidence: number;
  extractedFields: Record<string, any>;
  detectedIssues: DetectedIssue[];
  simplifiedSummary: string;
  completenessScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// File Upload Types
export interface SupportedFormats {
  images: FileFormat[];
  documents: FileFormat[];
  supportedTaxForms: string[];
}

export interface FileFormat {
  extension: string;
  mimeType: string;
  maxSize: string;
}

// Constants
export const PROCESSING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const ISSUE_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const TAX_FORM_TYPES = {
  W2: 'W2',
  W4: 'W4',
  '1099_MISC': '1099-MISC',
  '1099_INT': '1099-INT',
  '1040': '1040',
  SCHEDULE_C: 'Schedule C',
  UNKNOWN: 'unknown'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  UPLOAD: '/api/documents/upload',
  DOCUMENT: '/api/documents',
  STATUS: '/api/documents/:id/status',
  RESULTS: '/api/documents/:id/results',
  REPORT: '/api/documents/:id/report',
  HEALTH: '/api/health',
  SUPPORTED_FORMATS: '/api/documents/supported-formats'
} as const;

// Error Types
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'ValidationError',
  PROCESSING_ERROR: 'ProcessingError',
  NOT_FOUND: 'NotFoundError',
  RATE_LIMIT: 'RateLimitError',
  SERVICE_UNAVAILABLE: 'ServiceUnavailableError',
  FILE_ERROR: 'FileError'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export type ProcessingStatusType = typeof PROCESSING_STATUS[keyof typeof PROCESSING_STATUS];
export type RiskLevelType = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];
export type IssueSeverityType = typeof ISSUE_SEVERITY[keyof typeof ISSUE_SEVERITY];
export type TaxFormType = typeof TAX_FORM_TYPES[keyof typeof TAX_FORM_TYPES];
export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];
