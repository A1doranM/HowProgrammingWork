/**
 * Redis client implementation for the WebSocket Service
 */
const { createClient } = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

// Create Redis client
const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
});

// Handle Redis events
redisClient.on('connect', () => {
  logger.info('Connected to Redis server');
});

redisClient.on('error', (err) => {
  logger.error(`Redis client error: ${err.message}`, { error: err });
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis client reconnecting');
});

/**
 * Initialize Redis client
 */
async function initRedis() {
  try {
    await redisClient.connect();
    logger.info('Redis client initialized');
    return redisClient;
  } catch (error) {
    logger.error(`Failed to initialize Redis client: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Subscribe to Redis channel
 * @param {string} channel - The channel to subscribe to
 * @param {Function} callback - Callback function to handle messages
 */
async function subscribeToChannel(channel, callback) {
  try {
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(channel, (message) => {
      logger.debug(`Received message from Redis channel '${channel}'`, { message });
      try {
        const parsedMessage = JSON.parse(message);
        callback(parsedMessage);
      } catch (error) {
        logger.error(`Error parsing message from Redis: ${error.message}`, { error, message });
      }
    });
    
    logger.info(`Subscribed to Redis channel: ${channel}`);
    return subscriber;
  } catch (error) {
    logger.error(`Failed to subscribe to Redis channel '${channel}': ${error.message}`, { error });
    throw error;
  }
}

/**
 * Publish message to Redis channel
 * @param {string} channel - The channel to publish to
 * @param {Object} message - The message to publish
 */
async function publishToChannel(channel, message) {
  try {
    const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
    await redisClient.publish(channel, stringMessage);
    logger.debug(`Published message to Redis channel '${channel}'`, { message });
  } catch (error) {
    logger.error(`Failed to publish to Redis channel '${channel}': ${error.message}`, { error });
    throw error;
  }
}

module.exports = {
  initRedis,
  redisClient,
  subscribeToChannel,
  publishToChannel,
};
