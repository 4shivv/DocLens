import { useState, useCallback } from 'react';
import { uploadDocument, validateFile, DocumentUploadResponse } from '@/services/documentService';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: DocumentUploadResponse | null;
}

export const useDocumentUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const upload = useCallback(async (file: File): Promise<DocumentUploadResponse['data'] | null> => {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadState(prev => ({
        ...prev,
        error: validation.error || 'Invalid file',
      }));
      return null;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null,
    });

    try {
      // Simulate progress for UX (real progress would come from axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      const result = await uploadDocument(file);
      
      clearInterval(progressInterval);
      
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        result,
      });
      
      return result.data;
    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        result: null,
      });
      
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...uploadState,
    upload,
    reset,
  };
};

// Hook for drag and drop functionality
export const useDragAndDrop = (onDrop: (files: File[]) => void) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set to false if we're leaving the container entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onDrop(files);
    }
  }, [onDrop]);

  return {
    isDragOver,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
};
