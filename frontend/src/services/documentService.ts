import api from './api';

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: {
    documentId: string;
    status: 'uploaded' | 'processing' | 'completed' | 'error';
    estimatedProcessingTime?: string;
    fileName?: string;
    fileSize?: number;
  };
}

export interface DocumentStatus {
  documentId: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
  stage: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentAnalysis {
  documentId: string;
  status: string;
  results: {
    summary: {
      formType: string;
      confidence: number;
      completeness: number;
      riskLevel: 'low' | 'medium' | 'high';
    };
    issues: Array<{
      id: string;
      type: 'missing' | 'inconsistent' | 'invalid' | 'warning';
      severity: 'critical' | 'warning' | 'info';
      field: string;
      message: string;
      suggestion?: string;
      coordinates?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
    fields: Array<{
      name: string;
      value: string | number;
      confidence: number;
      extracted: boolean;
    }>;
    recommendations: string[];
  };
  processedAt: string;
}

export interface DocumentInfo {
  documentId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  status: string;
  uploadedAt: string;
  analysis?: DocumentAnalysis['results'];
}

// Upload document
export const uploadDocument = async (file: File): Promise<DocumentUploadResponse> => {
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // Progress tracking could be added here
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      console.log(`Upload Progress: ${percentCompleted}%`);
    },
  });
  
  return response.data;
};

// Get document status
export const getDocumentStatus = async (documentId: string): Promise<DocumentStatus> => {
  const response = await api.get(`/documents/${documentId}/status`);
  
  // The backend returns { success: true, data: {...} }
  const statusData = response.data.data;
  
  // Ensure the data has the expected structure
  return {
    documentId: statusData.documentId,
    status: statusData.status,
    progress: statusData.progress || 0,
    stage: statusData.stage || statusData.status,
    message: statusData.message || '',
    createdAt: statusData.createdAt || new Date().toISOString(),
    updatedAt: statusData.updatedAt || new Date().toISOString()
  };
};

// Get document details
export const getDocument = async (documentId: string): Promise<DocumentInfo> => {
  const response = await api.get(`/documents/${documentId}`);
  return response.data.data;
};

// Get document analysis results
export const getDocumentAnalysis = async (documentId: string): Promise<DocumentAnalysis> => {
  const response = await api.get(`/documents/${documentId}/results`);
  return response.data.data;
};

// Download formatted report
export const downloadReport = async (documentId: string): Promise<Blob> => {
  const response = await api.get(`/documents/${documentId}/report`, {
    responseType: 'blob',
  });
  return response.data;
};

// Delete document
export const deleteDocument = async (documentId: string): Promise<void> => {
  await api.delete(`/documents/${documentId}`);
};

// Poll document status until completion
export const pollDocumentStatus = (
  documentId: string,
  onUpdate: (status: DocumentStatus) => void,
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<DocumentStatus> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        return reject(new Error("Polling timeout reached."));
      }
      attempts++;

      try {
        const status = await getDocumentStatus(documentId);
        onUpdate(status);

        if (status.status === 'completed' || status.status === 'error') {
          return resolve(status);
        }

        setTimeout(poll, interval);
      } catch (error) {
        return reject(error);
      }
    };

    poll();
  });
};

// Validate file before upload
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/tiff',
    'image/bmp'
  ];
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a PDF or image file (JPEG, PNG, WEBP, TIFF, BMP).'
    };
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Please upload a file smaller than 10MB.'
    };
  }
  
  return { isValid: true };
};

// Get file type icon
export const getFileTypeIcon = (fileType: string): string => {
  if (fileType === 'application/pdf') return '📄';
  if (fileType.startsWith('image/')) return '🖼️';
  return '📋';
};

// Format processing stage for display
export const formatProcessingStage = (stage: string): string => {
  const stageMap: Record<string, string> = {
    'uploaded': 'File uploaded',
    'validating': 'Validating file',
    'extracting': 'Extracting text',
    'analyzing': 'Analyzing content',
    'processing': 'Processing with AI',
    'generating': 'Generating report',
    'completed': 'Analysis complete',
    'error': 'Processing failed'
  };
  
  return stageMap[stage] || stage;
};

export default {
  uploadDocument,
  getDocumentStatus,
  getDocument,
  getDocumentAnalysis,
  downloadReport,
  deleteDocument,
  pollDocumentStatus,
  validateFile,
  getFileTypeIcon,
  formatProcessingStage,
};
