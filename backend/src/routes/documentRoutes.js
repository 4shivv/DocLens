const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const documentController = require('../controllers/documentController');
const { validateFileUpload, validateDocumentId } = require('../middleware/validation');
const { uploadRateLimit } = require('../middleware/rateLimiting');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
    files: 1
  },
});

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a tax document for analysis
 *     tags: [Documents]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: document
 *         type: file
 *         required: true
 *         description: Tax document (PDF or image)
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid file or validation error
 *       413:
 *         description: File too large
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/upload',
  uploadRateLimit,
  upload.single('document'),
  validateFileUpload,
  documentController.uploadDocument
);

/**
 * @swagger
 * /api/documents/supported-formats:
 *   get:
 *     summary: Get list of supported file formats
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Supported formats list
 */
router.get('/supported-formats',
  documentController.getSupportedFormats
);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get document details and metadata
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details retrieved
 *       404:
 *         description: Document not found
 */
router.get('/:id',
  validateDocumentId,
  documentController.getDocument
);

/**
 * @swagger
 * /api/documents/{id}/status:
 *   get:
 *     summary: Get document processing status
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Processing status retrieved
 *       404:
 *         description: Document not found
 */
router.get('/:id/status',
  validateDocumentId,
  documentController.getProcessingStatus
);

/**
 * @swagger
 * /api/documents/{id}/process:
 *   post:
 *     summary: Trigger document processing (if not auto-processed)
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Processing started
 *       400:
 *         description: Processing already in progress or completed
 *       404:
 *         description: Document not found
 */
router.post('/:id/process',
  validateDocumentId,
  documentController.processDocument
);

/**
 * @swagger
 * /api/documents/{id}/results:
 *   get:
 *     summary: Get document analysis results
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Analysis results retrieved
 *       202:
 *         description: Processing still in progress
 *       404:
 *         description: Document not found
 */
router.get('/:id/results',
  validateDocumentId,
  documentController.getResults
);

/**
 * @swagger
 * /api/documents/{id}/report:
 *   get:
 *     summary: Download formatted analysis report
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf]
 *           default: json
 *         description: Report format
 *     responses:
 *       200:
 *         description: Report downloaded
 *       404:
 *         description: Document not found
 */
router.get('/:id/report',
  validateDocumentId,
  documentController.downloadReport
);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete document and all associated data
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete('/:id',
  validateDocumentId,
  documentController.deleteDocument
);

/**
 * @swagger
 * /api/documents/supported-formats:
 *   get:
 *     summary: Get list of supported file formats
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Supported formats list
 */

module.exports = router;
