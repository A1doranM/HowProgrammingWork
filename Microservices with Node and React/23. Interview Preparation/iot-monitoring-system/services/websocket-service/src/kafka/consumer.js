/**
 * Kafka consumer implementation for the WebSocket Service
 */
const { Kafka } = require('kafkajs');
const config = require('../config');
const logger = require('../utils/logger');

// Initialize Kafka client
const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

// Create consumer
const consumer = kafka.consumer({
  groupId: config.kafka.groupId,
});

/**
 * Initialize Kafka consumer
 */
async function initConsumer() {
  try {
    await consumer.connect();
    logger.info('Kafka consumer connected');
    return consumer;
  } catch (error) {
    logger.error(`Failed to connect Kafka consumer: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Subscribe to Kafka topics and handle messages
 * @param {Array<string>} topics - Array of topics to subscribe to
 * @param {Function} messageHandler - Callback function to handle messages
 */
async function subscribeToTopics(topics, messageHandler) {
  try {
    // Subscribe to each topic
    for (const topic of topics) {
      await consumer.subscribe({
        topic,
        fromBeginning: false,
      });
      logger.info(`Subscribed to Kafka topic: ${topic}`);
    }

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const key = message.key ? message.key.toString() : null;
          const value = message.value ? message.value.toString() : null;
          
          logger.debug(`Received message from Kafka topic '${topic}'`, { 
            key, 
            partition, 
            offset: message.offset 
          });
          
          if (value) {
            try {
              const parsedValue = JSON.parse(value);
              messageHandler(topic, parsedValue, key);
            } catch (parseError) {
              logger.error(`Error parsing message from Kafka: ${parseError.message}`, { 
                error: parseError, 
                value 
              });
              // Handle non-JSON messages
              messageHandler(topic, value, key);
            }
          }
        } catch (messageError) {
          logger.error(`Error processing Kafka message: ${messageError.message}`, { 
            error: messageError, 
            topic, 
            partition 
          });
        }
      },
    });
    
    logger.info('Kafka consumer is running');
  } catch (error) {
    logger.error(`Failed to subscribe to Kafka topics: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Disconnect Kafka consumer
 */
async function disconnectConsumer() {
  try {
    await consumer.disconnect();
    logger.info('Kafka consumer disconnected');
  } catch (error) {
    logger.error(`Error disconnecting Kafka consumer: ${error.message}`, { error });
  }
}

module.exports = {
  initConsumer,
  subscribeToTopics,
  disconnectConsumer,
  consumer,
};
