const express = require('express');
const documentRoutes = require('./documentRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

// Mount route modules
router.use('/documents', documentRoutes);
router.use('/health', healthRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'DocuLens API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      documents: '/api/documents',
      health: '/api/health'
    }
  });
});

module.exports = router;
