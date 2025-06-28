import { useState, useRef, useEffect } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize2, 
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Issue {
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
}

interface DocumentViewerProps {
  documentId: string;
  documentUrl?: string;
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
}

export default function DocumentViewer({ 
  documentId, 
  documentUrl, 
  issues = [],
  onIssueClick 
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // In a real implementation, this would load the document using PDF.js
  // and render annotations using Fabric.js
  useEffect(() => {
    // Placeholder for document loading
    // This would integrate with PDF.js for PDF files
    // or display images directly for image files
    console.log("Loading document:", documentId);
  }, [documentId]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue.id);
    onIssueClick?.(issue);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-error-500/20 border-error-500';
      case 'warning':
        return 'bg-warning-500/20 border-warning-500';
      case 'info':
        return 'bg-tax-500/20 border-tax-500';
      default:
        return 'bg-muted/20 border-muted';
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-16 text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAnnotations(!showAnnotations)}
            >
              {showAnnotations ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span className="ml-1 hidden sm:inline">
                {showAnnotations ? "Hide" : "Show"} Issues
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {issues.length} issues found
            </Badge>
            
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Document Viewer */}
      <div className="flex gap-4">
        {/* Main Document View */}
        <Card className="flex-1 document-viewer">
          <div 
            ref={containerRef}
            className="relative overflow-auto bg-gray-50 h-[600px] flex items-center justify-center"
          >
            {/* Placeholder for document */}
            <div 
              className="bg-white shadow-lg border relative"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                width: '595px', // A4 width
                height: '842px', // A4 height
              }}
            >
              {/* Mock document content */}
              <div className="p-8 h-full">
                <div className="border-b pb-4 mb-6">
                  <h2 className="text-lg font-bold">W-2 Wage and Tax Statement</h2>
                  <p className="text-sm text-gray-600">Tax Year 2023</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Employee Information</p>
                    <p>John Doe</p>
                    <p>123 Main St</p>
                    <p>Anytown, ST 12345</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold">Employer Information</p>
                    <p>ABC Company Inc.</p>
                    <p>456 Business Ave</p>
                    <p>Business City, ST 67890</p>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border p-2">
                      <p className="text-xs text-gray-600">Box 1 - Wages</p>
                      <p className="font-medium">$75,000.00</p>
                    </div>
                    <div className="border p-2">
                      <p className="text-xs text-gray-600">Box 2 - Federal Tax</p>
                      <p className="font-medium">$12,500.00</p>
                    </div>
                    <div className="border p-2 bg-yellow-50 border-yellow-300">
                      <p className="text-xs text-gray-600">Box 12 - Codes</p>
                      <p className="font-medium text-yellow-800">[Missing]</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Annotations */}
              {showAnnotations && issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`absolute border-2 cursor-pointer transition-opacity ${
                    getSeverityColor(issue.severity)
                  } ${selectedIssue === issue.id ? 'opacity-100' : 'opacity-70'}`}
                  style={{
                    left: issue.coordinates?.x || Math.random() * 400 + 100,
                    top: issue.coordinates?.y || Math.random() * 200 + 300,
                    width: issue.coordinates?.width || 120,
                    height: issue.coordinates?.height || 40,
                  }}
                  onClick={() => handleIssueClick(issue)}
                  title={issue.message}
                >
                  <div className="absolute -top-6 left-0">
                    <Badge 
                      variant={issue.severity === 'critical' ? 'error' : 
                              issue.severity === 'warning' ? 'warning' : 'info'}
                      className="text-xs"
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Issues Sidebar */}
        <Card className="w-80 h-[600px] overflow-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Detected Issues</h3>
            <p className="text-sm text-muted-foreground">
              {issues.length} issue{issues.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="p-4 space-y-3">
            {issues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No issues detected</p>
                <p className="text-xs">Your document looks good!</p>
              </div>
            ) : (
              issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedIssue === issue.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleIssueClick(issue)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge 
                      variant={issue.severity === 'critical' ? 'error' : 
                              issue.severity === 'warning' ? 'warning' : 'info'}
                      className="text-xs"
                    >
                      {issue.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {issue.field}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium mb-1">{issue.message}</p>
                  
                  {issue.suggestion && (
                    <p className="text-xs text-muted-foreground">
                      💡 {issue.suggestion}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
