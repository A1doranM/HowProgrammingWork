/**
 * Configuration settings for the API Gateway
 */
const config = {
  service: {
    name: 'api-gateway',
    port: process.env.API_GATEWAY_PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
  },
  services: {
    dataIngestion: {
      host: process.env.DATA_INGESTION_HOST || 'data-ingestion',
      port: process.env.DATA_INGESTION_PORT || 3002,
      protocol: process.env.DATA_INGESTION_PROTOCOL || 'http',
    },
    websocket: {
      host: process.env.WEBSOCKET_HOST || 'websocket-service',
      port: process.env.WEBSOCKET_PORT || 3003,
      protocol: process.env.WEBSOCKET_PROTOCOL || 'http',
    },
    alertService: {
      host: process.env.ALERT_SERVICE_HOST || 'alert-service',
      port: process.env.ALERT_SERVICE_PORT || 3004,
      protocol: process.env.ALERT_SERVICE_PROTOCOL || 'http',
    },
    dataProcessing: {
      host: process.env.DATA_PROCESSING_HOST || 'data-processing',
      port: process.env.DATA_PROCESSING_PORT || 3005,
      protocol: process.env.DATA_PROCESSING_PROTOCOL || 'http',
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DB || 0,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;
