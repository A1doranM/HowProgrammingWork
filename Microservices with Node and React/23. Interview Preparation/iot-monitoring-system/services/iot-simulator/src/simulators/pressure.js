const BaseSimulator = require('./base-simulator');
const random = require('../utils/random');

/**
 * Pressure Simulator
 * Generates pressure readings with a steady state baseline and
 * occasional spikes plus random noise.
 */
class PressureSimulator extends BaseSimulator {
  constructor(deviceConfig, sendCallback) {
    super(deviceConfig, sendCallback);
    
    // Initialize with base value
    this.lastValue = this.simulationParams.baseValue;
    
    // Track spike state
    this.inSpike = false;
    this.spikeProgress = 0;
    this.spikeDuration = 0;
  }

  /**
   * Generates a pressure reading based on:
   * 1. Steady state baseline
   * 2. Occasional spikes
   * 3. Random noise
   * 
   * @returns {number} Generated pressure value
   */
  generateReading() {
    let value;
    
    // Check if we should start a new spike
    if (!this.inSpike && random.shouldOccur(this.simulationParams.spikeFrequency)) {
      this.inSpike = true;
      this.spikeProgress = 0;
      // Random spike duration between 3-8 readings
      this.spikeDuration = Math.floor(random.randomInRange(3, 8));
    }
    
    // Handle spike generation
    if (this.inSpike) {
      // Calculate spike intensity based on progress
      const progress = this.spikeProgress / this.spikeDuration;
      let intensity;
      
      if (progress < 0.3) {
        // Rising phase - quick rise
        intensity = progress / 0.3;
      } else if (progress < 0.7) {
        // Plateau phase
        intensity = 1.0;
      } else {
        // Falling phase
        intensity = 1.0 - ((progress - 0.7) / 0.3);
      }
      
      // Apply spike to base value
      const spikeAmount = this.simulationParams.spikeIntensity * intensity;
      value = this.simulationParams.baseValue + spikeAmount;
      
      // Update spike progress
      this.spikeProgress++;
      if (this.spikeProgress >= this.spikeDuration) {
        this.inSpike = false;
      }
    } else {
      // Normal operation - just use base value
      value = this.simulationParams.baseValue;
    }
    
    // Add random noise
    const noise = (Math.random() * 2 - 1) * this.simulationParams.noiseLevel;
    value += noise;
    
    // Ensure value stays within normal range
    if (value < this.normalMin) value = this.normalMin;
    if (value > this.normalMax) value = this.normalMax;
    
    return value;
  }

  /**
   * Override anomaly injection for pressure-specific anomalies
   * 
   * @param {number} value - Original pressure value
   * @returns {number} Pressure with anomaly
   */
  injectAnomaly(value) {
    // For pressure, usually concerning is very high pressure (risk of rupture)
    // but very low pressure can also indicate leaks
    if (Math.random() > 0.3) { // 70% chance of high pressure anomaly
      // High pressure spike
      return random.randomInRange(this.normalMax, this.alertMax || (this.normalMax * 1.3));
    } else {
      // Low pressure drop (possible leak)
      return random.randomInRange(this.alertMin || (this.normalMin * 0.7), this.normalMin);
    }
  }
}

module.exports = PressureSimulator;
