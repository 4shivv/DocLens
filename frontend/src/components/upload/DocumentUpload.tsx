import { useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDocumentUpload, useDragAndDrop } from "@/hooks/useDocumentUpload";
import { useToast } from "@/hooks/useToast";
import { formatFileSize, isValidFileType, isValidFileSize } from "@/lib/utils";

interface DocumentUploadProps {
  onUploadComplete: (documentId: string) => void;
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, progress, error, upload, reset } = useDocumentUpload();
  const { toast } = useToast();

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0]; // Only handle single file for now

    // Validate file
    if (!isValidFileType(file)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or image file (JPEG, PNG, WEBP, TIFF, BMP).",
        variant: "destructive",
      });
      return;
    }

    if (!isValidFileSize(file)) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const result = await upload(file);
    if (result) {
      toast({
        title: "Upload Successful",
        description: "Your document is being processed.",
      });
      onUploadComplete(result.documentId);
    }
  };

  const { isDragOver, dragHandlers } = useDragAndDrop(handleFiles);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <div
        className={`upload-area ${isDragOver ? "drag-over" : ""} ${
          isUploading ? "pointer-events-none opacity-50" : ""
        }`}
        {...dragHandlers}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff,.bmp"
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {!isUploading ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Upload Your Tax Document
            </h3>
            
            <p className="mb-6 text-gray-600">
              Drag and drop your tax form here, or click to browse
            </p>
            
            <Button onClick={handleFileSelect} size="lg" className="mb-4">
              <FileText className="mr-2 h-5 w-5" />
              Choose File
            </Button>
            
            <div className="text-sm text-gray-500">
              <p>Supports: PDF, JPEG, PNG, WEBP, TIFF, BMP</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary animate-pulse" />
            </div>
            
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Uploading Document...
            </h3>
            
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="mt-2 text-sm text-gray-600">{progress}% complete</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-error-50 p-3 text-error-600">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="ml-auto text-error-600 hover:text-error-700"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Supported Document Types */}
      <div className="border-t p-6">
        <h4 className="mb-4 font-semibold text-gray-900">
          Supported Tax Document Types
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "W-2 Wage and Tax Statement",
            "1099 Forms (All Types)",
            "1040 Individual Income Tax Return",
            "Schedule A (Itemized Deductions)",
            "Schedule C (Business Income)",
            "Other Tax Forms",
          ].map((docType) => (
            <div key={docType} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="h-2 w-2 rounded-full bg-success-500" />
              {docType}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
