/**
 * Utility functions for generating random data with different patterns
 */

/**
 * Generates a random number within a range
 * 
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random number within the specified range
 */
function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Generates a random value from a normal distribution
 * Uses Box-Muller transform
 * 
 * @param {number} mean - Mean of the normal distribution
 * @param {number} stdDev - Standard deviation of the normal distribution
 * @returns {number} Random value from the normal distribution
 */
function randomNormal(mean, stdDev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stdDev;
}

/**
 * Generates a sine wave value at a given time
 * 
 * @param {number} time - Current time (in seconds)
 * @param {number} amplitude - Amplitude of the sine wave
 * @param {number} period - Period of the sine wave (in seconds)
 * @param {number} offset - Vertical offset of the sine wave
 * @returns {number} Value of the sine wave at the given time
 */
function sineWave(time, amplitude, period, offset) {
  return offset + amplitude * Math.sin((2 * Math.PI * time) / period);
}

/**
 * Performs a random walk from the given value
 * 
 * @param {number} currentValue - Current value
 * @param {number} factor - Random walk factor (intensity of change)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} New value after random walk
 */
function randomWalk(currentValue, factor, min, max) {
  // Generate random step in range [-factor, factor]
  const step = (Math.random() * 2 - 1) * factor;
  
  // Calculate new value
  let newValue = currentValue + step;
  
  // Ensure value stays within bounds
  if (newValue < min) newValue = min;
  if (newValue > max) newValue = max;
  
  return newValue;
}

/**
 * Determines if an event should occur based on a probability
 * 
 * @param {number} probability - Probability of the event (0-1)
 * @returns {boolean} Whether the event should occur
 */
function shouldOccur(probability) {
  return Math.random() < probability;
}

/**
 * Calculates the production level based on time of day
 * Follows a step function pattern with ramp-up/down periods
 * 
 * @param {Date} now - Current time
 * @param {number} startHour - Start hour of work (e.g., 8 for 8 AM)
 * @param {number} endHour - End hour of work (e.g., 20 for 8 PM)
 * @param {number} peak - Peak production value
 * @param {number} min - Minimum production value
 * @param {number} rampMinutes - Time to ramp up/down in minutes
 * @returns {number} Production level
 */
function productionByTime(now, startHour, endHour, peak, min, rampMinutes) {
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Convert to decimal hours
  const time = hour + minute / 60;
  
  // Outside working hours
  if (time < startHour || time > endHour) {
    return min;
  }
  
  // Ramp up period
  const rampHours = rampMinutes / 60;
  if (time < startHour + rampHours) {
    // Linear interpolation during ramp up
    const progress = (time - startHour) / rampHours;
    return min + progress * (peak - min);
  }
  
  // Ramp down period
  if (time > endHour - rampHours) {
    // Linear interpolation during ramp down
    const progress = (endHour - time) / rampHours;
    return min + progress * (peak - min);
  }
  
  // Peak production time
  return peak;
}

module.exports = {
  randomInRange,
  randomNormal,
  sineWave,
  randomWalk,
  shouldOccur,
  productionByTime
};
