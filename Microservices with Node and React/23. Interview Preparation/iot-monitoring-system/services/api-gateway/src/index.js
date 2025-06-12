/**
 * API Gateway - Entry Point
 * 
 * This service acts as a single entry point for all client applications,
 * routing requests to the appropriate microservices.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const promBundle = require('express-prom-bundle');

const config = require('./config');
const logger = require('./utils/logger');
const deviceRoutes = require('./routes/devices');
const sensorReadingsRoutes = require('./routes/sensor-readings');
const analyticsRoutes = require('./routes/analytics');

// Create Express app
const app = express();
const PORT = config.service.port;

// Configure middleware
app.use(cors(config.cors));
// Configure Helmet with modified CSP to allow inline scripts for our dashboard
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
      imgSrc: ["'self'", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true }));

// Request logging
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

// Mount route handlers - Order matters! More specific routes first
app.use(analyticsRoutes);
app.use(deviceRoutes);
app.use(sensorReadingsRoutes);

// Static files for the dashboard
app.use(express.static('public'));

// Route for the test dashboard
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.path} was not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error processing request: ${err.message}`, { error: err, path: req.path });
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`${config.service.name} HTTP server listening on port ${PORT}`);
  logger.info(`Environment: ${config.service.environment}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; // Export for testing
