// Global test setup
require('dotenv').config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY = 'test-key';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.GEMINI_API_KEY = 'test-gemini-key';

// Mock Firebase for tests
jest.mock('../src/config/firebase', () => ({
  initializeFirebase: jest.fn(),
  getDB: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }))
    }))
  })),
  getBucket: jest.fn(),
  uploadToStorage: jest.fn(),
  deleteFromStorage: jest.fn()
}));

// Mock Gemini service for tests
jest.mock('../src/config/gemini', () => ({
  analyzeDocument: jest.fn(),
  simplifyTaxLanguage: jest.fn()
}));

// Increase timeout for integration tests
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockDocument: () => ({
    id: 'test-doc-id',
    fileName: 'test.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    uploadedAt: new Date(),
    processingStatus: 'pending'
  }),
  
  createMockFile: () => ({
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    path: '/tmp/test.pdf',
    buffer: Buffer.from('test')
  }),
  
  createMockAnalysis: () => ({
    formType: 'W2',
    confidence: 0.9,
    extractedFields: {
      employerName: 'Test Company',
      wages: 50000
    },
    detectedIssues: [],
    simplifiedSummary: 'This is a W-2 form with no issues detected.',
    completenessScore: 0.95,
    riskLevel: 'low'
  })
};
