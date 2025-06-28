import { useState } from "react";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Eye,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface IssuesListProps {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  onViewInDocument?: (issue: Issue) => void;
}

export default function IssuesList({ 
  issues, 
  onIssueClick, 
  onViewInDocument 
}: IssuesListProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-error-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-tax-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-success-500" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      missing: 'Missing Data',
      inconsistent: 'Inconsistent',
      invalid: 'Invalid Format',
      warning: 'Warning'
    };
    return typeLabels[type] || type;
  };

  const filteredIssues = issues.filter(issue => 
    severityFilter === 'all' || issue.severity === severityFilter
  );

  const issuesByType = filteredIssues.reduce((acc, issue) => {
    const key = issue.severity;
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  const severityOrder = ['critical', 'warning', 'info'];

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Detected Issues</h3>
          <p className="text-sm text-muted-foreground">
            {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">All Issues</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">Info Only</option>
          </select>
        </div>
      </div>

      {/* Issues by Severity */}
      {filteredIssues.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-success-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Issues Found!</h3>
            <p className="text-muted-foreground">
              Your document appears to be complete and properly formatted.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {severityOrder.map(severity => {
            const severityIssues = issuesByType[severity];
            if (!severityIssues || severityIssues.length === 0) return null;

            return (
              <Card key={severity}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getSeverityIcon(severity)}
                    {severity.charAt(0).toUpperCase() + severity.slice(1)} Issues
                    <Badge variant={getSeverityVariant(severity)}>
                      {severityIssues.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {severityIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(issue.type)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {issue.field}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium mb-2">
                            {issue.message}
                          </p>

                          {issue.suggestion && (
                            <div 
                              className={`mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 ${
                                expandedIssue === issue.id ? 'block' : 'hidden'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-primary mb-1">
                                    Suggestion
                                  </p>
                                  <p className="text-sm text-primary/80">
                                    {issue.suggestion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {issue.coordinates && onViewInDocument && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewInDocument(issue)}
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                          
                          {issue.suggestion && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedIssue(
                                expandedIssue === issue.id ? null : issue.id
                              )}
                            >
                              {expandedIssue === issue.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Actions */}
      {filteredIssues.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Review all issues to ensure your tax document is ready for filing
              </div>
              <Button variant="outline" size="sm">
                Export Issue Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
