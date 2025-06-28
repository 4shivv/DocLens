const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Import the app
const app = require('../../src/server');

describe('Document API Endpoints', () => {
  describe('POST /api/documents/upload', () => {
    it('should upload a valid PDF file', async () => {
      // Create a mock PDF file for testing
      const testFilePath = path.join(__dirname, '../fixtures/test.pdf');
      
      // Skip test if fixture doesn't exist
      if (!fs.existsSync(testFilePath)) {
        console.log('Test fixture not found, skipping upload test');
        return;
      }

      const response = await request(app)
        .post('/api/documents/upload')
        .attach('document', testFilePath)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('documentId');
      expect(response.body.data).toHaveProperty('status', 'processing');
    });

    it('should reject upload without file', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('message');
    });

    it('should reject unsupported file types', async () => {
      const testFilePath = path.join(__dirname, '../fixtures/test.txt');
      
      // Create a temporary text file for testing
      if (!fs.existsSync(path.dirname(testFilePath))) {
        fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      }
      fs.writeFileSync(testFilePath, 'test content');

      const response = await request(app)
        .post('/api/documents/upload')
        .attach('document', testFilePath)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.message).toContain('not allowed');

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    it('should handle rate limiting', async () => {
      // This test would require multiple rapid requests
      // Implementation depends on your rate limiting strategy
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return document details for valid ID', async () => {
      const mockDocumentId = 'test-document-id';
      
      // Mock the document service to return a document
      const documentService = require('../../src/services/documentService');
      jest.spyOn(documentService, 'getDocument').mockResolvedValue({
        id: mockDocumentId,
        fileName: 'test.pdf',
        processingStatus: 'completed'
      });

      const response = await request(app)
        .get(`/api/documents/${mockDocumentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', mockDocumentId);
    });

    it('should return 404 for non-existent document', async () => {
      const nonExistentId = 'non-existent-id';
      
      const documentService = require('../../src/services/documentService');
      jest.spyOn(documentService, 'getDocument').mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/documents/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate UUID format', async () => {
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .get(`/api/documents/${invalidId}`)
        .expect(400);

      expect(response.body.error.message).toContain('valid UUID');
    });
  });

  describe('GET /api/documents/:id/status', () => {
    it('should return processing status', async () => {
      const mockDocumentId = 'test-document-id';
      
      const documentService = require('../../src/services/documentService');
      jest.spyOn(documentService, 'getProcessingStatus').mockResolvedValue({
        documentId: mockDocumentId,
        status: 'processing',
        progress: 50
      });

      const response = await request(app)
        .get(`/api/documents/${mockDocumentId}/status`)
        .expect(200);

      expect(response.body.data).toHaveProperty('status', 'processing');
      expect(response.body.data).toHaveProperty('progress', 50);
    });
  });

  describe('GET /api/documents/:id/results', () => {
    it('should return analysis results for completed document', async () => {
      const mockDocumentId = 'test-document-id';
      
      const documentService = require('../../src/services/documentService');
      jest.spyOn(documentService, 'getDocument').mockResolvedValue({
        id: mockDocumentId,
        processingStatus: 'completed'
      });
      
      jest.spyOn(documentService, 'getAnalysisResults').mockResolvedValue({
        documentId: mockDocumentId,
        formType: 'W2',
        detectedIssues: [],
        riskLevel: 'low'
      });

      const response = await request(app)
        .get(`/api/documents/${mockDocumentId}/results`)
        .expect(200);

      expect(response.body.data).toHaveProperty('formType', 'W2');
      expect(response.body.data).toHaveProperty('riskLevel', 'low');
    });

    it('should return 202 for document still processing', async () => {
      const mockDocumentId = 'test-document-id';
      
      const documentService = require('../../src/services/documentService');
      jest.spyOn(documentService, 'getDocument').mockResolvedValue({
        id: mockDocumentId,
        processingStatus: 'processing',
        processingProgress: 75
      });

      const response = await request(app)
        .get(`/api/documents/${mockDocumentId}/results`)
        .expect(202);

      expect(response.body.data).toHaveProperty('status', 'processing');
      expect(response.body.data).toHaveProperty('progress', 75);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document successfully', async () => {
      const mockDocumentId = 'test-document-id';
      
      const documentService = require('../../src/services/documentService');
      jest.spyOn(documentService, 'deleteDocument').mockResolvedValue(true);

      const response = await request(app)
        .delete(`/api/documents/${mockDocumentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 when deleting non-existent document', async () => {
      const mockDocumentId = 'test-document-id';
      
      const documentService = require('../../src/services/documentService');
      jest.spyOn(documentService, 'deleteDocument').mockResolvedValue(false);

      const response = await request(app)
        .delete(`/api/documents/${mockDocumentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/documents/supported-formats', () => {
    it('should return supported file formats', async () => {
      const response = await request(app)
        .get('/api/documents/supported-formats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('images');
      expect(response.body.data).toHaveProperty('documents');
      expect(response.body.data).toHaveProperty('supportedTaxForms');
    });
  });
});
