const EventEmitter = require('events');
const RuleEvaluator = require('./ruleEvaluator');
const AlertManager = require('./alertManager');
const logger = require('../utils/logger');

class AlertEngine extends EventEmitter {
  constructor(config, redisClient, kafkaProducer) {
    super();
    this.config = config;
    this.redis = redisClient;
    this.producer = kafkaProducer;
    
    // Initialize rule evaluator and alert manager
    this.ruleEvaluator = new RuleEvaluator(config.thresholds, config.severity);
    this.alertManager = new AlertManager(redisClient, config.alerts);
    
    // Metrics tracking
    this.metrics = {
      messagesProcessed: 0,
      alertsTriggered: 0,
      alertsResolved: 0,
      processingErrors: 0,
      lastProcessedAt: null
    };

    // Set up event handlers
    this.setupEventHandlers();
    
    // Start periodic tasks
    this.startPeriodicTasks();

    logger.info('Alert Engine initialized', {
      thresholdCount: Object.keys(config.thresholds).length,
      escalationTimeout: config.alerts.escalationTimeoutMs,
      deduplicationWindow: config.alerts.deduplicationWindowMs
    });
  }

  /**
   * Set up internal event handlers
   */
  setupEventHandlers() {
    this.on('alert-triggered', (alert) => this.handleAlertTriggered(alert));
    this.on('alert-resolved', (alert) => this.handleAlertResolved(alert));
    this.on('alert-escalated', (alert) => this.handleAlertEscalated(alert));
    this.on('error', (error) => this.handleError(error));

    logger.debug('Alert Engine event handlers configured');
  }

