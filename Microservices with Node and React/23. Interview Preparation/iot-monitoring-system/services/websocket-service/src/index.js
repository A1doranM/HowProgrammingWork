/**
 * WebSocket Service - Entry Point
 * 
 * This service provides real-time updates to clients via WebSockets.
 * It consumes messages from Kafka and Redis, and broadcasts them to connected clients.
 */
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const promBundle = require('express-prom-bundle');

const config = require('./config');
const logger = require('./utils/logger');
const socketIO = require('./socket/io');
const redisClient = require('./redis/client');
const kafkaConsumer = require('./kafka/consumer');

// Create Express app
const app = express();
const PORT = config.service.port;

// Configure middleware
app.use(cors(config.cors));
app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

// Prometheus metrics
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { service: config.service.name },
});
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    service: config.service.name,
    uptime,
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers || 0
    },
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = http.createServer(app);

// Handle WebSocket communication
const io = socketIO.initSocketIO(server);

// Function to handle messages from Kafka or Redis
function handleMessage(topic, message) {
  logger.debug(`Handling message from topic: ${topic}`, { message });
  
  try {
    // Handle different message types based on the topic
    switch (topic) {
      case config.kafka.topics.sensorReadings:
        socketIO.broadcastSensorReading(message);
        break;
      case config.kafka.topics.deviceStatus:
        socketIO.broadcastDeviceStatus(message);
        break;
      case config.kafka.topics.alerts:
        socketIO.broadcastAlert(message);
        break;
      default:
        logger.warn(`Unknown topic: ${topic}`, { message });
    }
  } catch (error) {
    logger.error(`Error handling message: ${error.message}`, { error, topic, message });
  }
}

// Initialize connections and start server
async function initializeService() {
  try {
    // Initialize Redis client
    await redisClient.initRedis();
    
    // Subscribe to Redis channels
    const sensorReadingsSubscriber = await redisClient.subscribeToChannel(
      config.redis.channels.sensorReadings,
      (message) => handleMessage(config.kafka.topics.sensorReadings, message)
    );
    
    const deviceStatusSubscriber = await redisClient.subscribeToChannel(
      config.redis.channels.deviceStatus,
      (message) => handleMessage(config.kafka.topics.deviceStatus, message)
    );
    
    const alertsSubscriber = await redisClient.subscribeToChannel(
      config.redis.channels.alerts,
      (message) => handleMessage(config.kafka.topics.alerts, message)
    );
    
    // Initialize Kafka consumer
    await kafkaConsumer.initConsumer();
    
    // Subscribe to Kafka topics
    await kafkaConsumer.subscribeToTopics(
      [
        config.kafka.topics.sensorReadings,
        config.kafka.topics.deviceStatus,
        config.kafka.topics.alerts
      ],
      handleMessage
    );
    
    // Start the server
    server.listen(PORT, () => {
      logger.info(`${config.service.name} HTTP server listening on port ${PORT}`);
      logger.info(`Environment: ${config.service.environment}`);
      logger.info(`WebSocket server is ready for connections`);
    });
  } catch (error) {
    logger.error(`Failed to initialize service: ${error.message}`, { error });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Disconnect Kafka consumer
  await kafkaConsumer.disconnectConsumer();
  
  // Close Redis connections
  await redisClient.redisClient.disconnect();
  
  logger.info('Graceful shutdown completed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Disconnect Kafka consumer
  await kafkaConsumer.disconnectConsumer();
  
  // Close Redis connections
  await redisClient.redisClient.disconnect();
  
  logger.info('Graceful shutdown completed');
  process.exit(0);
});

// Start the service
initializeService();

module.exports = server; // Export for testing
