import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getDocumentStatus,
  pollDocumentStatus,
  getDocumentAnalysis,
  DocumentStatus,
  DocumentAnalysis,
} from '@/services/documentService';

interface ProcessingState {
  status: DocumentStatus | null;
  isPolling: boolean;
  error: string | null;
}

export const useProcessingStatus = (documentId: string | null) => {
  const [state, setState] = useState<ProcessingState>({
    status: null,
    isPolling: false,
    error: null,
  });

  const stopPollingRef = useRef<(() => void) | null>(null);

  const startPolling = useCallback(async () => {
    if (!documentId) return;

    setState(prev => ({ ...prev, isPolling: true, error: null }));

    const poller = pollDocumentStatus(
      documentId,
      (status) => {
        setState(prev => ({ ...prev, status, isPolling: true }));
      },
      120,
      2000
    );

    stopPollingRef.current = () => {
      // The poller will stop on its own, but this prevents further state updates
    };

    try {
      const finalStatus = await poller;
      setState(prev => ({ ...prev, status: finalStatus, isPolling: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Polling failed',
        isPolling: false,
      }));
    }
  }, [documentId]);

  const stopPolling = useCallback(() => {
    if (stopPollingRef.current) {
      stopPollingRef.current();
    }
    setState(prev => ({ ...prev, isPolling: false }));
  }, []);

  const checkStatus = useCallback(async () => {
    if (!documentId) return;

    try {
      const status = await getDocumentStatus(documentId);
      setState(prev => ({ ...prev, status, error: null }));
      return status;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to check status',
      }));
      return null;
    }
  }, [documentId]);

  // Auto-start polling when documentId changes
  useEffect(() => {
    if (documentId) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [documentId, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    ...state,
    startPolling,
    stopPolling,
    checkStatus,
    isCompleted: state.status?.status === 'completed',
    isError: state.status?.status === 'error',
    isProcessing: state.status?.status === 'processing',
  };
};

// Hook for managing document state throughout the flow
export const useDocumentFlow = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const [documentId, setDocumentId] = useState<string | null>(null);

  const startProcessing = useCallback((docId: string) => {
    setDocumentId(docId);
    setCurrentStep('processing');
  }, []);

  const showResults = useCallback(() => {
    setCurrentStep('results');
  }, []);

  const reset = useCallback(() => {
    setCurrentStep('upload');
    setDocumentId(null);
  }, []);

  return {
    currentStep,
    documentId,
    startProcessing,
    showResults,
    reset,
  };
};

// Hook for real-time progress updates
export const useProgressTracker = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [message, setMessage] = useState('');

  const updateProgress = useCallback((newProgress: number, newStage?: string, newMessage?: string) => {
    setProgress(newProgress);
    if (newStage !== undefined) setStage(newStage);
    if (newMessage !== undefined) setMessage(newMessage);
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setStage('');
    setMessage('');
  }, []);

  return {
    progress,
    stage,
    message,
    updateProgress,
    reset,
  };
};

// Hook for managing document analysis results
export const useDocumentAnalysis = (
  documentId: string | null,
  isCompleted: boolean
) => {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!documentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const analysisResult = await getDocumentAnalysis(documentId);
      setAnalysis(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId && isCompleted) {
      fetchAnalysis();
    }
  }, [documentId, isCompleted, fetchAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    refetch: fetchAnalysis,
  };
};
