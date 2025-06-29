const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

const geminiService = require('../config/gemini');
const ocrService = require('./ocrService');
const documentService = require('./documentService');
const logger = require('../utils/logger');

class ProcessingService {
  constructor() {
    this.processingQueue = new Map(); // Simple in-memory queue for MVP
  }

  /**
   * Queue document for processing
   */
  async queueDocumentProcessing(documentId, filePath) {
    try {
      if (this.processingQueue.has(documentId)) {
        logger.warn(`Document ${documentId} is already queued for processing`);
        return;
      }

      this.processingQueue.set(documentId, {
        filePath,
        status: 'queued',
        queuedAt: new Date()
      });

      await documentService.updateProcessingStatus(documentId, 'processing', 0);

      // Process immediately (for MVP - in production, use a proper job queue)
      this.processDocument(documentId, filePath)
        .catch(error => {
          logger.error(`Processing failed for document ${documentId}:`, error);
          documentService.updateProcessingStatus(documentId, 'failed', null, error.message);
        })
        .finally(() => {
          this.processingQueue.delete(documentId);
        });

    } catch (error) {
      logger.error(`Error queueing document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Main document processing pipeline
   */
  async processDocument(documentId, filePath) {
    logger.info(`Starting processing for document: ${documentId}`);

    try {
      // Step 1: Update status and progress
      await documentService.updateProcessingStatus(documentId, 'processing', 10);

      // Step 2: Read file and determine type
      const fileData = await fs.readFile(filePath);
      const document = await documentService.getDocument(documentId);
      const mimeType = document.fileType || mime.lookup(filePath) || 'application/octet-stream';

      await documentService.updateProcessingStatus(documentId, 'processing', 20);

      // Step 3: Store file in cloud storage
      await documentService.storeFile(documentId, filePath, document.fileName);
      await documentService.updateProcessingStatus(documentId, 'processing', 30);

      // Step 4: Process with Gemini AI (primary method)
      let analysisResults = null;
      try {
        logger.info(`Analyzing document ${documentId} with Gemini AI`);
        analysisResults = await geminiService.analyzeDocument(fileData, mimeType, document.fileName);
        await documentService.updateProcessingStatus(documentId, 'processing', 70);
      } catch (geminiError) {
        logger.warn(`Gemini analysis failed for ${documentId}, falling back to OCR:`, geminiError.message);
        
        // Fallback to OCR + basic analysis
        await this.fallbackProcessing(documentId, fileData, mimeType);
        await documentService.updateProcessingStatus(documentId, 'processing', 70);
      }

      // Step 5: Post-process and validate results
      if (analysisResults) {
        analysisResults = await this.postProcessResults(analysisResults, document);
        await documentService.storeAnalysisResults(documentId, analysisResults);
      }

      // Step 6: Cleanup temporary files
      await this.cleanupTempFiles(filePath);

      // Step 7: Mark as completed
      await documentService.updateProcessingStatus(documentId, 'completed', 100);

      logger.info(`Processing completed successfully for document: ${documentId}`);

    } catch (error) {
      logger.error(`Processing failed for document ${documentId}:`, error);
      await documentService.updateProcessingStatus(documentId, 'failed', null, error.message);
      
      // Cleanup on failure
      try {
        await this.cleanupTempFiles(filePath);
      } catch (cleanupError) {
        logger.error(`Cleanup failed for ${documentId}:`, cleanupError);
      }
      
      throw error;
    }
  }

  /**
   * Fallback processing using OCR when Gemini fails
   */
  async fallbackProcessing(documentId, fileData, mimeType) {
    try {
      logger.info(`Starting fallback OCR processing for document: ${documentId}`);

      // Extract text using OCR
      const ocrResults = await ocrService.extractText(fileData, mimeType);
      await documentService.storeOCRResults(documentId, ocrResults);

      // Basic rule-based analysis
      const basicAnalysis = await this.performBasicAnalysis(ocrResults.text);

      // Store basic analysis results
      await documentService.storeAnalysisResults(documentId, basicAnalysis);

      logger.info(`Fallback processing completed for document: ${documentId}`);
    } catch (error) {
      logger.error(`Fallback processing failed for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Perform basic rule-based analysis on OCR text
   */
  async performBasicAnalysis(text) {
    const analysisResults = {
      formType: 'unknown',
      confidence: 0.3,
      extractedFields: {},
      detectedIssues: [],
      simplifiedSummary: 'Document processed using basic text analysis. Manual review recommended.',
      completenessScore: 0.5,
      riskLevel: 'medium'
    };

    try {
      const upperText = text.toUpperCase();

      // Basic form type detection
      if (upperText.includes('W-2') || upperText.includes('WAGE AND TAX STATEMENT')) {
        analysisResults.formType = 'W2';
        analysisResults.confidence = 0.7;
      } else if (upperText.includes('1099')) {
        analysisResults.formType = '1099';
        analysisResults.confidence = 0.7;
      } else if (upperText.includes('1040')) {
        analysisResults.formType = '1040';
        analysisResults.confidence = 0.7;
      }

      // Basic field extraction using regex patterns
      const patterns = {
        ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
        ein: /\b\d{2}-\d{7}\b/g,
        amounts: /\$[\d,]+\.?\d*/g,
        dates: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g
      };

      Object.entries(patterns).forEach(([key, pattern]) => {
        const matches = text.match(pattern);
        if (matches) {
          analysisResults.extractedFields[key] = matches;
        }
      });

      // Basic issue detection
      if (!analysisResults.extractedFields.ssn || analysisResults.extractedFields.ssn.length === 0) {
        analysisResults.detectedIssues.push({
          type: 'missing_field',
          severity: 'high',
          field: 'ssn',
          description: 'No Social Security Number detected',
          suggestion: 'Ensure SSN is clearly visible and not redacted'
        });
      }

      if (!analysisResults.extractedFields.amounts || analysisResults.extractedFields.amounts.length === 0) {
        analysisResults.detectedIssues.push({
          type: 'missing_field',
          severity: 'medium',
          field: 'amounts',
          description: 'No monetary amounts detected',
          suggestion: 'Verify that dollar amounts are clearly visible'
        });
      }

      // Update completeness and risk based on findings
      const fieldCount = Object.keys(analysisResults.extractedFields).length;
      analysisResults.completenessScore = Math.min(fieldCount / 4, 1.0); // Normalize to 0-1

      if (analysisResults.detectedIssues.length > 2) {
        analysisResults.riskLevel = 'high';
      } else if (analysisResults.detectedIssues.length > 0) {
        analysisResults.riskLevel = 'medium';
      } else {
        analysisResults.riskLevel = 'low';
      }

    } catch (error) {
      logger.error('Error in basic analysis:', error);
      analysisResults.detectedIssues.push({
        type: 'processing_error',
        severity: 'high',
        field: 'general',
        description: 'Error occurred during basic analysis',
        suggestion: 'Manual review required'
      });
    }

    return analysisResults;
  }

  /**
   * Post-process and validate analysis results
   */
  async postProcessResults(results, document) {
    try {
      // Ensure required fields exist
      const processedResults = {
        formType: results.formType || 'unknown',
        confidence: results.confidence || 0.5,
        extractedFields: results.extractedFields || {},
        detectedIssues: Array.isArray(results.detectedIssues) ? results.detectedIssues : [],
        simplifiedSummary: results.simplifiedSummary || 'Analysis completed',
        completenessScore: results.completenessScore || 0.5,
        riskLevel: results.riskLevel || 'medium',
        processingMethod: 'gemini_ai',
        processedAt: new Date().toISOString()
      };

      // Add document metadata to results
      processedResults.documentMetadata = {
        fileName: document.fileName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        uploadedAt: document.uploadedAt
      };

      // Validate and clean detected issues
      processedResults.detectedIssues = processedResults.detectedIssues.map(issue => ({
        type: issue.type || 'unknown',
        severity: issue.severity || 'medium',
        field: issue.field || 'general',
        description: issue.description || 'Issue detected',
        suggestion: issue.suggestion || 'Manual review recommended',
        coordinates: issue.coordinates || null
      }));

      // Calculate overall risk assessment
      const highSeverityIssues = processedResults.detectedIssues.filter(i => i.severity === 'high').length;
      const mediumSeverityIssues = processedResults.detectedIssues.filter(i => i.severity === 'medium').length;

      if (highSeverityIssues > 0) {
        processedResults.riskLevel = 'high';
      } else if (mediumSeverityIssues > 2) {
        processedResults.riskLevel = 'medium';
      }

      return processedResults;
    } catch (error) {
      logger.error('Error post-processing results:', error);
      return results; // Return original results if post-processing fails
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(filePath) {
    try {
      await fs.unlink(filePath);
      logger.info(`Temporary file cleaned up: ${filePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error(`Failed to cleanup temporary file ${filePath}:`, error);
      }
    }
  }

  /**
   * Get processing queue status (for monitoring)
   */
  getQueueStatus() {
    const queueItems = Array.from(this.processingQueue.entries()).map(([documentId, item]) => ({
      documentId,
      status: item.status,
      queuedAt: item.queuedAt
    }));

    return {
      queueLength: this.processingQueue.size,
      items: queueItems
    };
  }
}

module.exports = new ProcessingService();
