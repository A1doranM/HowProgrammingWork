const redis = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 attempts');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 50, 500);
          }
        },
        password: config.redis.password,
        database: config.redis.db
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting');
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
        this.isConnected = true;
      });

      await this.client.connect();
      logger.info('Redis client initialized successfully');
      
      return this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    }
  }

  getClient() {
    if (!this.isConnected || !this.client) {
      throw new Error('Redis client is not connected');
    }
    return this.client;
  }

  async ping() {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis ping failed:', error);
      return false;
    }
  }

  // Alert-specific Redis operations
  async setAlert(alertId, alertData, ttl = null) {
    try {
      const key = `alert:${alertId}`;
      await this.client.hSet(key, alertData);
      
      if (ttl) {
        await this.client.expire(key, ttl);
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to set alert in Redis:', error);
      throw error;
    }
  }

  async getAlert(alertId) {
    try {
      const key = `alert:${alertId}`;
      const alertData = await this.client.hGetAll(key);
      
      if (Object.keys(alertData).length === 0) {
        return null;
      }
      
      return alertData;
    } catch (error) {
      logger.error('Failed to get alert from Redis:', error);
      throw error;
    }
  }

  async addToActiveAlerts(alertId) {
    try {
      await this.client.sAdd('alerts:active', alertId);
      return true;
    } catch (error) {
      logger.error('Failed to add alert to active set:', error);
      throw error;
    }
  }

  async removeFromActiveAlerts(alertId) {
    try {
      await this.client.sRem('alerts:active', alertId);
      return true;
    } catch (error) {
      logger.error('Failed to remove alert from active set:', error);
      throw error;
    }
  }

  async getActiveAlerts() {
    try {
      return await this.client.sMembers('alerts:active');
    } catch (error) {
      logger.error('Failed to get active alerts:', error);
      throw error;
    }
  }

  async addDeviceAlert(deviceId, alertId) {
    try {
      await this.client.sAdd(`alerts:device:${deviceId}`, alertId);
      return true;
    } catch (error) {
      logger.error('Failed to add device alert:', error);
      throw error;
    }
  }

  async getDeviceAlerts(deviceId) {
    try {
      return await this.client.sMembers(`alerts:device:${deviceId}`);
    } catch (error) {
      logger.error('Failed to get device alerts:', error);
      throw error;
    }
  }

  async setDeduplicationKey(key, value, ttlSeconds) {
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Failed to set deduplication key:', error);
      throw error;
    }
  }

  async getDeduplicationKey(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Failed to get deduplication key:', error);
      throw error;
    }
  }

  async setEscalationTimer(alertId, ttlSeconds) {
    try {
      const key = `alert:escalation:${alertId}`;
      await this.client.setEx(key, ttlSeconds, 'pending');
      return true;
    } catch (error) {
      logger.error('Failed to set escalation timer:', error);
      throw error;
    }
  }

  async clearEscalationTimer(alertId) {
    try {
      const key = `alert:escalation:${alertId}`;
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Failed to clear escalation timer:', error);
      throw error;
    }
  }

  async updateAlertMetrics(deviceId, alertType) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const metricsKey = `metrics:alerts:${today}`;
      
      await this.client.hIncrBy(metricsKey, `total`, 1);
      await this.client.hIncrBy(metricsKey, `device:${deviceId}`, 1);
      await this.client.hIncrBy(metricsKey, `type:${alertType}`, 1);
      
      // Set expiration for metrics (keep for 30 days)
      await this.client.expire(metricsKey, 30 * 24 * 60 * 60);
      
      return true;
    } catch (error) {
      logger.error('Failed to update alert metrics:', error);
      throw error;
    }
  }
}

module.exports = RedisClient;
