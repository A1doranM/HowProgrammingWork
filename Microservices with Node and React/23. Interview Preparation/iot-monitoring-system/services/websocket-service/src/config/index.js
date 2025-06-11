/**
 * Configuration settings for the WebSocket Service
 */
const config = {
  service: {
    name: 'websocket-service',
    port: process.env.WEBSOCKET_PORT || 3003,
    environment: process.env.NODE_ENV || 'development',
  },
  kafka: {
    clientId: 'websocket-service',
    brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['kafka:9092'],
    groupId: 'websocket-consumer-group',
    topics: {
      sensorReadings: 'sensor-readings',
      deviceStatus: 'device-status',
      alerts: 'device-alerts'
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DB || 0,
    channels: {
      sensorReadings: 'sensor-readings',
      deviceStatus: 'device-status',
      alerts: 'device-alerts'
    }
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  socketIO: {
    path: '/socket.io',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  }
};

module.exports = config;
