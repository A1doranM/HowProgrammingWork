const logger = require('./utils/logger');
const producer = require('./kafka/producer');
const server = require('./server');
const deviceConfigs = require('./config/devices');

// Import simulators
const TemperatureSimulator = require('./simulators/temperature');
const PressureSimulator = require('./simulators/pressure');
const VibrationSimulator = require('./simulators/vibration');
const ProductionSimulator = require('./simulators/production');
const QualitySimulator = require('./simulators/quality');

// Collection of active simulators
const simulators = [];

/**
 * Initialize a simulator based on device type
 * 
 * @param {Object} deviceConfig - Configuration for the device
 * @returns {Object} Initialized simulator
 */
function initializeSimulator(deviceConfig) {
  // Factory function to create the appropriate simulator based on type
  switch (deviceConfig.type) {
    case 'temperature':
      return new TemperatureSimulator(deviceConfig, producer.sendMessage);
    
    case 'pressure':
      return new PressureSimulator(deviceConfig, producer.sendMessage);
    
    case 'vibration':
      return new VibrationSimulator(deviceConfig, producer.sendMessage);
    
    case 'production':
      return new ProductionSimulator(deviceConfig, producer.sendMessage);
    
    case 'quality':
      return new QualitySimulator(deviceConfig, producer.sendMessage);
    
    default:
      throw new Error(`Unknown device type: ${deviceConfig.type}`);
  }
}

/**
 * Initialize and start all device simulators
 */
async function startSimulators() {
  logger.info({ count: deviceConfigs.length }, 'Starting simulators');
  
  // Initialize simulators
  for (const deviceConfig of deviceConfigs) {
    try {
      const simulator = initializeSimulator(deviceConfig);
      simulators.push(simulator);
      
      logger.info({
        deviceId: simulator.deviceId,
        type: simulator.type
      }, 'Initialized simulator');
    } catch (error) {
      logger.error({
        error: error.message,
        deviceId: deviceConfig.deviceId,
        type: deviceConfig.type
      }, 'Failed to initialize simulator');
    }
  }
  
  // Register simulators with server for health checks
  server.setSimulators(simulators);
  
  // Start all simulators
  simulators.forEach(simulator => simulator.start());
  logger.info({ count: simulators.length }, 'All simulators started');
}

/**
 * Stop all device simulators
 */
async function stopSimulators() {
  logger.info({ count: simulators.length }, 'Stopping simulators');
  
  // Stop all simulators
  simulators.forEach(simulator => simulator.stop());
  logger.info('All simulators stopped');
}

/**
 * Start the application
 */
async function start() {
  try {
    // Connect to Kafka
    logger.info('Connecting to Kafka');
    const connected = await producer.connect();
    
    if (!connected) {
      logger.warn('Failed to connect to Kafka, will retry in background');
    }
    
    // Start simulators
    await startSimulators();
    
    // Start HTTP server
    await server.start();
    
    logger.info('IoT Simulator service started successfully');
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Failed to start IoT Simulator service');
    
    // Exit with error
    process.exit(1);
  }
}

/**
 * Stop the application
 */
async function stop() {
  logger.info('Stopping IoT Simulator service');
  
  try {
    // Stop simulators
    await stopSimulators();
    
    // Disconnect from Kafka
    await producer.disconnect();
    
    // Stop HTTP server
    await server.stop();
    
    logger.info('IoT Simulator service stopped successfully');
  } catch (error) {
    logger.error({
      error: error.message,
      stack: error.stack
    }, 'Error during shutdown');
    
    // Force exit
    process.exit(1);
  }
}

// Handle signals for graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM signal');
  await stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal');
  await stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.fatal({
    error: error.message,
    stack: error.stack
  }, 'Uncaught exception');
  
  // Attempt graceful shutdown
  stop().finally(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({
    reason: reason?.message || reason,
    stack: reason?.stack
  }, 'Unhandled promise rejection');
});

// Start the application
start();
