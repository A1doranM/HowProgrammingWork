/**
 * IoT Device configurations for the simulator
 * These match the devices created in the PostgreSQL database
 */

const devices = [
  // Temperature Sensor
  {
    deviceId: 'device-001',
    type: 'temperature',
    location: 'assembly-line-1',
    normalMin: 20.0,
    normalMax: 80.0,
    alertMin: 15.0,
    alertMax: 85.0,
    unit: 'celsius',
    updateFrequencySeconds: 2,
    description: 'Temperature sensor monitoring ambient temperature on assembly line 1',
    // Special parameters for simulation
    simulationParams: {
      baseValue: 60.0,       // Base temperature
      amplitude: 15.0,       // Max deviation from base in a cycle
      cyclePeriod: 86400,    // 24 hours in seconds (daily cycle)
      noiseLevel: 2.0        // Random noise level
    }
  },
  
  // Pressure Sensor
  {
    deviceId: 'device-002',
    type: 'pressure',
    location: 'hydraulic-system-A',
    normalMin: 10.0,
    normalMax: 50.0,
    alertMin: 5.0,
    alertMax: 55.0,
    unit: 'psi',
    updateFrequencySeconds: 3,
    description: 'Pressure sensor monitoring hydraulic system pressure levels',
    // Special parameters for simulation
    simulationParams: {
      baseValue: 35.0,       // Base pressure
      spikeFrequency: 0.02,  // Probability of pressure spike per reading
      spikeIntensity: 12.0,  // Max intensity of pressure spike
      noiseLevel: 1.5        // Random noise level
    }
  },
  
  // Vibration Sensor
  {
    deviceId: 'device-003',
    type: 'vibration',
    location: 'motor-unit-3',
    normalMin: 0.0,
    normalMax: 100.0,
    alertMin: null,
    alertMax: 120.0,
    unit: 'hz',
    updateFrequencySeconds: 1,
    description: 'Vibration sensor monitoring motor unit for early failure detection',
    // Special parameters for simulation
    simulationParams: {
      baseValue: 50.0,       // Base vibration level
      randomWalkFactor: 0.3, // Random walk intensity
      burstFrequency: 0.01,  // Probability of vibration burst per reading
      burstIntensity: 35.0,  // Max intensity of vibration burst
      noiseLevel: 5.0        // Random noise level
    }
  },
  
  // Production Counter
  {
    deviceId: 'device-004',
    type: 'production',
    location: 'output-conveyor',
    normalMin: 100.0,
    normalMax: 500.0,
    alertMin: 50.0,
    alertMax: null,
    unit: 'units/hour',
    updateFrequencySeconds: 5,
    description: 'Production counter tracking units per hour on output conveyor',
    // Special parameters for simulation
    simulationParams: {
      workingHoursStart: 8,  // 8 AM
      workingHoursEnd: 20,   // 8 PM
      peakValue: 400.0,      // Peak production rate
      minValue: 80.0,        // Minimum production rate
      rampUpTimeMinutes: 30, // Time to reach peak from min
      noiseLevel: 15.0       // Random noise level
    }
  },
  
  // Quality Score Sensor
  {
    deviceId: 'device-005',
    type: 'quality',
    location: 'quality-control-station',
    normalMin: 85.0,
    normalMax: 100.0,
    alertMin: 80.0,
    alertMax: null,
    unit: 'percentage',
    updateFrequencySeconds: 4,
    description: 'Quality control sensor measuring product quality percentage',
    // Special parameters for simulation
    simulationParams: {
      baseValue: 94.0,       // Base quality score
      standardDeviation: 2.5, // For normal distribution
      dipFrequency: 0.03,    // Probability of quality dip per reading
      dipIntensity: 10.0,    // Max reduction during quality dip
      noiseLevel: 1.0        // Random noise level
    }
  }
];

module.exports = devices;
