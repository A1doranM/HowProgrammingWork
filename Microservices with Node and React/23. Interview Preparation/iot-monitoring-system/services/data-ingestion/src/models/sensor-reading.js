/**
 * Sensor Reading Model and Schema Validation
 * Provides schema validation for incoming sensor data
 */

const Joi = require('joi');

// Define schema for sensor readings
const sensorReadingSchema = Joi.object({
  // Required fields
  deviceId: Joi.string().required().max(50),
  timestamp: Joi.date().iso().required(),
  sensorType: Joi.string().required().max(50),
  value: Joi.number().required(),
  unit: Joi.string().required().max(20),
  
  // Optional fields
  location: Joi.string().max(100),
  status: Joi.string().max(20).default('active'),
  
  // Allow any additional properties in the message
}).unknown(true);

/**
 * Validates a sensor reading against the schema
 * @param {Object} reading - The sensor reading to validate
 * @returns {Object} - Validation result with error or value
 */
function validateSensorReading(reading) {
  return sensorReadingSchema.validate(reading);
}

/**
 * Prepares a sensor reading for database insertion
 * @param {Object} reading - The validated sensor reading
 * @returns {Object} - Prepared object for database insertion
 */
function prepareSensorReadingForDB(reading) {
  // Ensure all required fields are present
  return {
    device_id: reading.deviceId,
    timestamp: reading.timestamp,
    sensor_type: reading.sensorType,
    value: reading.value,
    unit: reading.unit,
    location: reading.location || null,
    status: reading.status || 'active',
    created_at: new Date()
  };
}

/**
 * Prepares a sensor reading for Redis caching
 * @param {Object} reading - The validated sensor reading
 * @returns {Object} - Prepared object for Redis caching
 */
function prepareSensorReadingForCache(reading) {
  return {
    deviceId: reading.deviceId,
    timestamp: reading.timestamp,
    sensorType: reading.sensorType,
    value: reading.value,
    unit: reading.unit,
    location: reading.location || null,
    status: reading.status || 'active'
  };
}

module.exports = {
  validateSensorReading,
  prepareSensorReadingForDB,
  prepareSensorReadingForCache,
  sensorReadingSchema
};
