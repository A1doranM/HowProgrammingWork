/**
 * Data Ingestion Service - Main Entry Point
 * Using TypeORM for database access
 */

const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');
const kafkaConsumer = require('./kafka/consumer');
const { closeDatabase } = require('./db/database');
const deviceRoutes = require('./routes/devices');
const sensorReadingRoutes = require('./routes/sensor-readings');

// Require reflect-metadata for TypeORM decorators
require('reflect-metadata');

// Create Express app for health checks and API endpoints
const app = express();

// Add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/health', (req, res) => {
  res.status(200).json({
    service: config.service.name,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req, res) => {
  // Return basic metrics
  res.status(200).json({
    service: config.service.name,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use(deviceRoutes);
app.use(sensorReadingRoutes);

// Initialize the service
async function initialize() {
  try {
    // Start the Kafka consumer (which will initialize TypeORM)
    await kafkaConsumer.initialize();
    
    // Start the Express server for health checks
    const server = app.listen(config.service.port, () => {
      logger.info(`${config.service.name} HTTP server listening on port ${config.service.port}`);
    });
    
    // Set up graceful shutdown
    setupGracefulShutdown(server);
    
    logger.info(`${config.service.name} service initialized successfully`);
  } catch (err) {
    logger.error({ err }, 'Failed to initialize service');
    process.exit(1);
  }
}

// Set up graceful shutdown
function setupGracefulShutdown(server) {
  // Handle various signals
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, starting graceful shutdown`);
      
      // First close the HTTP server
      server.close(() => {
        logger.info('HTTP server closed');
      });
      
      try {
        // Then shutdown the Kafka consumer
        await kafkaConsumer.shutdown();
        
        // Close the database connection
        await closeDatabase();
        
        logger.info('Service shutdown completed');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    });
  });
  
  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason }, 'Unhandled rejection');
    process.exit(1);
  });
}

// Start the service
initialize();
