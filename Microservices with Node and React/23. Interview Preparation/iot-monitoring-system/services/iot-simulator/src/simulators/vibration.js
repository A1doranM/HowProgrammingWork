const BaseSimulator = require('./base-simulator');
const random = require('../utils/random');

/**
 * Vibration Simulator
 * Generates vibration readings with a random walk pattern and
 * occasional high-frequency bursts.
 */
class VibrationSimulator extends BaseSimulator {
  constructor(deviceConfig, sendCallback) {
    super(deviceConfig, sendCallback);
    
    // Initialize with base value
    this.lastValue = this.simulationParams.baseValue;
    
    // Track burst state
    this.inBurst = false;
    this.burstProgress = 0;
    this.burstDuration = 0;
    this.burstAmplitude = 0;
  }

  /**
   * Generates a vibration reading based on:
   * 1. Random walk from previous value
   * 2. Occasional vibration bursts
   * 3. Random noise
   * 
   * @returns {number} Generated vibration value
   */
  generateReading() {
    // Initialize with last value or base value if this is the first reading
    let value = this.lastValue || this.simulationParams.baseValue;
    
    // Check if we should start a new burst
    if (!this.inBurst && random.shouldOccur(this.simulationParams.burstFrequency)) {
      this.inBurst = true;
      this.burstProgress = 0;
      // Random burst duration between 4-10 readings
      this.burstDuration = Math.floor(random.randomInRange(4, 10));
      // Random burst amplitude
      this.burstAmplitude = random.randomInRange(
        this.simulationParams.burstIntensity * 0.7,
        this.simulationParams.burstIntensity
      );
    }
    
    // Apply random walk (less intense during bursts)
    const walkFactor = this.inBurst 
      ? this.simulationParams.randomWalkFactor * 0.5 
      : this.simulationParams.randomWalkFactor;
    
    value = random.randomWalk(
      value,
      walkFactor,
      0, // Minimum possible vibration
      this.normalMax // Maximum normal vibration
    );
    
    // Handle burst generation
    if (this.inBurst) {
      // Calculate burst intensity based on progress (bell curve)
      const normalizedProgress = this.burstProgress / this.burstDuration;
      const burstIntensity = Math.sin(normalizedProgress * Math.PI);
      
      // Apply burst to current value
      value += this.burstAmplitude * burstIntensity;
      
      // Update burst progress
      this.burstProgress++;
      if (this.burstProgress >= this.burstDuration) {
        this.inBurst = false;
      }
    }
    
    // Add random noise (more during bursts)
    const noiseLevel = this.inBurst 
      ? this.simulationParams.noiseLevel * 2 
      : this.simulationParams.noiseLevel;
    
    const noise = (Math.random() * 2 - 1) * noiseLevel;
    value += noise;
    
    // Ensure value stays within normal range and is never negative
    if (value < 0) value = 0;
    if (value > this.normalMax) value = this.normalMax;
    
    return value;
  }

  /**
   * Override anomaly injection for vibration-specific anomalies
   * 
   * @param {number} value - Original vibration value
   * @returns {number} Vibration with anomaly
   */
  injectAnomaly(value) {
    // For vibration, high values are concerning (potential mechanical failure)
    // Generate sustained high vibration above normal range
    const anomalyValue = random.randomInRange(
      this.normalMax,
      this.alertMax || (this.normalMax * 1.5)
    );
    
    // Add high-frequency components through noise
    return anomalyValue + (Math.random() * 10);
  }
}

module.exports = VibrationSimulator;
