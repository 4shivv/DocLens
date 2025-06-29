const { getDB, uploadToStorage, deleteFromStorage, getSignedUrl } = require('../config/firebase');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class DocumentService {
  constructor() {
    this.db = null;
    this.collection = 'documents';
  }

  /**
   * Initialize database connection
   */
  getDatabase() {
    if (!this.db) {
      this.db = getDB();
    }
    return this.db;
  }

  /**
   * Create a new document record
   */
  async createDocument(documentData) {
    try {
      const db = this.getDatabase();
      const docRef = db.collection(this.collection).doc(documentData.id);
      
      const document = {
        ...documentData,
        createdAt: new Date(),
        updatedAt: new Date(),
        processingStatus: 'pending',
        processingProgress: 0
      };

      await docRef.set(document);
      
      logger.info(`Document created: ${documentData.id}`);
      return document;
    } catch (error) {
      logger.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId) {
    try {
      const db = this.getDatabase();
      const docRef = db.collection(this.collection).doc(documentId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      logger.error(`Error getting document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Update document data
   */
  async updateDocument(documentId, updateData) {
    try {
      const db = this.getDatabase();
      const docRef = db.collection(this.collection).doc(documentId);
      
      const updates = {
        ...updateData,
        updatedAt: new Date()
      };

      await docRef.update(updates);
      
      logger.info(`Document updated: ${documentId}`);
      return updates;
    } catch (error) {
      logger.error(`Error updating document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Update processing status
   */
  async updateProcessingStatus(documentId, status, progress = null, error = null) {
    try {
      const updates = {
        processingStatus: status,
        updatedAt: new Date()
      };

      if (progress !== null) {
        updates.processingProgress = progress;
      }

      if (error) {
        updates.processingError = error;
      }

      if (status === 'completed') {
        updates.processedAt = new Date();
        updates.processingProgress = 100;
      }

      await this.updateDocument(documentId, updates);
    } catch (error) {
      logger.error(`Error updating processing status for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get processing status
   */
  async getProcessingStatus(documentId) {
    try {
      const document = await this.getDocument(documentId);
      if (!document) {
        return null;
      }

      // Map processing status to stage for frontend compatibility
      const stageMap = {
        'pending': 'uploaded',
        'processing': 'analyzing',
        'completed': 'completed',
        'error': 'error'
      };

      // Generate appropriate message based on status
      const messageMap = {
        'pending': 'Document uploaded, waiting to process',
        'processing': 'Analyzing your document with AI',
        'completed': 'Analysis complete',
        'error': document.processingError || 'Processing failed'
      };

      return {
        documentId,
        status: document.processingStatus,
        progress: document.processingProgress || 0,
        stage: stageMap[document.processingStatus] || document.processingStatus,
        message: messageMap[document.processingStatus] || 'Processing document',
        error: document.processingError || null,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        processedAt: document.processedAt || null
      };
    } catch (error) {
      logger.error(`Error getting processing status for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Store analysis results
   */
  async storeAnalysisResults(documentId, analysisData) {
    try {
      const updates = {
        results: analysisData, // Store under 'results' key
        processingStatus: 'completed',
        processedAt: new Date(),
        processingProgress: 100
      };

      await this.updateDocument(documentId, updates);
      
      logger.info(`Analysis results stored for document: ${documentId}`);
    } catch (error) {
      logger.error(`Error storing analysis results for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Store OCR results
   */
  async storeOCRResults(documentId, ocrData) {
    try {
      const updates = {
        ocrResults: ocrData
      };

      await this.updateDocument(documentId, updates);
      
      logger.info(`OCR results stored for document: ${documentId}`);
    } catch (error) {
      logger.error(`Error storing OCR results for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Get analysis results
   */
  async getAnalysisResults(documentId) {
    try {
      const document = await this.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      if (document.processingStatus !== 'completed') {
        throw new Error('Document processing not completed');
      }

      return {
        documentId,
        status: document.processingStatus,
        processedAt: document.processedAt,
        results: document.results || null, // Return the 'results' object
      };
    } catch (error) {
      logger.error(`Error getting analysis results for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Store file in cloud storage
   */
  async storeFile(documentId, filePath, originalFileName) {
    try {
      const fileName = `documents/${documentId}/${originalFileName}`;
      const uploadResult = await uploadToStorage(filePath, fileName, {
        documentId,
        originalName: originalFileName
      });

      // Update document with storage URL
      await this.updateDocument(documentId, {
        gsUrl: uploadResult.gsUrl
      });

      logger.info(`File stored in cloud storage: ${fileName}`);
      return uploadResult;
    } catch (error) {
      logger.error(`Error storing file for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Generate report
   */
  async generateReport(documentId, format = 'json') {
    try {
      const results = await this.getAnalysisResults(documentId);
      
      if (format === 'json') {
        return JSON.stringify(results, null, 2);
      }

      if (format === 'pdf') {
        // For now, return JSON - implement PDF generation later
        return JSON.stringify(results, null, 2);
      }

      throw new Error(`Unsupported report format: ${format}`);
    } catch (error) {
      logger.error(`Error generating report for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete document and all associated data
   */
  async deleteDocument(documentId) {
    try {
      const document = await this.getDocument(documentId);
      if (!document) {
        return false;
      }

      // Delete from cloud storage if exists
      if (document.gsUrl) {
        const fileName = `documents/${documentId}/${document.fileName}`;
        try {
          await deleteFromStorage(fileName);
        } catch (storageError) {
          logger.warn(`Failed to delete file from storage: ${storageError.message}`);
        }
      }

      // Delete from database
      const db = this.getDatabase();
      await db.collection(this.collection).doc(documentId).delete();

      logger.info(`Document deleted: ${documentId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * List documents (for admin/debugging)
   */
  async listDocuments(limit = 10, offset = 0) {
    try {
      const db = this.getDatabase();
      const query = db.collection(this.collection)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset);

      const snapshot = await query.get();
      const documents = [];

      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return documents;
    } catch (error) {
      logger.error('Error listing documents:', error);
      throw error;
    }
  }

  /**
   * Get documents by status
   */
  async getDocumentsByStatus(status, limit = 10) {
    try {
      const db = this.getDatabase();
      const query = db.collection(this.collection)
        .where('processingStatus', '==', status)
        .limit(limit);

      const snapshot = await query.get();
      const documents = [];

      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return documents;
    } catch (error) {
      logger.error(`Error getting documents by status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Get a signed URL for a document
   */
  async getDocumentUrl(documentId) {
    try {
      const document = await this.getDocument(documentId);
      if (!document || !document.gsUrl) {
        throw new Error('Document or file not found');
      }
      
      // Extract file path from gsUrl
      const filePath = document.gsUrl.substring(document.gsUrl.indexOf('/', 5) + 1);
      
      return await getSignedUrl(filePath);
    } catch (error) {
      logger.error(`Error getting signed URL for ${documentId}:`, error);
      throw error;
    }
  }
}

module.exports = new DocumentService();
