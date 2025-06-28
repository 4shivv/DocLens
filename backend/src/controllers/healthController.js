const { getDB } = require('../config/firebase');
const geminiService = require('../config/gemini');
const logger = require('../utils/logger');

class HealthController {
  /**
   * Basic health check
   */
  async basicHealthCheck(req, res) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  }

  /**
   * Detailed health check including dependencies
   */
  async detailedHealthCheck(req, res) {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      dependencies: {}
    };

    // Check Firebase connection
    try {
      const db = getDB();
      await db.collection('health-check').doc('test').get();
      healthStatus.dependencies.firebase = {
        status: 'healthy',
        responseTime: Date.now()
      };
    } catch (error) {
      healthStatus.dependencies.firebase = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.status = 'degraded';
    }

    // Check Gemini API (basic validation)
    try {
      if (process.env.GEMINI_API_KEY) {
        healthStatus.dependencies.gemini = {
          status: 'configured',
          hasApiKey: true
        };
      } else {
        healthStatus.dependencies.gemini = {
          status: 'misconfigured',
          hasApiKey: false
        };
        healthStatus.status = 'degraded';
      }
    } catch (error) {
      healthStatus.dependencies.gemini = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.status = 'degraded';
    }

    // Check file system (upload directory)
    try {
      const fs = require('fs').promises;
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      await fs.access(uploadPath);
      healthStatus.dependencies.fileSystem = {
        status: 'healthy',
        uploadPath: uploadPath
      };
    } catch (error) {
      healthStatus.dependencies.fileSystem = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.status = 'degraded';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    healthStatus.system = {
      memory: {
        used: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
        unit: 'MB'
      },
      nodeVersion: process.version,
      platform: process.platform
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthStatus);
  }

  /**
   * Readiness check for Kubernetes
   */
  async readinessCheck(req, res) {
    try {
      // Check if essential services are ready
      const db = getDB();
      await db.collection('health-check').doc('test').get();

      // Check if Gemini API key is configured
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Readiness check failed:', error);
      res.status(503).json({
        status: 'not ready',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Liveness check for Kubernetes
   */
  async livenessCheck(req, res) {
    // Simple check to ensure the process is alive
    res.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
}

module.exports = new HealthController();