  /**
   * Start periodic maintenance tasks
   */
  startPeriodicTasks() {
    // Check for escalations every minute
    this.escalationInterval = setInterval(async () => {
      try {
        await this.checkEscalations();
      } catch (error) {
        logger.error('Error in escalation check:', error);
      }
    }, 60000); // 1 minute

    // Cleanup old alerts every hour
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.alertManager.cleanupOldAlerts();
      } catch (error) {
        logger.error('Error in alert cleanup:', error);
      }
    }, 3600000); // 1 hour

    logger.debug('Periodic tasks started');
  }

  /**
   * Process incoming sensor data and evaluate alert conditions
   * @param {Object} sensorData - Sensor reading data
   */
  async processSensorData(sensorData) {
    try {
      const startTime = Date.now();
      
      // Extract data fields
      const { deviceId, value, timestamp, sensorType } = sensorData;
      
      if (!deviceId || value === undefined || !sensorType) {
        logger.warn('Invalid sensor data received', { sensorData });
        this.metrics.processingErrors++;
        return;
      }

      logger.debug('Processing sensor data', {
        deviceId,
        value,
        sensorType,
        timestamp
      });

      // Evaluate alert rules
      const violations = await this.ruleEvaluator.evaluate(
        deviceId, 
        value, 
        sensorType, 
        timestamp
      );

      // Process each violation
      for (const violation of violations) {
        await this.processViolation(violation, sensorData);
      }

      // Check for alert resolution
      await this.checkAlertResolution(deviceId, value, sensorType);

      // Update metrics
      this.metrics.messagesProcessed++;
      this.metrics.lastProcessedAt = new Date().toISOString();

      const processingTime = Date.now() - startTime;
      logger.debug('Sensor data processed', {
        deviceId,
        processingTime,
        violationsFound: violations.length
      });

    } catch (error) {
      this.metrics.processingErrors++;
      logger.error('Error processing sensor data:', {
        error: error.message,
        sensorData,
        stack: error.stack
      });
      
      this.emit('error', error);
    }
  }

  /**
   * Process a rule violation
   */
  async processViolation(violation, sensorData) {
    try {
      const { deviceId, timestamp } = sensorData;
      
      // Check for existing alert to prevent duplicates
      const alertKey = `${deviceId}:${violation.type}`;
      const existingAlert = await this.alertManager.getActiveAlert(alertKey);
      
      if (existingAlert) {
        logger.debug('Alert already exists, skipping duplicate', {
          deviceId,
          violationType: violation.type,
          existingAlertId: existingAlert.id
        });
        return;
      }

      // Create new alert
      const alert = {
        deviceId,
        type: violation.type,
        severity: violation.severity,
        message: violation.message,
        value: violation.value,
        threshold: violation.threshold,
        triggeredAt: new Date(timestamp),
        sensorType: sensorData.sensorType,
        location: sensorData.location,
        unit: sensorData.unit,
        metadata: {
          deviation: violation.deviation,
          direction: violation.direction,
          trend: violation.trend,
          statistics: violation.statistics
        }
      };

      const createdAlert = await this.alertManager.createAlert(alert);
      
      if (createdAlert) {
        this.metrics.alertsTriggered++;
        this.emit('alert-triggered', createdAlert);
        
        logger.info('Alert triggered', {
          alertId: createdAlert.id,
          deviceId,
          type: violation.type,
          severity: violation.severity,
          value: violation.value,
          threshold: violation.threshold
        });
      }

    } catch (error) {
      logger.error('Error processing violation:', {
        error: error.message,
        violation,
        sensorData
      });
      throw error;
    }
  }

  /**
   * Check for alert resolution
   */
  async checkAlertResolution(deviceId, value, sensorType) {
    try {
      const activeAlerts = await this.alertManager.getActiveAlertsForDevice(deviceId);
      
      for (const alert of activeAlerts) {
        const isResolved = this.ruleEvaluator.checkResolution(alert, value, sensorType);
        
        if (isResolved) {
          const resolvedAlert = await this.alertManager.resolveAlert(alert.id, 'auto-resolution');
          this.metrics.alertsResolved++;
          this.emit('alert-resolved', resolvedAlert);
          
          logger.info('Alert auto-resolved', {
            alertId: alert.id,
            deviceId,
            type: alert.type,
            currentValue: value
          });
        }
      }

    } catch (error) {
      logger.error('Error checking alert resolution:', {
        error: error.message,
        deviceId,
        value,
        sensorType
      });
    }
  }

  /**
   * Check for alerts that need escalation
   */
  async checkEscalations() {
    try {
      const escalatedAlerts = await this.alertManager.checkEscalations();
      
      for (const alert of escalatedAlerts) {
        this.emit('alert-escalated', alert);
      }

      if (escalatedAlerts.length > 0) {
        logger.info(`Processed ${escalatedAlerts.length} alert escalations`);
      }

    } catch (error) {
      logger.error('Error checking escalations:', error);
    }
  }

  /**
   * Handle alert triggered event
   */
  async handleAlertTriggered(alert) {
    try {
      // Send to Kafka alerts topic
      await this.producer.sendAlertTriggered(alert);
      
      logger.info('Alert triggered event published', {
        alertId: alert.id,
        deviceId: alert.deviceId,
        type: alert.type,
        severity: alert.severity
      });

    } catch (error) {
      logger.error('Error handling alert triggered event:', {
        error: error.message,
        alertId: alert.id
      });
    }
  }

  /**
   * Handle alert resolved event
   */
  async handleAlertResolved(alert) {
    try {
      // Send to Kafka alerts topic
      await this.producer.sendAlertResolved(alert);
      
      logger.info('Alert resolved event published', {
        alertId: alert.id,
        deviceId: alert.deviceId,
        type: alert.type
      });

    } catch (error) {
      logger.error('Error handling alert resolved event:', {
        error: error.message,
        alertId: alert.id
      });
    }
  }

  /**
   * Handle alert escalated event
   */
  async handleAlertEscalated(alert) {
    try {
      // Send to Kafka alerts topic
      await this.producer.sendAlertEscalated(alert);
      
      logger.warn('Alert escalated event published', {
        alertId: alert.id,
        deviceId: alert.deviceId,
        type: alert.type,
        severity: alert.severity,
        escalationLevel: alert.escalationLevel
      });

    } catch (error) {
      logger.error('Error handling alert escalated event:', {
        error: error.message,
        alertId: alert.id
      });
    }
  }

  /**
   * Handle engine errors
   */
  async handleError(error) {
    logger.error('Alert Engine error:', {
      error: error.message,
      stack: error.stack
    });

    // Send error metrics to Kafka if needed
    try {
      await this.producer.sendMetrics({
        eventType: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (metricsError) {
      logger.error('Failed to send error metrics:', metricsError);
    }
  }

  /**
   * Manually acknowledge an alert
   */
  async acknowledgeAlert(alertId, acknowledgedBy) {
    try {
      const alert = await this.alertManager.acknowledgeAlert(alertId, acknowledgedBy);
      
      // Send acknowledgment event to Kafka
      await this.producer.sendAlertAcknowledged(alert);
      
      logger.info('Alert acknowledged manually', {
        alertId,
        acknowledgedBy
      });

      return alert;

    } catch (error) {
      logger.error('Error acknowledging alert:', {
        error: error.message,
        alertId,
        acknowledgedBy
      });
      throw error;
    }
  }

  /**
   * Manually resolve an alert
   */
  async resolveAlert(alertId, resolvedBy) {
    try {
      const alert = await this.alertManager.resolveAlert(alertId, resolvedBy);
      this.metrics.alertsResolved++;
      this.emit('alert-resolved', alert);
      
      logger.info('Alert resolved manually', {
        alertId,
        resolvedBy
      });

      return alert;

    } catch (error) {
      logger.error('Error resolving alert:', {
        error: error.message,
        alertId,
        resolvedBy
      });
      throw error;
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts() {
    return await this.alertManager.getAllActiveAlerts();
  }

  /**
   * Get alert statistics
   */
  async getAlertStats() {
    return await this.alertManager.getAlertStats();
  }

  /**
   * Get engine metrics
   */
  getMetrics() {
    return {
      engine: this.metrics,
      ruleEvaluator: this.ruleEvaluator.getMetrics(),
      alertManager: this.alertManager.getMetrics()
    };
  }

  /**
   * Shutdown the alert engine
   */
  async shutdown() {
    try {
      // Clear intervals
      if (this.escalationInterval) {
        clearInterval(this.escalationInterval);
      }
      
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      // Remove all listeners
      this.removeAllListeners();

      logger.info('Alert Engine shutdown completed');

    } catch (error) {
      logger.error('Error during Alert Engine shutdown:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  isHealthy() {
    return {
      status: 'healthy',
      metrics: this.getMetrics(),
      lastProcessedAt: this.metrics.lastProcessedAt,
      ruleEvaluatorReady: !!this.ruleEvaluator,
      alertManagerReady: !!this.alertManager,
      redisConnected: this.redis.isConnected,
      kafkaConnected: this.producer.isHealthy()
    };
  }
}

module.exports = AlertEngine;
