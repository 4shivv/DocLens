import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getDocumentStatus, 
  pollDocumentStatus, 
  DocumentStatus 
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

  const pollRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startPolling = useCallback(async () => {
    if (!documentId || pollRef.current) return;

    pollRef.current = true;
    setState(prev => ({ ...prev, isPolling: true, error: null }));

    try {
      await pollDocumentStatus(
        documentId,
        (status) => {
          setState(prev => ({ ...prev, status, error: null }));
        },
        60, // 5 minutes
        3000 // 3 seconds
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Polling failed',
        isPolling: false,
      }));
    } finally {
      pollRef.current = false;
      setState(prev => ({ ...prev, isPolling: false }));
    }
  }, [documentId]);

  const stopPolling = useCallback(() => {
    pollRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
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
export const useDocumentAnalysis = (documentId: string | null) => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!documentId) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would call the actual analysis endpoint
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analysis data
      const mockAnalysis = {
        documentId,
        summary: {
          formType: 'W-2',
          confidence: 95,
          completeness: 87,
          riskLevel: 'low' as const,
        },
        issues: [
          {
            id: '1',
            type: 'missing' as const,
            severity: 'warning' as const,
            field: 'Box 12',
            message: 'Box 12 (codes) appears to be blank',
            suggestion: 'Verify if employer contributions should be reported',
          }
        ],
        fields: [
          { name: 'Employee Name', value: 'John Doe', confidence: 98, extracted: true },
          { name: 'Wages', value: 75000, confidence: 99, extracted: true },
        ],
        recommendations: [
          'Review Box 12 for any missing employer contribution codes',
          'Verify all wage amounts match your records',
        ],
      };
      
      setAnalysis(mockAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchAnalysis();
    }
  }, [documentId, fetchAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    refetch: fetchAnalysis,
  };
};
