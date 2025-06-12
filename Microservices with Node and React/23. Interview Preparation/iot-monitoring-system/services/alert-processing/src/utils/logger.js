const pino = require('pino');
const config = require('../config');

const logger = pino({
  level: config.logging.level,
  transport: config.logging.pretty ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname'
    }
  } : undefined,
  base: {
    service: 'alert-processing',
    version: '1.0.0'
  }
});

module.exports = logger;
