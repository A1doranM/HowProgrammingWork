/**
 * Logger utility for the Data Ingestion Service
 * Provides a structured logging with Pino
 */

const pino = require('pino');
const config = require('../config');

// Configure logger options
const loggerOptions = {
  level: config.logging.level,
  formatters: {
    level: (label) => {
      return { level: label };
    },
    bindings: () => {
      return {
        service: config.service.name,
        environment: config.service.environment
      };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
};

// Add pretty printing in development
if (config.logging.prettyPrint && config.service.environment !== 'production') {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  };
}

// Create the logger instance
const logger = pino(loggerOptions);

// Log application start with configuration details (excluding sensitive info)
logger.info({
  msg: 'Logger initialized',
  config: {
    service: config.service,
    kafka: {
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      topic: config.kafka.topic,
      groupId: config.kafka.groupId
    },
    postgres: {
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      // Exclude password
    },
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.db,
      // Exclude password
    }
  }
});

module.exports = logger;
