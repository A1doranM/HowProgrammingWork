/**
 * Kafka Consumer for the Data Ingestion Service
 * Consumes sensor data messages and processes them using TypeORM
 */

const { Kafka } = require('kafkajs');
const config = require('../config');
const logger = require('../utils/logger');
const sensorReadingModel = require('../models/sensor-reading');
const redisClient = require('../db/redis');
const { initializeDatabase } = require('../db/database');
const { DeviceRepository, SensorReadingRepository } = require('../db/repositories');

// Create Kafka client
const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers
});

// Create consumer instance
const consumer = kafka.consumer({
  groupId: config.kafka.groupId,
  sessionTimeout: config.kafka.sessionTimeout,
  heartbeatInterval: config.kafka.heartbeatInterval
});

// Store readings in batches for better performance
let batchedReadings = [];
let batchTimer = null;
let deviceRepository = null;
let sensorReadingRepository = null;

/**
 * Process a single sensor reading
 * @param {Object} reading - Raw sensor reading from Kafka
 * @returns {Promise<boolean>} - Success status
 */
async function processSensorReading(reading) {
  try {
    // Parse message if it's a string
    const data = typeof reading === 'string' ? JSON.parse(reading) : reading;
    
    // Validate schema if enabled
    if (config.processing.validateSchema) {
      const { error, value } = sensorReadingModel.validateSensorReading(data);
      
      if (error) {
        logger.warn({
          error: error.details,
          data
        }, 'Invalid sensor reading schema');
        
        // Handle bad messages if configured
        if (config.processing.storeBadMessages) {
          // Implementation for storing bad messages (optional)
        }
        
        return false;
      }
      
      // Update data with validated and defaulted values
      Object.assign(data, value);
    }
    
    // Prepare for database insertion using TypeORM format
    const dbReading = {
      device_id: data.deviceId,
      timestamp: data.timestamp,
      sensor_type: data.sensorType,
      value: data.value,
      unit: data.unit,
      location: data.location || null,
      status: data.status || 'active',
      created_at: new Date()
    };
    
    // Add to batch for database insertion
    batchedReadings.push(dbReading);
    
    // Prepare for cache and store in Redis
    const cacheReading = sensorReadingModel.prepareSensorReadingForCache(data);
    await redisClient.storeSensorReading(cacheReading);
    
    // Ensure device exists in the database using TypeORM repository
    await deviceRepository.ensureDeviceExists(data.deviceId, {
      deviceType: data.sensorType,
      location: data.location,
      status: data.status
    });
    
    return true;
  } catch (err) {
    logger.error({ err, reading }, 'Failed to process sensor reading');
    return false;
  }
}

/**
 * Flush batched readings to database using TypeORM
 * @returns {Promise<void>}
 */
async function flushBatch() {
  if (batchedReadings.length === 0) {
    return;
  }
  
  const batchSize = batchedReadings.length;
  logger.info(`Flushing batch of ${batchSize} readings to database`);
  
  try {
    // Insert batch to database using TypeORM repository
    await sensorReadingRepository.batchInsertSensorReadings(batchedReadings);
    
    // Clear batch after successful insertion
    batchedReadings = [];
    
    logger.info(`Successfully inserted ${batchSize} readings into database`);
  } catch (err) {
    logger.error({ err }, `Failed to flush batch of ${batchSize} readings to database`);
    
    // On error, wait and retry with backoff strategy
    setTimeout(() => flushBatch(), 5000);
  }
}

/**
 * Setup batch processing with timer
 */
function setupBatchProcessing() {
  // Schedule regular batch flush
  batchTimer = setInterval(() => {
    if (batchedReadings.length > 0) {
      flushBatch();
    }
  }, config.kafka.maxWaitTimeMs);
  
  // Make sure timer doesn't prevent Node from exiting
  batchTimer.unref();
}

/**
 * Initialize the Kafka consumer and repositories
 * @returns {Promise<void>}
 */
async function initialize() {
  try {
    // Initialize database and repositories
    await initializeDatabase();
    
    // Create repositories
    deviceRepository = new DeviceRepository();
    sensorReadingRepository = new SensorReadingRepository();
    
    // Connect to Kafka
    logger.info('Connecting to Kafka broker');
    await consumer.connect();
    
    // Subscribe to topic
    logger.info(`Subscribing to topic: ${config.kafka.topic}`);
    await consumer.subscribe({
      topic: config.kafka.topic,
      fromBeginning: false
    });
    
    // Initialize Redis
    await redisClient.initialize();
    
    // Setup batch processing
    setupBatchProcessing();
    
    // Start consuming messages
    await consumer.run({
      partitionsConsumedConcurrently: 3,
      eachBatchAutoResolve: true,
      eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
        const { topic, partition, messages } = batch;
        
        logger.info(`Received batch: ${messages.length} messages from ${topic}-${partition}`);
        
        for (let i = 0; i < messages.length; i++) {
          // Check if consumer is still running and batch is not stale
          if (!isRunning() || isStale()) {
            break;
          }
          
          const message = messages[i];
          
          try {
            // Process message
            const value = message.value ? message.value.toString() : null;
            
            if (value) {
              await processSensorReading(value);
            }
            
            // Resolve offset after processing
            resolveOffset(message.offset);
            
            // Send heartbeat periodically to keep consumer alive
            if (i % 100 === 0) {
              await heartbeat();
            }
            
            // Check if batch size reached, then flush
            if (batchedReadings.length >= config.postgres.batchSize) {
              await flushBatch();
            }
          } catch (err) {
            logger.error({ err, messageOffset: message.offset }, 'Error processing message');
          }
        }
        
        // Flush any remaining items in batch
        if (batchedReadings.length > 0) {
          await flushBatch();
        }
      }
    });
    
    logger.info('Kafka consumer started successfully');
  } catch (err) {
    logger.error({ err }, 'Failed to initialize Kafka consumer');
    throw err;
  }
}

/**
 * Gracefully shut down the consumer
 * @returns {Promise<void>}
 */
async function shutdown() {
  try {
    // Clear batch timer
    if (batchTimer) {
      clearInterval(batchTimer);
    }
    
    // Flush any remaining readings
    if (batchedReadings.length > 0) {
      await flushBatch();
    }
    
    // Disconnect consumer
    logger.info('Disconnecting Kafka consumer');
    await consumer.disconnect();
    
    // Close Redis connection
    await redisClient.close();
    
    logger.info('Kafka consumer shut down successfully');
  } catch (err) {
    logger.error({ err }, 'Error during Kafka consumer shutdown');
    throw err;
  }
}

module.exports = {
  initialize,
  shutdown,
  processSensorReading, // Exported for testing
  consumer // Exported for testing
};
