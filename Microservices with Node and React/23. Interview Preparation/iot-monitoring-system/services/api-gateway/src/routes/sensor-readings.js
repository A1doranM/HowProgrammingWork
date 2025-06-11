/**
 * Routes for handling sensor readings data
 */
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const logger = require('../utils/logger');

const router = express.Router();
const dataIngestionUrl = `${config.services.dataIngestion.protocol}://${config.services.dataIngestion.host}:${config.services.dataIngestion.port}`;

// Log the routes being created
logger.info(`Creating sensor readings routes with proxy target: ${dataIngestionUrl}`);

// Proxy for sensor readings to the data-ingestion service
router.use(
  '/api/sensor-readings',
  createProxyMiddleware({
    target: dataIngestionUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/sensor-readings': '/sensor-readings', // Rewrite the path
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying request to sensor readings API: ${req.method} ${req.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.debug(`Received response from sensor readings API: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
  })
);

module.exports = router;
