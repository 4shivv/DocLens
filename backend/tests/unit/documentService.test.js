const documentService = require('../../src/services/documentService');
const { ProcessingStatus } = require('../../src/models/Document');

describe('DocumentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDocument', () => {
    it('should create a new document with default values', async () => {
      const mockDb = {
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: jest.fn().mockResolvedValue()
          }))
        }))
      };

      jest.spyOn(documentService, 'getDatabase').mockReturnValue(mockDb);

      const documentData = {
        id: 'test-id',
        fileName: 'test.pdf',
        fileSize: 1024,
        fileType: 'application/pdf'
      };

      const result = await documentService.createDocument(documentData);

      expect(result).toHaveProperty('id', 'test-id');
      expect(result).toHaveProperty('processingStatus', ProcessingStatus.PENDING);
      expect(result).toHaveProperty('processingProgress', 0);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle database errors', async () => {
      const mockDb = {
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: jest.fn().mockRejectedValue(new Error('Database error'))
          }))
        }))
      };

      jest.spyOn(documentService, 'getDatabase').mockReturnValue(mockDb);

      const documentData = {
        id: 'test-id',
        fileName: 'test.pdf'
      };

      await expect(documentService.createDocument(documentData))
        .rejects.toThrow('Database error');
    });
  });

  describe('getDocument', () => {
    it('should return document when it exists', async () => {
      const mockDocData = {
        fileName: 'test.pdf',
        processingStatus: 'completed'
      };

      const mockDb = {
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: 'test-id',
              data: () => mockDocData
            })
          }))
        }))
      };

      jest.spyOn(documentService, 'getDatabase').mockReturnValue(mockDb);

      const result = await documentService.getDocument('test-id');

      expect(result).toEqual({
        id: 'test-id',
        ...mockDocData
      });
    });

    it('should return null when document does not exist', async () => {
      const mockDb = {
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({
              exists: false
            })
          }))
        }))
      };

      jest.spyOn(documentService, 'getDatabase').mockReturnValue(mockDb);

      const result = await documentService.getDocument('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateProcessingStatus', () => {
    it('should update status with progress', async () => {
      const mockUpdate = jest.fn().mockResolvedValue();
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      const mockDb = { collection: mockCollection };

      jest.spyOn(documentService, 'getDatabase').mockReturnValue(mockDb);

      await documentService.updateProcessingStatus('test-id', 'processing', 50);

      expect(mockCollection).toHaveBeenCalledWith('documents');
      expect(mockDoc).toHaveBeenCalledWith('test-id');
      expect(mockUpdate).toHaveBeenCalledWith({
        processingStatus: 'processing',
        processingProgress: 50,
        updatedAt: expect.any(Date)
      });
    });

    it('should set completion timestamp when status is completed', async () => {
      const mockUpdate = jest.fn().mockResolvedValue();
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      const mockDb = { collection: mockCollection };

      jest.spyOn(documentService, 'getDatabase').mockReturnValue(mockDb);

      await documentService.updateProcessingStatus('test-id', 'completed');

      expect(mockCollection).toHaveBeenCalledWith('documents');
      expect(mockDoc).toHaveBeenCalledWith('test-id');
      expect(mockUpdate).toHaveBeenCalledWith({
        processingStatus: 'completed',
        processedAt: expect.any(Date),
        processingProgress: 100,
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('storeAnalysisResults', () => {
    it('should store analysis results and mark as completed', async () => {
      const mockUpdate = jest.fn().mockResolvedValue();
      const mockDoc = jest.fn(() => ({ update: mockUpdate }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      const mockDb = { collection: mockCollection };

      jest.spyOn(documentService, 'getDatabase').mockReturnValue(mockDb);

      const analysisData = {
        formType: 'W2',
        confidence: 0.9,
        detectedIssues: []
      };

      await documentService.storeAnalysisResults('test-id', analysisData);

      expect(mockCollection).toHaveBeenCalledWith('documents');
      expect(mockDoc).toHaveBeenCalledWith('test-id');
      expect(mockUpdate).toHaveBeenCalledWith({
        aiAnalysis: analysisData,
        processingStatus: 'completed',
        processedAt: expect.any(Date),
        processingProgress: 100,
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and return true when successful', async () => {
      jest.spyOn(documentService, 'getDocument').mockResolvedValue({
        id: 'test-id',
        fileName: 'test.pdf'
      });

      const mockDelete = jest.fn().mockResolvedValue();
      const mockDoc = jest.fn(() => ({ delete: mockDelete }));
      const mockCollection = jest.fn(() => ({ doc: mockDoc }));
      const mockDb = { collection: mockCollection };

      jest.spyOn(documentService, 'getDatabase').mockReturnValue(mockDb);

      const result = await documentService.deleteDocument('test-id');

      expect(result).toBe(true);
      expect(mockCollection).toHaveBeenCalledWith('documents');
      expect(mockDoc).toHaveBeenCalledWith('test-id');
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should return false when document does not exist', async () => {
      jest.spyOn(documentService, 'getDocument').mockResolvedValue(null);

      const result = await documentService.deleteDocument('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('generateReport', () => {
    it('should generate JSON report', async () => {
      const mockResults = {
        documentId: 'test-id',
        formType: 'W2',
        detectedIssues: []
      };

      jest.spyOn(documentService, 'getAnalysisResults').mockResolvedValue(mockResults);

      const result = await documentService.generateReport('test-id', 'json');

      expect(result).toBe(JSON.stringify(mockResults, null, 2));
    });

    it('should throw error for unsupported format', async () => {
      const mockResults = {
        documentId: 'test-id',
        formType: 'W2'
      };

      jest.spyOn(documentService, 'getAnalysisResults').mockResolvedValue(mockResults);

      await expect(documentService.generateReport('test-id', 'xml'))
        .rejects.toThrow('Unsupported report format: xml');
    });
  });
});
