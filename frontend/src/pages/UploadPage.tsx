import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import DocumentUpload from "@/components/upload/DocumentUpload";
import ProcessingStatus from "@/components/processing/ProcessingStatus";
import { useDocumentFlow } from "@/hooks/useProcessingStatus";

export default function UploadPage() {
  const navigate = useNavigate();
  const { currentStep, documentId, startProcessing, showResults, reset } = useDocumentFlow();

  const handleUploadComplete = (docId: string) => {
    startProcessing(docId);
  };

  const handleProcessingComplete = () => {
    showResults();
    navigate(`/analysis?documentId=${documentId}`);
  };

  const handleProcessingError = (error: string) => {
    console.error("Processing failed:", error);
    // Could show error state or redirect back to upload
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {currentStep === 'upload' ? 'Upload Your Tax Document' :
             currentStep === 'processing' ? 'Analyzing Your Document' :
             'Analysis Complete'}
          </h1>
          <p className="text-lg text-gray-600">
            {currentStep === 'upload' ? 
              'Upload your tax form to get started with AI-powered analysis' :
             currentStep === 'processing' ?
              'Please wait while we analyze your document with advanced AI' :
              'Your document has been successfully analyzed'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 'upload', label: 'Upload', number: 1 },
              { step: 'processing', label: 'Processing', number: 2 },
              { step: 'results', label: 'Results', number: 3 }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep === item.step ? 
                    'bg-primary border-primary text-white' :
                  (currentStep === 'processing' && item.step === 'upload') ||
                  (currentStep === 'results' && (item.step === 'upload' || item.step === 'processing')) ?
                    'bg-success-500 border-success-500 text-white' :
                    'border-gray-300 text-gray-400'
                }`}>
                  {(currentStep === 'processing' && item.step === 'upload') ||
                   (currentStep === 'results' && (item.step === 'upload' || item.step === 'processing')) ? 
                    '✓' : item.number}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  currentStep === item.step ? 'text-primary' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                {index < 2 && (
                  <div className={`ml-8 w-16 h-0.5 ${
                    (currentStep === 'processing' && item.step === 'upload') ||
                    (currentStep === 'results' && item.step !== 'results') ?
                      'bg-success-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content based on current step */}
        {currentStep === 'upload' && (
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        )}

        {currentStep === 'processing' && documentId && (
          <ProcessingStatus
            documentId={documentId}
            onComplete={handleProcessingComplete}
            onError={handleProcessingError}
          />
        )}

        {/* Tips Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-primary/5 rounded-lg">
            <div className="text-2xl mb-3">📋</div>
            <h3 className="font-semibold mb-2">Best Quality</h3>
            <p className="text-sm text-gray-600">
              Use clear, high-resolution scans or photos for best analysis results
            </p>
          </div>
          
          <div className="text-center p-6 bg-primary/5 rounded-lg">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="font-semibold mb-2">Secure Processing</h3>
            <p className="text-sm text-gray-600">
              Your documents are processed securely and automatically deleted after analysis
            </p>
          </div>
          
          <div className="text-center p-6 bg-primary/5 rounded-lg">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Fast Analysis</h3>
            <p className="text-sm text-gray-600">
              Get comprehensive results in under 2 minutes with our advanced AI
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
