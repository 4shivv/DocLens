// Document related types
export interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
  analysis?: DocumentAnalysis;
}

export type DocumentStatus = 
  | 'uploaded' 
  | 'processing' 
  | 'completed' 
  | 'error';

export interface DocumentUploadResponse {
  documentId: string;
  status: DocumentStatus;
  message: string;
  uploadedAt: string;
}

export interface ProcessingStatus {
  documentId: string;
  status: DocumentStatus;
  progress: number;
  stage: ProcessingStage;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export type ProcessingStage = 
  | 'uploaded'
  | 'validating'
  | 'extracting'
  | 'analyzing'
  | 'processing'
  | 'generating'
  | 'completed'
  | 'error';

// Analysis related types
export interface DocumentAnalysis {
  documentId: string;
  status: string;
  results: AnalysisResults;
  processedAt: string;
}

export interface AnalysisResults {
  summary: AnalysisSummary;
  issues: Issue[];
  fields: ExtractedField[];
  recommendations: string[];
}

export interface AnalysisSummary {
  formType: string;
  confidence: number;
  completeness: number;
  riskLevel: RiskLevel;
  totalFields: number;
  extractedFields: number;
  qualityScore: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Issue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  field: string;
  message: string;
  suggestion?: string;
  coordinates?: IssueCoordinates;
  context?: string;
}

export type IssueType = 
  | 'missing' 
  | 'inconsistent' 
  | 'invalid' 
  | 'warning'
  | 'format'
  | 'calculation';

export type IssueSeverity = 
  | 'critical' 
  | 'warning' 
  | 'info';

export interface IssueCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
}

export interface ExtractedField {
  name: string;
  value: string | number | boolean;
  confidence: number;
  extracted: boolean;
  coordinates?: IssueCoordinates;
  type: FieldType;
}

export type FieldType = 
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'ssn'
  | 'ein'
  | 'checkbox'
  | 'signature';

// UI State types
export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: DocumentUploadResponse | null;
}

export interface ProcessingState {
  status: ProcessingStatus | null;
  isPolling: boolean;
  error: string | null;
}

export interface AnalysisState {
  analysis: DocumentAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface TaxForm {
  type: string;
  name: string;
  description: string;
  supportedFormats: string[];
  requiredFields: string[];
  optionalFields: string[];
}

export interface TaxFormType {
  W2: 'W-2 Wage and Tax Statement';
  '1099': '1099 Forms (All Types)';
  '1040': '1040 Individual Income Tax Return';
  SCHEDULE_A: 'Schedule A (Itemized Deductions)';
  SCHEDULE_C: 'Schedule C (Business Income)';
  SCHEDULE_D: 'Schedule D (Capital Gains)';
  OTHER: 'Other Tax Form';
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// File validation types
export interface FileValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface SupportedFormat {
  extension: string;
  mimeType: string;
  description: string;
  maxSize: number;
}

// User preferences (for future use)
export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    browser: boolean;
  };
  privacy: {
    dataRetention: number; // days
    analytics: boolean;
  };
}

// Analytics and reporting types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface UsageStats {
  totalDocuments: number;
  totalIssuesDetected: number;
  averageProcessingTime: number;
  successRate: number;
  popularFormTypes: { type: string; count: number }[];
}

// Utility types
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object 
  ? (Without<T, U> & U) | (Without<U, T> & T) 
  : T | U;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type Required<T, K extends keyof T> = T & Pick<Required<T>, K>;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface DocumentViewerProps extends BaseComponentProps {
  documentId: string;
  documentUrl?: string;
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  onZoomChange?: (zoom: number) => void;
  onRotate?: () => void;
}

export interface IssuesListProps extends BaseComponentProps {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  onViewInDocument?: (issue: Issue) => void;
  filter?: {
    severity?: IssueSeverity[];
    type?: IssueType[];
  };
}

export interface ResultsSummaryProps extends BaseComponentProps {
  summary: AnalysisSummary;
  documentId: string;
  processedAt: string;
  onDownloadReport?: () => void;
}

export interface ProcessingStatusProps extends BaseComponentProps {
  documentId: string;
  onComplete: () => void;
  onError: (error: string) => void;
  showSteps?: boolean;
}

export interface DocumentUploadProps extends BaseComponentProps {
  onUploadComplete: (documentId: string) => void;
  acceptedFormats?: string[];
  maxFileSize?: number;
  multiple?: boolean;
}

// Hook return types
export interface UseDocumentUploadReturn {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: DocumentUploadResponse | null;
  upload: (file: File) => Promise<DocumentUploadResponse | null>;
  reset: () => void;
}

export interface UseProcessingStatusReturn {
  status: ProcessingStatus | null;
  isPolling: boolean;
  error: string | null;
  startPolling: () => void;
  stopPolling: () => void;
  checkStatus: () => Promise<ProcessingStatus | null>;
  isCompleted: boolean;
  isError: boolean;
  isProcessing: boolean;
}

export interface UseDocumentAnalysisReturn {
  analysis: DocumentAnalysis | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Constants and enums
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/tiff',
  'image/bmp'
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const PROCESSING_STAGES: Record<ProcessingStage, string> = {
  uploaded: 'File uploaded successfully',
  validating: 'Validating file format and content',
  extracting: 'Extracting text and data from document',
  analyzing: 'Analyzing document structure and content',
  processing: 'Processing with AI for issue detection',
  generating: 'Generating analysis report',
  completed: 'Analysis completed successfully',
  error: 'Processing failed'
};

export const ISSUE_SEVERITY_COLORS: Record<IssueSeverity, string> = {
  critical: 'text-error-600 bg-error-50 border-error-200',
  warning: 'text-warning-600 bg-warning-50 border-warning-200',
  info: 'text-tax-600 bg-tax-50 border-tax-200'
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'text-success-600 bg-success-50',
  medium: 'text-warning-600 bg-warning-50',
  high: 'text-error-600 bg-error-50'
};
