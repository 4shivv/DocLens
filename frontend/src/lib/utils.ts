import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// File size formatting utility
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// File type validation
export function isValidFileType(file: File): boolean {
  const validTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/tiff",
    "image/bmp"
  ];
  return validTypes.includes(file.type);
}

// Max file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Sleep utility for development
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Issue severity colors
export function getIssueSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "critical":
      return "text-error-600 bg-error-50";
    case "warning":
      return "text-warning-600 bg-warning-50";
    case "info":
      return "text-tax-600 bg-tax-50";
    case "success":
    case "good":
      return "text-success-600 bg-success-50";
    default:
      return "text-muted-foreground bg-muted";
  }
}

// Calculate completeness percentage
export function calculateCompleteness(document: any): number {
  if (!document || !document.analysis) return 0;
  
  const { analysis } = document;
  const totalFields = analysis.totalFields || 1;
  const completedFields = analysis.completedFields || 0;
  
  return Math.round((completedFields / totalFields) * 100);
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Tax form type detection
export function getTaxFormType(filename: string): string {
  const name = filename.toLowerCase();
  
  if (name.includes("w-2") || name.includes("w2")) return "W-2";
  if (name.includes("1099")) return "1099";
  if (name.includes("1040")) return "1040";
  if (name.includes("schedule")) return "Schedule";
  
  return "Tax Document";
}

// Error message formatting
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}
