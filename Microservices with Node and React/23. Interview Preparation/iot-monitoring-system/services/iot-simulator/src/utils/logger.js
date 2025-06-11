const pino = require('pino');
const config = require('../config');

// Configure logger based on environment
const logger = pino({
  name: config.service.name,
  level: config.service.logLevel,
  transport: config.service.nodeEnv === 'development' 
    ? { target: 'pino-pretty' } 
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
