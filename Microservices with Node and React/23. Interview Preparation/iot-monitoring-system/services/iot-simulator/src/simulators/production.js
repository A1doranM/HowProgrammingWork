const BaseSimulator = require('./base-simulator');
const random = require('../utils/random');

/**
 * Production Counter Simulator
 * Generates production count readings based on work shift patterns,
 * with higher values during working hours and lower values at night.
 */
class ProductionSimulator extends BaseSimulator {
  constructor(deviceConfig, sendCallback) {
    super(deviceConfig, sendCallback);
    
    // Initialize with minimum value (night time/off hours default)
    this.lastValue = this.simulationParams.minValue;
  }

  /**
   * Generates a production count reading based on:
   * 1. Time of day (work shift patterns)
   * 2. Random noise for variability
   * 
   * @returns {number} Generated production value
   */
  generateReading() {
    const now = new Date();
    
    // Get base production rate based on time of day
    const baseProduction = random.productionByTime(
      now,
      this.simulationParams.workingHoursStart,
      this.simulationParams.workingHoursEnd,
      this.simulationParams.peakValue,
      this.simulationParams.minValue,
      this.simulationParams.rampUpTimeMinutes
    );
    
    // Add random noise to simulate natural production variability
    const noise = (Math.random() * 2 - 1) * this.simulationParams.noiseLevel;
    let value = baseProduction + noise;
    
    // Ensure value stays within normal range and is never negative
    if (value < 0) value = 0;
    if (value > this.normalMax) value = this.normalMax;
    if (value < this.normalMin && baseProduction > this.normalMin) {
      // Don't let random noise push us below minimum during working hours
      value = this.normalMin;
    }
    
    return value;
  }

  /**
   * Override anomaly injection for production-specific anomalies
   * 
   * @param {number} value - Original production value
   * @returns {number} Production with anomaly
   */
  injectAnomaly(value) {
    // For production, low values during work hours are concerning
    const now = new Date();
    const hour = now.getHours();
    
    // Check if we're in working hours
    if (hour >= this.simulationParams.workingHoursStart && 
        hour < this.simulationParams.workingHoursEnd) {
      // During working hours, production drop is an anomaly
      if (this.alertMin !== null) {
        return random.randomInRange(this.alertMin, this.normalMin);
      } else {
        // Significant drop (40-60% of current value)
        return value * random.randomInRange(0.4, 0.6);
      }
    } else {
      // During off hours, unexpected production is an anomaly
      // (e.g., machine running when it shouldn't be)
      return random.randomInRange(
        this.normalMin,
        this.normalMin + (this.normalMax - this.normalMin) * 0.3
      );
    }
  }
  
  /**
   * Override the reading formatting to include shift information
   */
  formatReading(value, isAnomaly = false) {
    const reading = super.formatReading(value, isAnomaly);
    
    // Determine the current shift
    const hour = new Date().getHours();
    let shift;
    
    if (hour >= 6 && hour < 14) {
      shift = 'morning';
    } else if (hour >= 14 && hour < 22) {
      shift = 'afternoon';
    } else {
      shift = 'night';
    }
    
    // Add to the reading
    return {
      ...reading,
      shift
    };
  }
}

module.exports = ProductionSimulator;
