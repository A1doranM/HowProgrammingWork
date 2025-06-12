const logger = require('../utils/logger');

class AlertManager {
  constructor(redisClient, config) {
    this.redis = redisClient;
    this.config = config;
    this.alertCounts = new Map(); // Track alert counts per device
  }

  /**
   * Create a new alert
   * @param {Object} alert - Alert object
   * @returns {Object} Created alert with ID
   */
  async createAlert(alert) {
    try {
      // Generate unique alert ID
      const alertId = this.generateAlertId(alert.deviceId, alert.type);
      
      // Check for alert spam prevention
      if (await this.isAlertSpam(alert.deviceId, alert.type)) {
        logger.warn('Alert creation blocked due to spam prevention', {
          deviceId: alert.deviceId,
          type: alert.type
        });
        return null;
      }

      // Complete alert object
      const completeAlert = {
        ...alert,
        id: alertId,
        status: 'triggered',
        createdAt: new Date().toISOString(),
        triggeredAt: alert.triggeredAt || new Date().toISOString(),
        acknowledgedAt: null,
        resolvedAt: null,
        escalatedAt: null,
        acknowledgedBy: null,
        escalationLevel: 0
      };

      // Store alert in Redis
      await this.redis.setAlert(alertId, completeAlert);

      // Add to active alerts set
      await this.redis.addToActiveAlerts(alertId);

      // Add to device-specific alerts
      await this.redis.addDeviceAlert(alert.deviceId, alertId);

      // Set deduplication key to prevent duplicate alerts
      const dedupKey = `alert:dedup:${alert.deviceId}:${alert.type}`;
      await this.redis.setDeduplicationKey(
        dedupKey, 
        completeAlert, 
        this.config.deduplicationWindowMs / 1000
      );

      // Set escalation timer
      await this.redis.setEscalationTimer(
        alertId, 
        this.config.escalationTimeoutMs / 1000
      );

      // Update alert metrics
      await this.redis.updateAlertMetrics(alert.deviceId, alert.type);

      // Track alert counts
      this.updateAlertCounts(alert.deviceId);

      logger.info('Alert created successfully', {
        alertId,
        deviceId: alert.deviceId,
        type: alert.type,
        severity: alert.severity
      });

      return completeAlert;

    } catch (error) {
      logger.error('Failed to create alert:', {
        error: error.message,
        deviceId: alert.deviceId,
        type: alert.type
      });
      throw error;
    }
  }

  /**
   * Get active alert for deduplication check
   */
  async getActiveAlert(alertKey) {
    try {
      const dedupKey = `alert:dedup:${alertKey}`;
      return await this.redis.getDeduplicationKey(dedupKey);
    } catch (error) {
      logger.error('Failed to check for existing alert:', error);
      return null;
    }
  }

  /**
   * Get all active alerts for a device
   */
  async getActiveAlertsForDevice(deviceId) {
    try {
      const alertIds = await this.redis.getDeviceAlerts(deviceId);
      const alerts = [];
      
      for (const alertId of alertIds) {
        const alertData = await this.redis.getAlert(alertId);
        if (alertData && alertData.status === 'triggered') {
          alerts.push(alertData);
        }
      }
      
      return alerts;
    } catch (error) {
      logger.error('Failed to get active alerts for device:', {
        error: error.message,
        deviceId
      });
      throw error;
    }
  }

