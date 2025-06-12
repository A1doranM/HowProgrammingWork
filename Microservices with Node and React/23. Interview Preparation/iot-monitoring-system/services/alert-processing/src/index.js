require('dotenv').config();

const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');

// Import components
const RedisClient = require('./redis/client');
const KafkaConsumer = require('./kafka/consumer');
const KafkaProducer = require('./kafka/producer');
const AlertEngine = require('./alert/alertEngine');

// Import routes
const healthRoutes = require('./routes/health');

class AlertProcessingService {
  constructor() {
    this.app = express();
    this.server = null;
    this.redisClient = null;
    this.kafkaConsumer = null;
    this.kafkaProducer = null;
    this.alertEngine = null;
    this.isShuttingDown = false;
  }

  async initialize() {
    try {
      logger.info('Initializing Alert Processing Service...');

      // Set up Express middleware
      this.setupExpress();

      // Initialize Redis client
      await this.initializeRedis();

      // Initialize Kafka components
      await this.initializeKafka();

      // Initialize Alert Engine
      this.initializeAlertEngine();

      // Set up routes
      this.setupRoutes();

      // Start HTTP server
      await this.startServer();

      // Start Kafka consumer
      await this.startKafkaConsumer();

      logger.info('Alert Processing Service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize Alert Processing Service:', error);
      throw error;
    }
  }

  setupExpress() {
    // Middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('HTTP Request', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent')
        });
      });

      next();
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      logger.error('Express error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      });

      res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    });

    logger.debug('Express middleware configured');
  }

  async initializeRedis() {
    try {
      this.redisClient = new RedisClient();
      await this.redisClient.connect();
      
      // Test Redis connection
      const pingResult = await this.redisClient.ping();
      if (!pingResult) {
        throw new Error('Redis ping failed');
      }

      logger.info('Redis client initialized and connected');

    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      throw error;
    }
  }

  async initializeKafka() {
    try {
      // Initialize Kafka Producer
      this.kafkaProducer = new KafkaProducer();
      await this.kafkaProducer.connect();

      // Initialize Kafka Consumer
      this.kafkaConsumer = new KafkaConsumer();
      await this.kafkaConsumer.connect();
      await this.kafkaConsumer.subscribe(config.kafka.topics.sensors);

      logger.info('Kafka components initialized');

    } catch (error) {
      logger.error('Failed to initialize Kafka:', error);
      throw error;
    }
  }

  initializeAlertEngine() {
    try {
      this.alertEngine = new AlertEngine(
        config,
        this.redisClient,
        this.kafkaProducer
      );

      logger.info('Alert Engine initialized');

    } catch (error) {
      logger.error('Failed to initialize Alert Engine:', error);
      throw error;
    }
  }

  setupRoutes() {
    // Store components in app.locals for route access
    this.app.locals.alertEngine = this.alertEngine;
    this.app.locals.redisClient = this.redisClient;
    this.app.locals.kafkaConsumer = this.kafkaConsumer;
    this.app.locals.kafkaProducer = this.kafkaProducer;

    // Health and management routes
    this.app.use('/', healthRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'alert-processing',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          detailedHealth: '/health/detailed',
          ready: '/ready',
          live: '/live',
          metrics: '/metrics',
          alertStats: '/alerts/stats',
          activeAlerts: '/alerts/active'
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    });

    logger.debug('Routes configured');
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(config.port, (error) => {
        if (error) {
          logger.error('Failed to start HTTP server:', error);
          reject(error);
        } else {
          logger.info(`Alert Processing Service listening on port ${config.port}`);
          resolve();
        }
      });
    });
  }

  async startKafkaConsumer() {
    try {
      // Set up message handler
      const messageHandler = async (message) => {
        await this.alertEngine.processSensorData(message);
      };

      // Start consuming messages
      await this.kafkaConsumer.startConsuming(messageHandler);

      logger.info('Kafka consumer started, processing sensor data');

    } catch (error) {
      logger.error('Failed to start Kafka consumer:', error);
      throw error;
    }
  }

  async shutdown() {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    logger.info('Starting graceful shutdown...');

    try {
      // Stop accepting new connections
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
        logger.info('HTTP server closed');
      }

      // Shutdown Alert Engine
      if (this.alertEngine) {
        await this.alertEngine.shutdown();
        logger.info('Alert Engine shutdown');
      }

      // Disconnect Kafka components
      if (this.kafkaConsumer) {
        await this.kafkaConsumer.disconnect();
        logger.info('Kafka consumer disconnected');
      }

      if (this.kafkaProducer) {
        await this.kafkaProducer.disconnect();
        logger.info('Kafka producer disconnected');
      }

      // Disconnect Redis
      if (this.redisClient) {
        await this.redisClient.disconnect();
        logger.info('Redis client disconnected');
      }

      logger.info('Graceful shutdown completed');

    } catch (error) {
      logger.error('Error during shutdown:', error);
      throw error;
    }
  }

  setupGracefulShutdown() {
    const signals = ['SIGTERM', 'SIGINT'];

    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, starting graceful shutdown`);
        
        try {
          await this.shutdown();
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      this.shutdown().then(() => {
        process.exit(1);
      }).catch(() => {
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection:', { reason, promise });
      this.shutdown().then(() => {
        process.exit(1);
      }).catch(() => {
        process.exit(1);
      });
    });

    logger.debug('Graceful shutdown handlers configured');
  }
}

// Create and start service
async function main() {
  const service = new AlertProcessingService();
  
  try {
    // Set up graceful shutdown
    service.setupGracefulShutdown();
    
    // Initialize and start service
    await service.initialize();
    
    logger.info('Alert Processing Service is ready and running');

  } catch (error) {
    logger.error('Failed to start Alert Processing Service:', error);
    process.exit(1);
  }
}

// Start the service
if (require.main === module) {
  main();
}

module.exports = AlertProcessingService;
