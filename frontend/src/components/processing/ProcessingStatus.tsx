import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Brain,
  Search,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useProcessingStatus } from "@/hooks/useProcessingStatus";
import { formatDate } from "@/lib/utils";

interface ProcessingStatusProps {
  documentId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

const getStageIcon = (stage: string, isActive: boolean) => {
  const iconClass = `h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`;
  
  switch (stage) {
    case "uploaded":
      return <FileText className={iconClass} />;
    case "extracting":
      return <Search className={iconClass} />;
    case "analyzing":
      return <Brain className={iconClass} />;
    case "completed":
      return <CheckCircle className={iconClass} />;
    default:
      return <Clock className={iconClass} />;
  }
};

const getStageLabel = (stage: string) => {
  const stageLabels: Record<string, string> = {
    uploaded: "Document Uploaded",
    validating: "Validating File",
    extracting: "Extracting Text",
    analyzing: "AI Analysis",
    generating: "Generating Report",
    completed: "Processing Complete",
    error: "Processing Failed"
  };
  
  return stageLabels[stage] || stage;
};

export default function ProcessingStatus({ 
  documentId, 
  onComplete, 
  onError 
}: ProcessingStatusProps) {
  const navigate = useNavigate();
  const { status, isPolling, error, isCompleted, isError } = useProcessingStatus(documentId);

  useEffect(() => {
    if (isCompleted) {
      onComplete();
      navigate(`/analysis?documentId=${documentId}`);
    } else if (isError && error) {
      onError(error);
    }
  }, [isCompleted, isError, error, onComplete, onError, navigate, documentId]);

  const stages = [
    { key: "uploaded", label: "Upload Complete" },
    { key: "extracting", label: "Extracting Text" },
    { key: "analyzing", label: "AI Analysis" },
    { key: "completed", label: "Processing Complete" }
  ];

  const currentStageIndex = status?.stage ? 
    stages.findIndex(s => s.key === status.stage) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Main Status Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {isPolling ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : isError ? (
              <AlertCircle className="h-8 w-8 text-error-500" />
            ) : isCompleted ? (
              <CheckCircle className="h-8 w-8 text-success-500" />
            ) : (
              <Brain className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <CardTitle className="text-xl">
            {isError ? "Processing Failed" :
             isCompleted ? "Analysis Complete!" :
             "Processing Your Document"}
          </CardTitle>
          
          {status?.message && (
            <p className="text-sm text-muted-foreground mt-2">
              {status.message}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          {status && !isError && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{getStageLabel(status.stage)}</span>
                <span>{status.progress || 0}%</span>
              </div>
              <Progress value={status.progress || 0} />
            </div>
          )}

          {/* Stage Timeline */}
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex || 
                (status?.status === 'completed' && index === stages.length - 1);
              const isCurrent = index === currentStageIndex && isPolling;

              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted ? "bg-success-100 text-success-600" :
                    isCurrent ? "bg-primary/10 text-primary" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      getStageIcon(stage.key, isActive)
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      isCompleted ? "text-success-600" :
                      isCurrent ? "text-primary" :
                      "text-muted-foreground"
                    }`}>
                      {stage.label}
                    </p>
                    
                    {isCurrent && status?.message && (
                      <p className="text-xs text-muted-foreground">
                        {status.message}
                      </p>
                    )}
                  </div>
                  
                  {isCurrent && (
                    <div className="text-xs text-muted-foreground">
                      {status?.progress || 0}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-error-50 p-4">
              <div className="flex items-center gap-2 text-error-600 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Processing Error</span>
              </div>
              <p className="text-sm text-error-600 mb-3">{error}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Document Info */}
          {status && (
            <div className="border-t pt-4 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Document ID: {documentId}</span>
                <span>Started: {formatDate(status.createdAt)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's Happening?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Text Extraction:</strong> Reading and digitizing your document</p>
            <p>• <strong>AI Analysis:</strong> Understanding tax form structure and content</p>
            <p>• <strong>Issue Detection:</strong> Identifying potential problems or missing information</p>
            <p>• <strong>Report Generation:</strong> Creating your personalized analysis report</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
