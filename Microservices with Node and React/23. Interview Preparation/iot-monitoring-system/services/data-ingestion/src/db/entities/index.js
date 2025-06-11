/**
 * Export all entity schemas for TypeORM
 */

const Device = require('./Device');
const SensorReading = require('./SensorReading');

module.exports = {
  Device,
  SensorReading
};
