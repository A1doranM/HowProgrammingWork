const BaseSimulator = require('./base-simulator');
const random = require('../utils/random');

/**
 * Quality Simulator
 * Generates quality score readings using a normal distribution
 * with occasional quality dips.
 */
class QualitySimulator extends BaseSimulator {
  constructor(deviceConfig, sendCallback) {
    super(deviceConfig, sendCallback);
    
    // Initialize with base value
    this.lastValue = this.simulationParams.baseValue;
    
    // Track quality dip state
    this.inQualityDip = false;
    this.dipProgress = 0;
    this.dipDuration = 0;
    this.dipIntensity = 0;
  }

  /**
   * Generates a quality score reading based on:
   * 1. Normal distribution around base quality
   * 2. Occasional quality dips
   * 
   * @returns {number} Generated quality value
   */
  generateReading() {
    // Check if we should start a new quality dip
    if (!this.inQualityDip && random.shouldOccur(this.simulationParams.dipFrequency)) {
      this.inQualityDip = true;
      this.dipProgress = 0;
      // Random dip duration between 3-7 readings
      this.dipDuration = Math.floor(random.randomInRange(3, 7));
      // Random dip intensity
      this.dipIntensity = random.randomInRange(
        this.simulationParams.dipIntensity * 0.3,
        this.simulationParams.dipIntensity
      );
    }
    
    // Generate base value from normal distribution
    let value = random.randomNormal(
      this.simulationParams.baseValue,
      this.simulationParams.standardDeviation
    );
    
    // Apply quality dip if active
    if (this.inQualityDip) {
      // Calculate dip intensity based on progress (quick drop, gradual recovery)
      let dipFactor;
      const normalizedProgress = this.dipProgress / this.dipDuration;
      
      if (normalizedProgress < 0.3) {
        // Quick drop phase
        dipFactor = normalizedProgress / 0.3;
      } else {
        // Gradual recovery phase
        dipFactor = 1.0 - ((normalizedProgress - 0.3) / 0.7);
      }
      
      // Apply dip to base value
      value -= this.dipIntensity * dipFactor;
      
      // Update dip progress
      this.dipProgress++;
      if (this.dipProgress >= this.dipDuration) {
        this.inQualityDip = false;
      }
    }
    
    // Add minimal random noise
    const noise = (Math.random() * 2 - 1) * this.simulationParams.noiseLevel;
    value += noise;
    
    // Ensure value stays within allowed range (0-100% for percentage)
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    
    return value;
  }

  /**
   * Override anomaly injection for quality-specific anomalies
   * 
   * @param {number} value - Original quality value
   * @returns {number} Quality with anomaly
   */
  injectAnomaly(value) {
    // For quality, low values are concerning (potential product issues)
    // Generate a significant quality drop below normal minimum
    if (this.alertMin !== null) {
      return random.randomInRange(0, this.alertMin);
    } else {
      // Significant drop (60-80% of normal min)
      return this.normalMin * random.randomInRange(0.6, 0.8);
    }
  }
  
  /**
   * Override the reading formatting to include quality grade
   */
  formatReading(value, isAnomaly = false) {
    const reading = super.formatReading(value, isAnomaly);
    
    // Determine quality grade
    let grade;
    
    if (value >= 95) {
      grade = 'A+';
    } else if (value >= 90) {
      grade = 'A';
    } else if (value >= 85) {
      grade = 'B';
    } else if (value >= 80) {
      grade = 'C';
    } else if (value >= 70) {
      grade = 'D';
    } else {
      grade = 'F';
    }
    
    // Add to the reading
    return {
      ...reading,
      grade
    };
  }
}

module.exports = QualitySimulator;
