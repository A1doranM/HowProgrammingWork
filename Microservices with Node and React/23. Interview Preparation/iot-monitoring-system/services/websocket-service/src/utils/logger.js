/**
 * Logger utility using Pino
 */
const pino = require('pino');
const config = require('../config');

// Create a logger instance with the configured settings
const logger = pino({
  name: config.service.name,
  level: config.logging.level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  base: {
    service: config.service.name,
    environment: config.service.environment,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

logger.info('Logger initialized', { config });

module.exports = logger;
