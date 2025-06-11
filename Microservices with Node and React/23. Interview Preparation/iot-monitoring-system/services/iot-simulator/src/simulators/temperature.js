const BaseSimulator = require('./base-simulator');
const random = require('../utils/random');

/**
 * Temperature Simulator
 * Generates temperature readings following a sine wave pattern (daily cycle)
 * with random noise.
 */
class TemperatureSimulator extends BaseSimulator {
  constructor(deviceConfig, sendCallback) {
    super(deviceConfig, sendCallback);
    
    // Initialize with base value
    this.lastValue = this.simulationParams.baseValue;
  }

  /**
   * Generates a temperature reading based on:
   * 1. Sine wave to simulate daily temperature cycle
   * 2. Random noise to add realism
   * 
   * @returns {number} Generated temperature value
   */
  generateReading() {
    const now = new Date();
    
    // Current time in seconds since midnight
    const secondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    
    // Generate sine wave component based on time of day
    const sineComponent = random.sineWave(
      secondsToday,
      this.simulationParams.amplitude,
      this.simulationParams.cyclePeriod,
      this.simulationParams.baseValue
    );
    
    // Add random noise
    const noise = (Math.random() * 2 - 1) * this.simulationParams.noiseLevel;
    
    // Combine components
    let value = sineComponent + noise;
    
    // Ensure value stays within normal range
    if (value < this.normalMin) value = this.normalMin;
    if (value > this.normalMax) value = this.normalMax;
    
    return value;
  }

  /**
   * Override anomaly injection for temperature-specific anomalies
   * 
   * @param {number} value - Original temperature value
   * @returns {number} Temperature with anomaly
   */
  injectAnomaly(value) {
    // For temperature, generate extreme values above or below normal range
    if (Math.random() > 0.5) {
      // High temperature spike
      return random.randomInRange(this.normalMax, this.alertMax || (this.normalMax * 1.2));
    } else {
      // Low temperature drop
      return random.randomInRange(this.alertMin || (this.normalMin * 0.8), this.normalMin);
    }
  }
}

module.exports = TemperatureSimulator;
