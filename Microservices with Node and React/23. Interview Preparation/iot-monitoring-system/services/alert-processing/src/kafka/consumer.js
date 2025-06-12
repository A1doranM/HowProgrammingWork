const { Kafka } = require('kafkajs');
const config = require('../config');
const logger = require('../utils/logger');

class KafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.consumer = this.kafka.consumer({
      groupId: config.kafka.groupId,
      sessionTimeout: config.kafka.consumer.sessionTimeout,
      heartbeatInterval: config.kafka.consumer.heartbeatInterval,
      maxBytesPerPartition: config.kafka.consumer.maxBytesPerPartition,
      minBytes: config.kafka.consumer.minBytes,
      maxBytes: config.kafka.consumer.maxBytes,
      maxWaitTimeInMs: config.kafka.consumer.maxWaitTimeInMs,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.isConnected = false;
    this.messageHandler = null;
  }

  async connect() {
    try {
      await this.consumer.connect();
      this.isConnected = true;
      logger.info('Kafka consumer connected successfully');

      // Set up error handling
      this.consumer.on('consumer.crash', (event) => {
        logger.error('Kafka consumer crashed:', event.payload.error);
        this.isConnected = false;
      });

      this.consumer.on('consumer.disconnect', () => {
        logger.info('Kafka consumer disconnected');
        this.isConnected = false;
      });

      this.consumer.on('consumer.connect', () => {
        logger.info('Kafka consumer connected');
        this.isConnected = true;
      });

      return true;
    } catch (error) {
      logger.error('Failed to connect Kafka consumer:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await this.consumer.disconnect();
        this.isConnected = false;
        logger.info('Kafka consumer disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting Kafka consumer:', error);
      throw error;
    }
  }

  async subscribe(topics) {
    try {
      if (!Array.isArray(topics)) {
        topics = [topics];
      }

      for (const topic of topics) {
        await this.consumer.subscribe({ topic, fromBeginning: false });
        logger.info(`Subscribed to topic: ${topic}`);
      }

      return true;
    } catch (error) {
      logger.error('Failed to subscribe to topics:', error);
      throw error;
    }
  }

  async startConsuming(messageHandler) {
    try {
      if (!this.isConnected) {
        throw new Error('Consumer is not connected');
      }

      this.messageHandler = messageHandler;

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const startTime = Date.now();
            
            // Parse message
            const messageValue = message.value.toString();
            let parsedMessage;
            
            try {
              parsedMessage = JSON.parse(messageValue);
            } catch (parseError) {
              logger.error('Failed to parse message JSON:', parseError);
              return;
            }

            // Add metadata
            const messageWithMetadata = {
              ...parsedMessage,
              _metadata: {
                topic,
                partition,
                offset: message.offset,
                timestamp: message.timestamp,
                receivedAt: new Date().toISOString()
              }
            };

            // Process message
            await this.messageHandler(messageWithMetadata);

            // Log processing time
            const processingTime = Date.now() - startTime;
            logger.debug(`Message processed in ${processingTime}ms`, {
              topic,
              partition,
              offset: message.offset,
              deviceId: parsedMessage.deviceId
            });

          } catch (error) {
            logger.error('Error processing message:', {
              error: error.message,
              topic,
              partition,
              offset: message.offset,
              stack: error.stack
            });
            
            // Don't throw error to avoid consumer crash
            // In production, you might want to send to dead letter queue
          }
        }
      });

      logger.info('Kafka consumer started consuming messages');
      return true;
    } catch (error) {
      logger.error('Failed to start consuming messages:', error);
      throw error;
    }
  }

  async getConsumerGroup() {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const groups = await admin.listGroups();
      const consumerGroup = groups.groups.find(group => group.groupId === config.kafka.groupId);
      
      await admin.disconnect();
      return consumerGroup;
    } catch (error) {
      logger.error('Failed to get consumer group info:', error);
      throw error;
    }
  }

  async getConsumerOffsets() {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const offsets = await admin.fetchOffsets({
        groupId: config.kafka.groupId,
        topics: [config.kafka.topics.sensors]
      });
      
      await admin.disconnect();
      return offsets;
    } catch (error) {
      logger.error('Failed to get consumer offsets:', error);
      throw error;
    }
  }

  async commitOffsets(offsets) {
    try {
      await this.consumer.commitOffsets(offsets);
      logger.debug('Offsets committed successfully');
      return true;
    } catch (error) {
      logger.error('Failed to commit offsets:', error);
      throw error;
    }
  }

  async pause(topics) {
    try {
      if (!Array.isArray(topics)) {
        topics = [topics];
      }

      const topicPartitions = topics.map(topic => ({ topic }));
      await this.consumer.pause(topicPartitions);
      logger.info(`Paused consumption for topics: ${topics.join(', ')}`);
      return true;
    } catch (error) {
      logger.error('Failed to pause consumer:', error);
      throw error;
    }
  }

  async resume(topics) {
    try {
      if (!Array.isArray(topics)) {
        topics = [topics];
      }

      const topicPartitions = topics.map(topic => ({ topic }));
      await this.consumer.resume(topicPartitions);
      logger.info(`Resumed consumption for topics: ${topics.join(', ')}`);
      return true;
    } catch (error) {
      logger.error('Failed to resume consumer:', error);
      throw error;
    }
  }

  isHealthy() {
    return this.isConnected;
  }

  getMetrics() {
    return {
      isConnected: this.isConnected,
      groupId: config.kafka.groupId,
      topics: [config.kafka.topics.sensors],
      hasMessageHandler: !!this.messageHandler
    };
  }
}

module.exports = KafkaConsumer;
