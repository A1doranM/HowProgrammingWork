const { Kafka } = require('kafkajs');
const config = require('../config');
const logger = require('../utils/logger');

class KafkaProducer {
  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: config.kafka.producer.maxInFlightRequests,
      idempotent: config.kafka.producer.idempotent,
      transactionTimeout: config.kafka.producer.transactionTimeout,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    this.isConnected = false;
    this.messagesSent = 0;
    this.messagesErrors = 0;
  }

  async connect() {
    try {
      await this.producer.connect();
      this.isConnected = true;
      logger.info('Kafka producer connected successfully');

      // Set up event handlers
      this.producer.on('producer.connect', () => {
        logger.info('Kafka producer connected');
        this.isConnected = true;
      });

      this.producer.on('producer.disconnect', () => {
        logger.info('Kafka producer disconnected');
        this.isConnected = false;
      });

      return true;
    } catch (error) {
      logger.error('Failed to connect Kafka producer:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await this.producer.disconnect();
        this.isConnected = false;
        logger.info('Kafka producer disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting Kafka producer:', error);
      throw error;
    }
  }

  async sendAlert(alert) {
    try {
      if (!this.isConnected) {
        throw new Error('Producer is not connected');
      }

      const message = {
        key: alert.deviceId,
        value: JSON.stringify({
          ...alert,
          sentAt: new Date().toISOString()
        }),
        headers: {
          eventType: alert.eventType || 'alert-event',
          deviceId: alert.deviceId,
          alertId: alert.id,
          severity: alert.severity
        }
      };

      const result = await this.producer.send({
        topic: config.kafka.topics.alerts,
        messages: [message]
      });

      this.messagesSent++;
      
      logger.info('Alert sent to Kafka', {
        alertId: alert.id,
        deviceId: alert.deviceId,
        topic: config.kafka.topics.alerts,
        partition: result[0].partition,
        offset: result[0].baseOffset
      });

      return result;
    } catch (error) {
      this.messagesErrors++;
      logger.error('Failed to send alert to Kafka:', {
        error: error.message,
        alertId: alert.id,
        deviceId: alert.deviceId
      });
      throw error;
    }
  }

  async sendAlertBatch(alerts) {
    try {
      if (!this.isConnected) {
        throw new Error('Producer is not connected');
      }

      if (!Array.isArray(alerts) || alerts.length === 0) {
        return [];
      }

      const messages = alerts.map(alert => ({
        key: alert.deviceId,
        value: JSON.stringify({
          ...alert,
          sentAt: new Date().toISOString()
        }),
        headers: {
          eventType: alert.eventType || 'alert-event',
          deviceId: alert.deviceId,
          alertId: alert.id,
          severity: alert.severity
        }
      }));

      const result = await this.producer.send({
        topic: config.kafka.topics.alerts,
        messages
      });

      this.messagesSent += alerts.length;

      logger.info(`Sent batch of ${alerts.length} alerts to Kafka`, {
        topic: config.kafka.topics.alerts,
        alertIds: alerts.map(a => a.id)
      });

      return result;
    } catch (error) {
      this.messagesErrors += alerts.length;
      logger.error('Failed to send alert batch to Kafka:', error);
      throw error;
    }
  }

  async sendAlertTriggered(alert) {
    const alertEvent = {
      ...alert,
      eventType: 'alert-triggered',
      timestamp: new Date().toISOString()
    };

    return await this.sendAlert(alertEvent);
  }

  async sendAlertResolved(alert) {
    const alertEvent = {
      ...alert,
      eventType: 'alert-resolved',
      timestamp: new Date().toISOString()
    };

    return await this.sendAlert(alertEvent);
  }

  async sendAlertAcknowledged(alert) {
    const alertEvent = {
      ...alert,
      eventType: 'alert-acknowledged',
      timestamp: new Date().toISOString()
    };

    return await this.sendAlert(alertEvent);
  }

  async sendAlertEscalated(alert) {
    const alertEvent = {
      ...alert,
      eventType: 'alert-escalated',
      severity: this.escalateSeverity(alert.severity),
      escalatedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    return await this.sendAlert(alertEvent);
  }

  escalateSeverity(currentSeverity) {
    const severityLevels = ['low', 'medium', 'high', 'critical'];
    const currentIndex = severityLevels.indexOf(currentSeverity);
    
    if (currentIndex === -1 || currentIndex === severityLevels.length - 1) {
      return 'critical';
    }
    
    return severityLevels[currentIndex + 1];
  }

  async sendMetrics(metrics) {
    try {
      if (!this.isConnected) {
        throw new Error('Producer is not connected');
      }

      const message = {
        key: 'alert-metrics',
        value: JSON.stringify({
          ...metrics,
          timestamp: new Date().toISOString(),
          service: 'alert-processing'
        }),
        headers: {
          eventType: 'metrics',
          service: 'alert-processing'
        }
      };

      const result = await this.producer.send({
        topic: config.kafka.topics.metrics || 'metrics',
        messages: [message]
      });

      logger.debug('Metrics sent to Kafka', {
        topic: config.kafka.topics.metrics || 'metrics'
      });

      return result;
    } catch (error) {
      logger.error('Failed to send metrics to Kafka:', error);
      throw error;
    }
  }

  async flush() {
    try {
      if (this.isConnected) {
        await this.producer.transaction();
        logger.debug('Producer flushed successfully');
      }
    } catch (error) {
      logger.error('Failed to flush producer:', error);
      throw error;
    }
  }

  isHealthy() {
    return this.isConnected;
  }

  getMetrics() {
    return {
      isConnected: this.isConnected,
      messagesSent: this.messagesSent,
      messagesErrors: this.messagesErrors,
      successRate: this.messagesSent > 0 ? 
        ((this.messagesSent - this.messagesErrors) / this.messagesSent * 100).toFixed(2) + '%' : 
        '0%'
    };
  }

  resetMetrics() {
    this.messagesSent = 0;
    this.messagesErrors = 0;
  }
}

module.exports = KafkaProducer;
