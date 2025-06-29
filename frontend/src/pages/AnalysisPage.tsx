import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Download, 
  ArrowLeft, 
  Share2, 
  RotateCcw,
  FileText,
  AlertCircle
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import ResultsSummary from "@/components/analysis/ResultsSummary";
import IssuesList from "@/components/analysis/IssuesList";
import DocumentViewer from "@/components/viewer/DocumentViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentAnalysis } from "@/hooks/useProcessingStatus";
import { DocumentAnalysis } from "@/services/documentService";
import { useToast } from "@/hooks/useToast";

type Issue = DocumentAnalysis['results']['issues'][0];

export default function AnalysisPage() {
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('documentId');
  const [activeTab, setActiveTab] = useState<'summary' | 'issues' | 'document'>('summary');
  const { toast } = useToast();

  const { analysis, isLoading, error, refetch } = useDocumentAnalysis(documentId);

  useEffect(() => {
    if (!documentId) {
      toast({
        title: "No Document Selected",
        description: "Please upload a document first.",
        variant: "destructive",
      });
    }
  }, [documentId, toast]);

  const handleDownloadReport = async () => {
    if (!documentId) return;
    
    try {
      // This would call the actual download API
      toast({
        title: "Download Started",
        description: "Your analysis report is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleIssueClick = (issue: Issue) => {
    setActiveTab('document');
    // Scroll to issue in document viewer
  };

  const handleViewInDocument = (issue: any) => {
    setActiveTab('document');
    // Focus on specific issue in document viewer
  };

  if (!documentId) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Document Selected</h2>
              <p className="text-muted-foreground mb-6">
                You need to upload a document first to view analysis results.
              </p>
              <Button asChild>
                <Link to="/upload">
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analysis results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Analysis Failed</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={refetch}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/upload">
                    Upload New Document
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!analysis) return null;

  const summaryData = {
    formType: analysis.results.summary.formType,
    confidence: analysis.results.summary.confidence,
    completeness: analysis.results.summary.completeness,
    riskLevel: analysis.results.summary.riskLevel,
    totalIssues: analysis.results.issues.length,
    criticalIssues: analysis.results.issues.filter(i => i.severity === 'critical').length,
    warningIssues: analysis.results.issues.filter(i => i.severity === 'warning').length,
    extractedFields: analysis.results.fields.filter(f => f.extracted).length,
    totalFields: analysis.results.fields.length,
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/upload">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">Analysis Results</h1>
              <p className="text-sm text-muted-foreground">
                Document ID: {documentId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-1" />
              Download Report
            </Button>
            
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b">
            <nav className="flex space-x-8">
              {[
                { id: 'summary', label: 'Summary', badge: null },
                { id: 'issues', label: 'Issues', badge: analysis.results.issues.length },
                { id: 'document', label: 'Document View', badge: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {tab.badge !== null && tab.badge > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'summary' && (
            <ResultsSummary
              summary={summaryData}
              documentId={documentId}
              processedAt={analysis.processedAt}
            />
          )}

          {activeTab === 'issues' && (
            <IssuesList
              issues={analysis.results.issues}
              onIssueClick={handleIssueClick}
              onViewInDocument={handleViewInDocument}
            />
          )}

          {activeTab === 'document' && (
            <DocumentViewer
              documentId={documentId}
              issues={analysis.results.issues}
              onIssueClick={handleIssueClick}
            />
          )}
        </div>

        {/* Action Items */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Analysis completed on {new Date(analysis.processedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/upload">
                  Upload Another Document
                </Link>
              </Button>
              
              <Button onClick={handleDownloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Full Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