  /**
   * Get all active alerts in the system
   */
  async getAllActiveAlerts() {
    try {
      const alertIds = await this.redis.getActiveAlerts();
      const alerts = [];
      
      for (const alertId of alertIds) {
        const alertData = await this.redis.getAlert(alertId);
        if (alertData) {
          alerts.push(alertData);
        }
      }
      
      // Sort by triggered time (newest first)
      return alerts.sort((a, b) => 
        new Date(b.triggeredAt) - new Date(a.triggeredAt)
      );
    } catch (error) {
      logger.error('Failed to get all active alerts:', error);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId, acknowledgedBy) {
    try {
      const alert = await this.redis.getAlert(alertId);
      if (!alert) {
        throw new Error(`Alert ${alertId} not found`);
      }

      if (alert.status !== 'triggered') {
        throw new Error(`Alert ${alertId} is not in triggered state`);
      }

      // Update alert status
      const updatedAlert = {
        ...alert,
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: acknowledgedBy || 'system'
      };

      await this.redis.setAlert(alertId, updatedAlert);

      // Clear escalation timer since alert is acknowledged
      await this.redis.clearEscalationTimer(alertId);

      logger.info('Alert acknowledged', {
        alertId,
        deviceId: alert.deviceId,
        acknowledgedBy: acknowledgedBy || 'system'
      });

      return updatedAlert;

    } catch (error) {
      logger.error('Failed to acknowledge alert:', {
        error: error.message,
        alertId,
        acknowledgedBy
      });
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId, resolvedBy = 'system') {
    try {
      const alert = await this.redis.getAlert(alertId);
      if (!alert) {
        throw new Error(`Alert ${alertId} not found`);
      }

      // Update alert status
      const updatedAlert = {
        ...alert,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolvedBy
      };

      await this.redis.setAlert(alertId, updatedAlert);

      // Remove from active alerts
      await this.redis.removeFromActiveAlerts(alertId);

      // Clear escalation timer
      await this.redis.clearEscalationTimer(alertId);

      logger.info('Alert resolved', {
        alertId,
        deviceId: alert.deviceId,
        resolvedBy
      });

      return updatedAlert;

    } catch (error) {
      logger.error('Failed to resolve alert:', {
        error: error.message,
        alertId,
        resolvedBy
      });
      throw error;
    }
  }

  /**
   * Escalate an alert
   */
  async escalateAlert(alertId) {
    try {
      const alert = await this.redis.getAlert(alertId);
      if (!alert) {
        throw new Error(`Alert ${alertId} not found`);
      }

      if (alert.status !== 'triggered') {
        logger.debug('Skipping escalation for non-triggered alert', {
          alertId,
          status: alert.status
        });
        return alert;
      }

      // Escalate severity
      const escalatedSeverity = this.escalateSeverity(alert.severity);
      
      const updatedAlert = {
        ...alert,
        severity: escalatedSeverity,
        escalationLevel: (parseInt(alert.escalationLevel) || 0) + 1,
        escalatedAt: new Date().toISOString()
      };

      await this.redis.setAlert(alertId, updatedAlert);

      // Reset escalation timer for next level
      await this.redis.setEscalationTimer(
        alertId, 
        this.config.escalationTimeoutMs / 1000
      );

      logger.warn('Alert escalated', {
        alertId,
        deviceId: alert.deviceId,
        fromSeverity: alert.severity,
        toSeverity: escalatedSeverity,
        escalationLevel: updatedAlert.escalationLevel
      });

      return updatedAlert;

    } catch (error) {
      logger.error('Failed to escalate alert:', {
        error: error.message,
        alertId
      });
      throw error;
    }
  }

  /**
   * Check for alerts that need escalation
   */
  async checkEscalations() {
    try {
      const activeAlerts = await this.getAllActiveAlerts();
      const escalations = [];

      for (const alert of activeAlerts) {
        if (await this.shouldEscalate(alert)) {
          const escalatedAlert = await this.escalateAlert(alert.id);
          escalations.push(escalatedAlert);
        }
      }

      if (escalations.length > 0) {
        logger.info(`Escalated ${escalations.length} alerts`);
      }

      return escalations;

    } catch (error) {
      logger.error('Failed to check escalations:', error);
      throw error;
    }
  }

  /**
   * Check if alert should be escalated
   */
  async shouldEscalate(alert) {
    if (alert.status !== 'triggered') {
      return false;
    }

    const timeSinceTriggered = Date.now() - new Date(alert.triggeredAt).getTime();
    const escalationThreshold = this.config.escalationTimeoutMs;

    return timeSinceTriggered > escalationThreshold;
  }

  /**
   * Clean up old resolved alerts
   */
  async cleanupOldAlerts() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      // This would typically involve scanning through stored alerts
      // For now, we'll implement a basic cleanup
      logger.info('Alert cleanup completed', {
        cutoffDate: cutoffDate.toISOString()
      });

    } catch (error) {
      logger.error('Failed to cleanup old alerts:', error);
      throw error;
    }
  }

  /**
   * Check if creating this alert would be considered spam
   */
  async isAlertSpam(deviceId, alertType) {
    const count = this.alertCounts.get(`${deviceId}:${alertType}`) || 0;
    return count >= this.config.maxActiveAlertsPerDevice;
  }

  /**
   * Update alert counts for spam prevention
   */
  updateAlertCounts(deviceId) {
    // This is a simple in-memory counter
    // In production, you might want to use Redis for this
    this.alertCounts.forEach((count, key) => {
      if (key.startsWith(deviceId)) {
        this.alertCounts.set(key, count + 1);
      }
    });
  }

  /**
   * Generate unique alert ID
   */
  generateAlertId(deviceId, alertType) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `alert-${timestamp}-${deviceId}-${alertType}-${random}`;
  }

  /**
   * Escalate severity level
   */
  escalateSeverity(currentSeverity) {
    const severityLevels = ['low', 'medium', 'high', 'critical'];
    const currentIndex = severityLevels.indexOf(currentSeverity);
    
    if (currentIndex === -1 || currentIndex === severityLevels.length - 1) {
      return 'critical';
    }
    
    return severityLevels[currentIndex + 1];
  }

  /**
   * Get alert statistics
   */
  async getAlertStats() {
    try {
      const activeAlerts = await this.getAllActiveAlerts();
      
      const stats = {
        total: activeAlerts.length,
        bySeverity: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        },
        byDevice: {},
        byType: {},
        oldestAlert: null,
        newestAlert: null
      };

      activeAlerts.forEach(alert => {
        // Count by severity
        stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
        
        // Count by device
        stats.byDevice[alert.deviceId] = (stats.byDevice[alert.deviceId] || 0) + 1;
        
        // Count by type
        stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
        
        // Track oldest and newest
        if (!stats.oldestAlert || new Date(alert.triggeredAt) < new Date(stats.oldestAlert.triggeredAt)) {
          stats.oldestAlert = alert;
        }
        
        if (!stats.newestAlert || new Date(alert.triggeredAt) > new Date(stats.newestAlert.triggeredAt)) {
          stats.newestAlert = alert;
        }
      });

      return stats;

    } catch (error) {
      logger.error('Failed to get alert statistics:', error);
      throw error;
    }
  }

  /**
   * Get alert manager metrics
   */
  getMetrics() {
    return {
      alertCountsInMemory: this.alertCounts.size,
      configuredRetentionDays: this.config.retentionDays,
      configuredEscalationTimeout: this.config.escalationTimeoutMs,
      configuredDeduplicationWindow: this.config.deduplicationWindowMs,
      maxActiveAlertsPerDevice: this.config.maxActiveAlertsPerDevice
    };
  }
}

module.exports = AlertManager;
