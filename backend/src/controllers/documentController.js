const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');

const documentService = require('../services/documentService');
const processingService = require('../services/processingService');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

class DocumentController {
  /**
   * Upload a new document
   */
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }

      const documentId = uuidv4();
      const file = req.file;
      
      // Create document metadata
      const documentData = {
        id: documentId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: mime.lookup(file.originalname) || 'application/octet-stream',
        uploadedAt: new Date(),
        processingStatus: 'pending',
        tempFilePath: file.path
      };

      // Save initial document record
      await documentService.createDocument(documentData);

      // Start processing asynchronously
      processingService.queueDocumentProcessing(documentId, file.path)
        .catch(error => {
          logger.error(`Failed to queue processing for document ${documentId}:`, error);
        });

      logger.info(`Document uploaded successfully: ${documentId}`);

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          documentId,
          fileName: file.originalname,
          fileSize: file.size,
          status: 'processing',
          estimatedProcessingTime: '2-5 minutes'
        }
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.error('Failed to clean up uploaded file:', unlinkError);
        }
      }
      next(error);
    }
  }

  /**
   * Get document details
   */
  async getDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocument(id);

      if (!document) {
        throw new ApiError(404, 'Document not found');
      }

      // If the document has a file, generate a signed URL for it
      if (document.gsUrl) {
        document.url = await documentService.getDocumentUrl(id);
      }

      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get processing status
   */
  async getProcessingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const status = await documentService.getProcessingStatus(id);

      if (!status) {
        throw new ApiError(404, 'Document not found');
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manually trigger document processing
   */
  async processDocument(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocument(id);

      if (!document) {
        throw new ApiError(404, 'Document not found');
      }

      if (document.processingStatus === 'completed') {
        throw new ApiError(400, 'Document already processed');
      }

      if (document.processingStatus === 'processing') {
        throw new ApiError(400, 'Document processing already in progress');
      }

      // Queue for processing
      await processingService.queueDocumentProcessing(id, document.tempFilePath || document.storageUrl);

      res.json({
        success: true,
        message: 'Document processing started',
        data: {
          documentId: id,
          status: 'processing'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get analysis results
   */
  async getResults(req, res, next) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocument(id);

      if (!document) {
        throw new ApiError(404, 'Document not found');
      }

      if (document.processingStatus === 'pending' || document.processingStatus === 'processing') {
        return res.status(202).json({
          success: true,
          message: 'Processing still in progress',
          data: {
            status: document.processingStatus,
            progress: document.processingProgress || 0
          }
        });
      }

      if (document.processingStatus === 'failed') {
        throw new ApiError(400, 'Document processing failed', { 
          error: document.processingError 
        });
      }

      const results = await documentService.getAnalysisResults(id);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download formatted report
   */
  async downloadReport(req, res, next) {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.query;

      const document = await documentService.getDocument(id);
      if (!document) {
        throw new ApiError(404, 'Document not found');
      }

      if (document.processingStatus !== 'completed') {
        throw new ApiError(400, 'Document processing not completed');
      }

      const report = await documentService.generateReport(id, format);

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="doculens-report-${id}.pdf"`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="doculens-report-${id}.json"`);
      }

      res.send(report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      
      const deleted = await documentService.deleteDocument(id);
      if (!deleted) {
        throw new ApiError(404, 'Document not found');
      }

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get supported file formats
   */
  async getSupportedFormats(req, res, next) {
    try {
      const formats = {
        images: [
          { extension: 'jpg', mimeType: 'image/jpeg', maxSize: '50MB' },
          { extension: 'jpeg', mimeType: 'image/jpeg', maxSize: '50MB' },
          { extension: 'png', mimeType: 'image/png', maxSize: '50MB' }
        ],
        documents: [
          { extension: 'pdf', mimeType: 'application/pdf', maxSize: '50MB' }
        ],
        supportedTaxForms: [
          'W-2 (Wage and Tax Statement)',
          '1099-MISC (Miscellaneous Income)',
          '1099-INT (Interest Income)',
          '1040 (Individual Income Tax Return)',
          'Schedule C (Profit or Loss from Business)',
          'Schedule D (Capital Gains and Losses)'
        ]
      };

      res.json({
        success: true,
        data: formats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
