const { Kafka } = require('kafkajs');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Kafka Producer Service
 * Handles the connection to Kafka and sending of messages
 */
class KafkaProducerService {
  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: config.kafka.maxRetries
      }
    });
    
    this.producer = this.kafka.producer();
    this.connected = false;
    this.messageBuffer = [];
    this.flushInterval = null;
    
    // Stats
    this.stats = {
      messagesSent: 0,
      messageErrors: 0,
      batchesSent: 0,
      reconnectAttempts: 0,
      lastSentTimestamp: null
    };
    
    // Bind methods to ensure correct 'this' context
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.flushMessages = this.flushMessages.bind(this);
  }

  /**
   * Connect to Kafka broker
   */
  async connect() {
    try {
      await this.producer.connect();
      this.connected = true;
      
      // Set up message batching
      this.flushInterval = setInterval(
        this.flushMessages, 
        config.kafka.retryInterval
      );
      
      logger.info('Connected to Kafka');
      return true;
    } catch (error) {
      this.connected = false;
      this.stats.reconnectAttempts++;
      
      logger.error({
        error: error.message,
        stack: error.stack,
        attempt: this.stats.reconnectAttempts
      }, 'Failed to connect to Kafka');
      
      return false;
    }
  }

  /**
   * Disconnect from Kafka broker
   */
  async disconnect() {
    try {
      // Clear flush interval
      if (this.flushInterval) {
        clearInterval(this.flushInterval);
        this.flushInterval = null;
      }
      
      // Flush any remaining messages
      await this.flushMessages();
      
      // Disconnect producer
      await this.producer.disconnect();
      this.connected = false;
      
      logger.info({ stats: this.stats }, 'Disconnected from Kafka');
      return true;
    } catch (error) {
      logger.error({
        error: error.message,
        stack: error.stack
      }, 'Error disconnecting from Kafka');
      
      return false;
    }
  }

  /**
   * Send a message to Kafka
   * 
   * @param {Object} message - The message to send
   * @returns {boolean} Success status
   */
  sendMessage(message) {
    // Add message to buffer
    this.messageBuffer.push({
      key: message.deviceId,
      value: JSON.stringify(message),
      timestamp: new Date().getTime()
    });
    
    // If buffer reaches batch size, flush immediately
    if (this.messageBuffer.length >= config.kafka.batchSize) {
      // Schedule flush for next tick to not block current execution
      setImmediate(() => this.flushMessages());
    }
    
    return true;
  }

  /**
   * Flush buffered messages to Kafka
   */
  async flushMessages() {
    // Skip if no messages or not connected
    if (this.messageBuffer.length === 0 || !this.connected) {
      return;
    }
    
    // Get messages to send and clear buffer
    const messagesToSend = [...this.messageBuffer];
    this.messageBuffer = [];
    
    try {
      // Send messages to Kafka
      await this.producer.send({
        topic: config.kafka.sensorsTopic,
        messages: messagesToSend
      });
      
      // Update stats
      this.stats.messagesSent += messagesToSend.length;
      this.stats.batchesSent++;
      this.stats.lastSentTimestamp = new Date();
      
      logger.debug({
        count: messagesToSend.length,
        topic: config.kafka.sensorsTopic
      }, 'Sent messages to Kafka');
      
      return true;
    } catch (error) {
      // Put messages back in buffer (at the beginning)
      this.messageBuffer = [...messagesToSend, ...this.messageBuffer];
      this.stats.messageErrors++;
      
      logger.error({
        error: error.message,
        stack: error.stack,
        count: messagesToSend.length
      }, 'Failed to send messages to Kafka');
      
      // If not connected, try to reconnect
      if (!this.connected) {
        this.connect().catch(err => {
          logger.error({
            error: err.message
          }, 'Failed to reconnect to Kafka');
        });
      }
      
      return false;
    }
  }

  /**
   * Get the producer's current statistics
   * 
   * @returns {Object} Producer statistics
   */
  getStats() {
    return {
      ...this.stats,
      bufferSize: this.messageBuffer.length,
      connected: this.connected
    };
  }
}

// Export a singleton instance
const producerService = new KafkaProducerService();
module.exports = producerService;
