const logger = require('../utils/logger');
const config = require('../config');

/**
 * Base class for all device simulators
 * Provides common functionality and structure
 */
class BaseSimulator {
  /**
   * Creates a new device simulator
   * 
   * @param {Object} deviceConfig - Device configuration
   * @param {Function} sendCallback - Callback to send data
   */
  constructor(deviceConfig, sendCallback) {
    this.deviceId = deviceConfig.deviceId;
    this.type = deviceConfig.type;
    this.location = deviceConfig.location;
    this.unit = deviceConfig.unit;
    this.normalMin = deviceConfig.normalMin;
    this.normalMax = deviceConfig.normalMax;
    this.alertMin = deviceConfig.alertMin;
    this.alertMax = deviceConfig.alertMax;
    this.updateFrequencySeconds = deviceConfig.updateFrequencySeconds;
    this.simulationParams = deviceConfig.simulationParams;
    this.description = deviceConfig.description;
    
    // Function to send data
    this.sendCallback = sendCallback;
    
    // Anomaly injection probability
    this.anomalyProbability = config.service.anomalyProbability;
    
    // Last generated value (for continuous patterns)
    this.lastValue = null;
    
    // Internal timer reference
    this.timer = null;
    
    // Runtime stats
    this.stats = {
      generatedReadings: 0,
      anomaliesGenerated: 0,
      startTime: new Date()
    };
    
    logger.debug({ device: this.deviceId }, 'Initialized simulator');
  }

  /**
   * Starts the simulator
   */
  start() {
    logger.info({ 
      device: this.deviceId, 
      frequency: this.updateFrequencySeconds 
    }, 'Starting simulator');
    
    // Generate initial reading
    this.generateAndSend();
    
    // Set up recurring timer
    this.timer = setInterval(() => {
      this.generateAndSend();
    }, this.updateFrequencySeconds * 1000);
    
    return this;
  }

  /**
   * Stops the simulator
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      
      logger.info({ 
        device: this.deviceId,
        stats: this.stats
      }, 'Stopped simulator');
    }
    
    return this;
  }

  /**
   * Generates a sensor reading
   * Must be implemented by subclasses
   * 
   * @returns {number} The generated reading value
   */
  generateReading() {
    throw new Error('generateReading() must be implemented by subclasses');
  }

  /**
   * Determines if an anomaly should be injected
   * 
   * @returns {boolean} True if an anomaly should be injected
   */
  shouldInjectAnomaly() {
    return Math.random() < this.anomalyProbability;
  }

  /**
   * Injects an anomaly into the reading
   * Can be overridden by subclasses for specific anomaly patterns
   * 
   * @param {number} value - The original value
   * @returns {number} The value with an anomaly injected
   */
  injectAnomaly(value) {
    // Default implementation: generate value outside normal range
    if (this.alertMax !== null && this.normalMax !== null) {
      // Generate a value between normalMax and alertMax
      return this.normalMax + Math.random() * (this.alertMax - this.normalMax);
    } else if (this.alertMin !== null && this.normalMin !== null) {
      // Generate a value between alertMin and normalMin
      return this.alertMin + Math.random() * (this.normalMin - this.alertMin);
    } else {
      // Fallback: add/subtract a significant amount
      const direction = Math.random() > 0.5 ? 1 : -1;
      return value * (1 + direction * 0.5); // 50% deviation
    }
  }

  /**
   * Generates a reading and sends it
   */
  generateAndSend() {
    try {
      // Generate the reading
      let value = this.generateReading();
      
      // Maybe inject anomaly
      let isAnomaly = false;
      if (this.shouldInjectAnomaly()) {
        const originalValue = value;
        value = this.injectAnomaly(value);
        isAnomaly = true;
        this.stats.anomaliesGenerated++;
        
        logger.debug({
          device: this.deviceId,
          originalValue,
          anomalyValue: value
        }, 'Injected anomaly');
      }
      
      // Save last value for next generation
      this.lastValue = value;
      
      // Format the reading
      const reading = this.formatReading(value, isAnomaly);
      
      // Send the reading
      this.sendCallback(reading);
      
      // Update stats
      this.stats.generatedReadings++;
      
      // Log at appropriate level
      if (isAnomaly) {
        logger.warn({ reading }, 'Generated anomalous reading');
      } else {
        logger.debug({ reading }, 'Generated reading');
      }
    } catch (error) {
      logger.error({ 
        device: this.deviceId, 
        error: error.message 
      }, 'Error generating reading');
    }
  }

  /**
   * Formats a reading for sending
   * 
   * @param {number} value - The reading value
   * @param {boolean} isAnomaly - Whether this is an anomalous reading
   * @returns {Object} Formatted reading
   */
  formatReading(value, isAnomaly = false) {
    return {
      deviceId: this.deviceId,
      timestamp: new Date().toISOString(),
      sensorType: this.type,
      value: parseFloat(value.toFixed(2)), // 2 decimal places
      unit: this.unit,
      location: this.location,
      status: isAnomaly ? 'anomaly' : 'active'
    };
  }

  /**
   * Gets the simulator's current statistics
   * 
   * @returns {Object} Simulator statistics
   */
  getStats() {
    const now = new Date();
    const runtimeMs = now - this.stats.startTime;
    const runtimeMinutes = runtimeMs / 60000;
    
    return {
      ...this.stats,
      runtimeMinutes: parseFloat(runtimeMinutes.toFixed(2)),
      readingsPerMinute: parseFloat((this.stats.generatedReadings / runtimeMinutes).toFixed(2)),
      anomalyPercentage: parseFloat((this.stats.anomaliesGenerated / this.stats.generatedReadings * 100).toFixed(2))
    };
  }
}

module.exports = BaseSimulator;
