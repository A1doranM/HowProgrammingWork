const logger = require('../utils/logger');

class RuleEvaluator {
  constructor(thresholds, severityConfig) {
    this.thresholds = thresholds;
    this.severityConfig = severityConfig;
    this.evaluationHistory = new Map(); // Track recent evaluations for trend analysis
  }

  /**
   * Evaluate sensor data against alert rules
   * @param {string} deviceId - Device identifier
   * @param {number} value - Sensor reading value
   * @param {string} sensorType - Type of sensor
   * @param {string} timestamp - Reading timestamp
   * @returns {Array} Array of violation objects
   */
  async evaluate(deviceId, value, sensorType, timestamp) {
    const violations = [];
    const threshold = this.thresholds[deviceId];
    
    if (!threshold) {
      logger.warn(`No threshold configuration found for device: ${deviceId}`);
      return violations;
    }

    // Validate sensor type matches device configuration
    if (threshold.type !== sensorType) {
      logger.warn(`Sensor type mismatch for device ${deviceId}. Expected: ${threshold.type}, Got: ${sensorType}`);
      return violations;
    }

    try {
      // Store evaluation history for trend analysis
      this.updateEvaluationHistory(deviceId, value, timestamp);

      // Check threshold violations
      const thresholdViolations = this.checkThresholdViolations(deviceId, value, threshold);
      violations.push(...thresholdViolations);

      // Check for trend-based alerts
      const trendViolations = this.checkTrendViolations(deviceId, value, threshold);
      violations.push(...trendViolations);

      // Check for data anomalies
      const anomalyViolations = this.checkDataAnomalies(deviceId, value, threshold);
      violations.push(...anomalyViolations);

      // Check for device health issues
      const healthViolations = this.checkDeviceHealth(deviceId, timestamp);
      violations.push(...healthViolations);

      logger.debug(`Rule evaluation completed for device ${deviceId}`, {
        deviceId,
        value,
        sensorType,
        violationsCount: violations.length,
        violations: violations.map(v => v.type)
      });

    } catch (error) {
      logger.error('Error during rule evaluation:', {
        error: error.message,
        deviceId,
        value,
        sensorType
      });
    }

    return violations;
  }

  /**
   * Check basic threshold violations
   */
  checkThresholdViolations(deviceId, value, threshold) {
    const violations = [];

    // Check maximum threshold
    if (value > threshold.max) {
      violations.push({
        type: 'threshold_exceeded',
        severity: this.calculateSeverity(value, threshold.max, 'above'),
        message: `${threshold.type} reading ${value}${threshold.unit} exceeds maximum threshold of ${threshold.max}${threshold.unit}`,
        threshold: threshold.max,
        value,
        deviation: ((value - threshold.max) / threshold.max * 100).toFixed(2),
        direction: 'above'
      });
    }

    // Check minimum threshold
    if (value < threshold.min) {
      violations.push({
        type: 'threshold_below',
        severity: this.calculateSeverity(value, threshold.min, 'below'),
        message: `${threshold.type} reading ${value}${threshold.unit} below minimum threshold of ${threshold.min}${threshold.unit}`,
        threshold: threshold.min,
        value,
        deviation: ((threshold.min - value) / threshold.min * 100).toFixed(2),
        direction: 'below'
      });
    }

    return violations;
  }

  /**
   * Check for trend-based violations
   */
  checkTrendViolations(deviceId, value, threshold) {
    const violations = [];
    const history = this.evaluationHistory.get(deviceId);

    if (!history || history.length < 5) {
      return violations; // Need at least 5 readings for trend analysis
    }

    const recentReadings = history.slice(-5);
    const trend = this.calculateTrend(recentReadings);

    // Check for rapid increase trend towards danger zone
    if (trend.direction === 'increasing' && trend.rate > 0.1) {
      const timeToThreshold = this.estimateTimeToThreshold(value, threshold.max, trend.rate);
      
      if (timeToThreshold < 300) { // Less than 5 minutes
        violations.push({
          type: 'trend_warning',
          severity: 'medium',
          message: `Rapid increasing trend detected. Value may exceed threshold in ${Math.round(timeToThreshold)}s`,
          threshold: threshold.max,
          value,
          trend: {
            direction: trend.direction,
            rate: trend.rate,
            timeToThreshold
          }
        });
      }
    }

    // Check for rapid decrease trend towards danger zone
    if (trend.direction === 'decreasing' && trend.rate > 0.1) {
      const timeToThreshold = this.estimateTimeToThreshold(value, threshold.min, -trend.rate);
      
      if (timeToThreshold < 300) { // Less than 5 minutes
        violations.push({
          type: 'trend_warning',
          severity: 'medium',
          message: `Rapid decreasing trend detected. Value may fall below threshold in ${Math.round(timeToThreshold)}s`,
          threshold: threshold.min,
          value,
          trend: {
            direction: trend.direction,
            rate: trend.rate,
            timeToThreshold
          }
        });
      }
    }

    return violations;
  }

