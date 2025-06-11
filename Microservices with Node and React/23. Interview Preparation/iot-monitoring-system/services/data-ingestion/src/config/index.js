/**
 * Configuration for the Data Ingestion Service
 * Loads environment variables and provides configuration objects
 */

// Load environment variables from .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
  // Service Configuration
  service: {
    name: 'data-ingestion',
    port: parseInt(process.env.DATA_INGESTION_PORT || '3002', 10),
    environment: process.env.NODE_ENV || 'development',
  },

  // Kafka Configuration
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'data-ingestion',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    topic: process.env.KAFKA_TOPIC_SENSORS || 'sensors-data',
    groupId: process.env.KAFKA_GROUP_ID || 'data-ingestion-group',
    sessionTimeout: parseInt(process.env.KAFKA_SESSION_TIMEOUT || '30000', 10),
    heartbeatInterval: parseInt(process.env.KAFKA_HEARTBEAT_INTERVAL || '3000', 10),
    maxBatchSize: parseInt(process.env.KAFKA_MAX_BATCH_SIZE || '100', 10),
    maxWaitTimeMs: parseInt(process.env.KAFKA_MAX_WAIT_TIME_MS || '1000', 10),
  },

  // PostgreSQL Configuration
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'iot_monitoring',
    user: process.env.POSTGRES_USER || 'iot_user',
    password: process.env.POSTGRES_PASSWORD || 'iot_password',
    ssl: process.env.POSTGRES_SSL === 'true',
    max: parseInt(process.env.POSTGRES_POOL_MAX || '10', 10),
    idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '2000', 10),
    batchSize: parseInt(process.env.POSTGRES_BATCH_SIZE || '100', 10),
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'iot:',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // Default TTL in seconds
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.LOG_PRETTY === 'true',
  },

  // Validation and Processing
  processing: {
    validateSchema: process.env.VALIDATE_SCHEMA === 'true',
    storeBadMessages: process.env.STORE_BAD_MESSAGES === 'true',
    badMessagesTopic: process.env.BAD_MESSAGES_TOPIC || 'bad-messages',
  }
};

module.exports = config;
