/**
 * Redis Cache Client
 * Manages Redis connection and provides caching methods
 */

const { createClient } = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

// Create Redis client
const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
  password: config.redis.password,
  database: config.redis.db
});

// Connection event handlers
redisClient.on('connect', () => {
  logger.info('Redis client connecting');
});

redisClient.on('ready', () => {
  logger.info('Redis client connected and ready');
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis client error');
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis client reconnecting');
});

redisClient.on('end', () => {
  logger.info('Redis client connection closed');
});

/**
 * Initialize Redis client connection
 * @returns {Promise<void>}
 */
async function initialize() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

/**
 * Close Redis client connection
 * @returns {Promise<void>}
 */
async function close() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}

/**
 * Store a sensor reading in Redis
 * @param {Object} reading - Sensor reading object
 * @param {number} ttl - Time-to-live in seconds (optional)
 * @returns {Promise<boolean>} - Success indicator
 */
async function storeSensorReading(reading, ttl = config.redis.ttl) {
  try {
    // Key structure: iot:device:{deviceId}:latest:{sensorType}
    const key = `${config.redis.keyPrefix}device:${reading.deviceId}:latest:${reading.sensorType}`;
    
    // Store as JSON string
    await redisClient.set(key, JSON.stringify(reading));
    
    // Set expiration
    if (ttl > 0) {
      await redisClient.expire(key, ttl);
    }
    
    // Also store in a sorted set with timestamp as score for time-series access
    const timeSeriesKey = `${config.redis.keyPrefix}device:${reading.deviceId}:timeseries:${reading.sensorType}`;
    const score = new Date(reading.timestamp).getTime();
    
    await redisClient.zAdd(timeSeriesKey, { score, value: JSON.stringify(reading) });
    
    // Trim the sorted set to keep only most recent readings (e.g., last 100)
    await redisClient.zRemRangeByRank(timeSeriesKey, 0, -101);
    
    // Set expiration on the sorted set
    if (ttl > 0) {
      await redisClient.expire(timeSeriesKey, ttl);
    }
    
    logger.debug(`Cached sensor reading for device ${reading.deviceId}, sensor ${reading.sensorType}`);
    return true;
  } catch (err) {
    logger.error({ err, reading }, 'Failed to cache sensor reading');
    return false;
  }
}

/**
 * Get the latest sensor reading for a specific device and sensor type
 * @param {string} deviceId - Device ID
 * @param {string} sensorType - Sensor type
 * @returns {Promise<Object|null>} - Sensor reading or null if not found
 */
async function getLatestSensorReading(deviceId, sensorType) {
  try {
    const key = `${config.redis.keyPrefix}device:${deviceId}:latest:${sensorType}`;
    const data = await redisClient.get(key);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data);
  } catch (err) {
    logger.error({ err, deviceId, sensorType }, 'Failed to get cached sensor reading');
    return null;
  }
}

/**
 * Get all latest sensor readings for a device
 * @param {string} deviceId - Device ID
 * @returns {Promise<Object>} - Map of sensor type to latest reading
 */
async function getAllLatestReadingsForDevice(deviceId) {
  try {
    const pattern = `${config.redis.keyPrefix}device:${deviceId}:latest:*`;
    const keys = await redisClient.keys(pattern);
    
    if (!keys.length) {
      return {};
    }
    
    const readings = {};
    
    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        const sensorType = key.split(':').pop();
        readings[sensorType] = JSON.parse(data);
      }
    }
    
    return readings;
  } catch (err) {
    logger.error({ err, deviceId }, 'Failed to get all cached sensor readings for device');
    return {};
  }
}

/**
 * Get time-series readings for a device and sensor type
 * @param {string} deviceId - Device ID
 * @param {string} sensorType - Sensor type
 * @param {number} limit - Maximum number of readings to return
 * @returns {Promise<Array<Object>>} - Array of sensor readings
 */
async function getTimeSeriesReadings(deviceId, sensorType, limit = 50) {
  try {
    const key = `${config.redis.keyPrefix}device:${deviceId}:timeseries:${sensorType}`;
    
    // Get the most recent readings (highest scores) with limit
    const results = await redisClient.zRange(key, 0, limit - 1, { REV: true });
    
    return results.map(data => JSON.parse(data));
  } catch (err) {
    logger.error({ err, deviceId, sensorType }, 'Failed to get time-series readings');
    return [];
  }
}

module.exports = {
  initialize,
  close,
  storeSensorReading,
  getLatestSensorReading,
  getAllLatestReadingsForDevice,
  getTimeSeriesReadings,
  client: redisClient
};