  /**
   * Check for statistical anomalies
   */
  checkDataAnomalies(deviceId, value, threshold) {
    const violations = [];
    const history = this.evaluationHistory.get(deviceId);

    if (!history || history.length < 10) {
      return violations; // Need more data for statistical analysis
    }

    const recentValues = history.slice(-20).map(h => h.value);
    const stats = this.calculateStatistics(recentValues);

    // Check for values outside 3 standard deviations (outliers)
    const zScore = Math.abs((value - stats.mean) / stats.stdDev);
    
    if (zScore > 3 && stats.stdDev > 0) {
      violations.push({
        type: 'data_anomaly',
        severity: 'low',
        message: `Statistical anomaly detected. Value ${value} is ${zScore.toFixed(2)} standard deviations from mean`,
        threshold: stats.mean,
        value,
        statistics: {
          mean: stats.mean,
          stdDev: stats.stdDev,
          zScore: zScore.toFixed(2)
        }
      });
    }

    return violations;
  }

  /**
   * Check device health based on data frequency
   */
  checkDeviceHealth(deviceId, timestamp) {
    const violations = [];
    const history = this.evaluationHistory.get(deviceId);

    if (!history || history.length < 2) {
      return violations;
    }

    const lastReading = history[history.length - 2];
    const timeDiff = new Date(timestamp) - new Date(lastReading.timestamp);
    const expectedInterval = this.getExpectedInterval(deviceId);

    // Check if device is sending data too infrequently
    if (timeDiff > expectedInterval * 3) { // More than 3x expected interval
      violations.push({
        type: 'device_communication',
        severity: 'medium',
        message: `Device communication issue detected. Last reading was ${Math.round(timeDiff / 1000)}s ago`,
        threshold: expectedInterval / 1000,
        value: timeDiff / 1000,
        lastReading: lastReading.timestamp
      });
    }

    return violations;
  }

  /**
   * Check if alert condition is resolved
   */
  checkResolution(alert, currentValue, sensorType) {
    const threshold = this.thresholds[alert.deviceId];
    if (!threshold) return false;

    switch (alert.type) {
      case 'threshold_exceeded':
        // Resolved if value is back within acceptable range (with 5% buffer)
        return currentValue <= (threshold.max * 0.95);
        
      case 'threshold_below':
        // Resolved if value is back within acceptable range (with 5% buffer)
        return currentValue >= (threshold.min * 1.05);
        
      case 'trend_warning':
        // Trend warnings auto-resolve after some time if no actual threshold violation
        const timeSinceTriggered = Date.now() - new Date(alert.triggeredAt).getTime();
        return timeSinceTriggered > 600000; // 10 minutes
        
      case 'data_anomaly':
        // Anomalies auto-resolve if subsequent readings are normal
        return true;
        
      case 'device_communication':
        // Communication issues resolve when regular data flow resumes
        return true;
        
      default:
        return false;
    }
  }

  /**
   * Calculate severity based on deviation from threshold
   */
  calculateSeverity(value, threshold, direction) {
    const deviation = direction === 'above' 
      ? (value - threshold) / threshold 
      : (threshold - value) / threshold;

    if (deviation >= 0.3) return 'critical';
    if (deviation >= 0.2) return 'high';
    if (deviation >= 0.1) return 'medium';
    return 'low';
  }

  /**
   * Update evaluation history for trend analysis
   */
  updateEvaluationHistory(deviceId, value, timestamp) {
    if (!this.evaluationHistory.has(deviceId)) {
      this.evaluationHistory.set(deviceId, []);
    }

    const history = this.evaluationHistory.get(deviceId);
    history.push({ value, timestamp });

    // Keep only last 50 readings
    if (history.length > 50) {
      history.shift();
    }
  }

  /**
   * Calculate trend from recent readings
   */
  calculateTrend(readings) {
    if (readings.length < 2) {
      return { direction: 'stable', rate: 0 };
    }

    const values = readings.map(r => r.value);
    const n = values.length;
    
    // Simple linear regression to determine trend
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    if (Math.abs(slope) < 0.01) {
      return { direction: 'stable', rate: Math.abs(slope) };
    }
    
    return {
      direction: slope > 0 ? 'increasing' : 'decreasing',
      rate: Math.abs(slope)
    };
  }

  /**
   * Calculate basic statistics for anomaly detection
   */
  calculateStatistics(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    return { mean, variance, stdDev };
  }

  /**
   * Estimate time to reach threshold based on current trend
   */
  estimateTimeToThreshold(currentValue, threshold, rate) {
    if (rate === 0) return Infinity;
    
    const distance = Math.abs(threshold - currentValue);
    return distance / Math.abs(rate);
  }

  /**
   * Get expected data interval for device
   */
  getExpectedInterval(deviceId) {
    // Default intervals based on device type (in milliseconds)
    const intervals = {
      'device-001': 2000,  // Temperature every 2 seconds
      'device-002': 3000,  // Pressure every 3 seconds
      'device-003': 1000,  // Vibration every 1 second
      'device-004': 5000,  // Production every 5 seconds
      'device-005': 4000   // Quality every 4 seconds
    };

    return intervals[deviceId] || 5000; // Default 5 seconds
  }

  /**
   * Get evaluation metrics
   */
  getMetrics() {
    const deviceCount = this.evaluationHistory.size;
    let totalReadings = 0;
    
    this.evaluationHistory.forEach(history => {
      totalReadings += history.length;
    });

    return {
      deviceCount,
      totalReadings,
      avgReadingsPerDevice: deviceCount > 0 ? (totalReadings / deviceCount).toFixed(2) : 0
    };
  }
}

module.exports = RuleEvaluator;
