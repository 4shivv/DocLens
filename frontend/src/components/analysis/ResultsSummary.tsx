import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  FileText,
  DollarSign,
  Calendar,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AnalysisSummary {
  formType: string;
  confidence: number;
  completeness: number;
  riskLevel: 'low' | 'medium' | 'high';
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  extractedFields: number;
  totalFields: number;
}

interface ResultsSummaryProps {
  summary: AnalysisSummary;
  documentId: string;
  processedAt: string;
}

export default function ResultsSummary({ 
  summary, 
  documentId, 
  processedAt 
}: ResultsSummaryProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'secondary';
    }
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success-600';
    if (percentage >= 70) return 'text-warning-600';
    return 'text-error-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
        <p className="text-muted-foreground">
          Processed on {formatDate(processedAt)}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Form Type */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Document Type</p>
                <p className="text-lg font-semibold">{summary.formType}</p>
                <p className="text-xs text-muted-foreground">
                  {summary.confidence}% confidence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completeness */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tax-500/10 rounded-lg">
                <Target className="h-5 w-5 text-tax-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Completeness</p>
                <p className={`text-lg font-semibold ${getCompletenessColor(summary.completeness)}`}>
                  {summary.completeness}%
                </p>
                <Progress value={summary.completeness} className="mt-1 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Level */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <Badge variant={getRiskColor(summary.riskLevel)} className="mt-1">
                  {summary.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Found */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error-500/10 rounded-lg">
                <Info className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="text-lg font-semibold">{summary.totalIssues}</p>
                <div className="flex gap-2 mt-1">
                  {summary.criticalIssues > 0 && (
                    <Badge variant="error" className="text-xs">
                      {summary.criticalIssues} critical
                    </Badge>
                  )}
                  {summary.warningIssues > 0 && (
                    <Badge variant="warning" className="text-xs">
                      {summary.warningIssues} warnings
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analysis Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Extracted Fields</span>
              <span className="font-medium">
                {summary.extractedFields}/{summary.totalFields}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Recognition Accuracy</span>
              <span className="font-medium">{summary.confidence}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Document Quality</span>
              <Badge variant={summary.confidence > 95 ? 'success' : 
                             summary.confidence > 85 ? 'warning' : 'error'}>
                {summary.confidence > 95 ? 'Excellent' : 
                 summary.confidence > 85 ? 'Good' : 'Poor'}
              </Badge>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Your {summary.formType} has been successfully analyzed. 
                {summary.completeness >= 90 ? 
                  " All major fields have been identified." :
                  ` ${100 - summary.completeness}% of fields may need attention.`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.criticalIssues > 0 ? (
              <div className="p-3 bg-error-50 rounded-lg border border-error-200">
                <p className="text-sm font-medium text-error-800">
                  ⚠️ {summary.criticalIssues} Critical Issue{summary.criticalIssues > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-error-600 mt-1">
                  Review and resolve these issues before filing
                </p>
              </div>
            ) : (
              <div className="p-3 bg-success-50 rounded-lg border border-success-200">
                <p className="text-sm font-medium text-success-800">
                  ✅ No Critical Issues Found
                </p>
                <p className="text-xs text-success-600 mt-1">
                  Your document appears ready for filing
                </p>
              </div>
            )}

            {summary.warningIssues > 0 && (
              <div className="p-3 bg-warning-50 rounded-lg border border-warning-200">
                <p className="text-sm font-medium text-warning-800">
                  ⚠️ {summary.warningIssues} Warning{summary.warningIssues > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-warning-600 mt-1">
                  Consider reviewing these potential improvements
                </p>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <p className="text-sm font-medium">Recommended Actions:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {summary.criticalIssues > 0 && (
                  <li>• Fix all critical issues before proceeding</li>
                )}
                {summary.completeness < 90 && (
                  <li>• Complete missing required fields</li>
                )}
                <li>• Review extracted amounts for accuracy</li>
                <li>• Download detailed report for your records</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Document ID: {documentId}</span>
            <span>Analysis completed at {formatDate(processedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
