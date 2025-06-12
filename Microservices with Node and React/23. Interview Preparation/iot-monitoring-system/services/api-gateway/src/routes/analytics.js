/**
 * Routes for analytics and metrics data
 */
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const logger = require('../utils/logger');

const router = express.Router();
const dataIngestionUrl = `${config.services.dataIngestion.protocol}://${config.services.dataIngestion.host}:${config.services.dataIngestion.port}`;

// Log the routes being created
logger.info(`Creating analytics routes with proxy target: ${dataIngestionUrl}`);

// Proxy for device current state - more specific path matching
router.get('/api/devices/:id/current', createProxyMiddleware({
  target: dataIngestionUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    logger.debug(`Proxying request to device current API: ${req.method} ${req.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.debug(`Received response from device current API: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
}));

// Proxy for device history - more specific path matching
router.get('/api/devices/:id/history', createProxyMiddleware({
  target: dataIngestionUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix
  },
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    logger.debug(`Proxying request to device history API: ${req.method} ${req.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.debug(`Received response from device history API: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  },
}));

// Proxy for metrics endpoints
router.use(
  '/api/metrics',
  createProxyMiddleware({
    target: dataIngestionUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/metrics': '/metrics', // Rewrite the path
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying request to metrics API: ${req.method} ${req.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.debug(`Received response from metrics API: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
  })
);

// Proxy for analytics endpoints
router.use(
  '/api/analytics',
  createProxyMiddleware({
    target: dataIngestionUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/analytics': '/analytics', // Rewrite the path
    },
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      logger.debug(`Proxying request to analytics API: ${req.method} ${req.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.debug(`Received response from analytics API: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
  })
);

module.exports = router;
