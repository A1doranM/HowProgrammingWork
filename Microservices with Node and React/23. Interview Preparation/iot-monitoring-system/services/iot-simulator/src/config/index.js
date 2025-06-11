const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file if present
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const config = {
  // Service configuration
  service: {
    name: 'iot-simulator',
    port: parseInt(process.env.IOT_SIMULATOR_PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    anomalyProbability: parseFloat(process.env.ANOMALY_PROBABILITY || '0.05'), // 5% chance
  },
  
  // Kafka configuration
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'iot-simulator',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    sensorsTopic: process.env.KAFKA_TOPIC_SENSORS || 'sensors-data',
    maxRetries: parseInt(process.env.KAFKA_MAX_RETRIES || '5', 10),
    retryInterval: parseInt(process.env.KAFKA_RETRY_INTERVAL || '500', 10),
    batchSize: parseInt(process.env.KAFKA_BATCH_SIZE || '100', 10),
  },

  // Health check configuration
  health: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10), // 30 seconds
  }
};

module.exports = config;
