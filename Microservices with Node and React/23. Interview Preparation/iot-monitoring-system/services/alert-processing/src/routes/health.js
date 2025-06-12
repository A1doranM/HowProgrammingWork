const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * Health check routes for alert processing service
 */

// Basic health check
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'alert-processing',
      version: '1.0.0',
      uptime: process.uptime()
    };

    res.json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check with dependencies
router.get('/health/detailed', async (req, res) => {
  try {
    const { alertEngine, redisClient, kafkaConsumer, kafkaProducer } = req.app.locals;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'alert-processing',
      version: '1.0.0',
      uptime: process.uptime(),
      dependencies: {
        redis: {
          status: redisClient?.isConnected ? 'healthy' : 'unhealthy',
          connected: redisClient?.isConnected || false
        },
        kafkaConsumer: {
          status: kafkaConsumer?.isHealthy() ? 'healthy' : 'unhealthy',
          connected: kafkaConsumer?.isHealthy() || false
        },
        kafkaProducer: {
          status: kafkaProducer?.isHealthy() ? 'healthy' : 'unhealthy',
          connected: kafkaProducer?.isHealthy() || false
        },
        alertEngine: {
          status: alertEngine ? 'healthy' : 'unhealthy',
          ready: !!alertEngine
        }
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    };

    // Check if any dependency is unhealthy
    const dependencyStatuses = Object.values(health.dependencies).map(dep => dep.status);
    const hasUnhealthyDependency = dependencyStatuses.includes('unhealthy');

    if (hasUnhealthyDependency) {
      health.status = 'degraded';
      res.status(503).json(health);
    } else {
      res.json(health);
    }

  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    const { alertEngine, redisClient, kafkaConsumer, kafkaProducer } = req.app.locals;

    const ready = !!(alertEngine && redisClient?.isConnected && 
                    kafkaConsumer?.isHealthy() && kafkaProducer?.isHealthy());

    if (ready) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const { alertEngine } = req.app.locals;

    if (!alertEngine) {
      return res.status(503).json({
        error: 'Alert engine not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const metrics = alertEngine.getMetrics();
    
    res.json({
      service: 'alert-processing',
      timestamp: new Date().toISOString(),
      metrics
    });

  } catch (error) {
    logger.error('Metrics retrieval failed:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Alert statistics
router.get('/alerts/stats', async (req, res) => {
  try {
    const { alertEngine } = req.app.locals;

    if (!alertEngine) {
      return res.status(503).json({
        error: 'Alert engine not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const stats = await alertEngine.getAlertStats();
    
    res.json({
      timestamp: new Date().toISOString(),
      stats
    });

  } catch (error) {
    logger.error('Alert stats retrieval failed:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Active alerts endpoint
router.get('/alerts/active', async (req, res) => {
  try {
    const { alertEngine } = req.app.locals;

    if (!alertEngine) {
      return res.status(503).json({
        error: 'Alert engine not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const alerts = await alertEngine.getActiveAlerts();
    
    res.json({
      timestamp: new Date().toISOString(),
      count: alerts.length,
      alerts
    });

  } catch (error) {
    logger.error('Active alerts retrieval failed:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Acknowledge alert endpoint
router.post('/alerts/:alertId/acknowledge', async (req, res) => {
  try {
    const { alertEngine } = req.app.locals;
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;

    if (!alertEngine) {
      return res.status(503).json({
        error: 'Alert engine not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const alert = await alertEngine.acknowledgeAlert(alertId, acknowledgedBy);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      alert
    });

  } catch (error) {
    logger.error('Alert acknowledgment failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Resolve alert endpoint
router.post('/alerts/:alertId/resolve', async (req, res) => {
  try {
    const { alertEngine } = req.app.locals;
    const { alertId } = req.params;
    const { resolvedBy } = req.body;

    if (!alertEngine) {
      return res.status(503).json({
        error: 'Alert engine not initialized',
        timestamp: new Date().toISOString()
      });
    }

    const alert = await alertEngine.resolveAlert(alertId, resolvedBy);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      alert
    });

  } catch (error) {
    logger.error('Alert resolution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
