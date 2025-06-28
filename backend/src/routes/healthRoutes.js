const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', healthController.basicHealthCheck);

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Detailed health check including dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health status
 */
router.get('/detailed', healthController.detailedHealthCheck);

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness probe for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', healthController.readinessCheck);

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness probe for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', healthController.livenessCheck);

module.exports = router;
