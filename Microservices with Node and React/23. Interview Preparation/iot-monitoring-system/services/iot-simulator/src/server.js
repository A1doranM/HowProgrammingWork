const express = require('express');
const config = require('./config');
const logger = require('./utils/logger');
const producer = require('./kafka/producer');

/**
 * Express server for health checks and metrics
 */
class Server {
  constructor() {
    this.app = express();
    this.port = config.service.port;
    this.simulators = [];
    
    this.setupRoutes();
  }

  /**
   * Set up the routes for the server
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const isHealthy = producer.connected && this.simulators.length > 0;
      
      // Get health status
      const health = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        service: config.service.name,
        producer: {
          connected: producer.connected,
          stats: producer.getStats()
        },
        simulators: this.simulators.map(sim => ({
          deviceId: sim.deviceId,
          type: sim.type,
          status: sim.timer ? 'running' : 'stopped',
          stats: sim.getStats()
        }))
      };
      
      // Return health status
      res.status(isHealthy ? 200 : 503).json(health);
    });
    
    // Metrics endpoint
    this.app.get('/metrics', (req, res) => {
      // Get simulator metrics
      const metrics = {
        timestamp: new Date().toISOString(),
        producer: producer.getStats(),
        simulators: this.simulators.map(sim => ({
          deviceId: sim.deviceId,
          type: sim.type,
          readings: sim.stats.generatedReadings,
          anomalies: sim.stats.anomaliesGenerated,
          readingsPerMinute: sim.getStats().readingsPerMinute
        })),
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        }
      };
      
      // Return metrics
      res.json(metrics);
    });
    
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });
    
    // Error handler
    this.app.use((err, req, res, next) => {
      logger.error({ error: err.message, stack: err.stack }, 'Express error');
      res.status(500).json({ error: 'Internal Server Error' });
    });
  }

  /**
   * Set the simulators array for health checks
   * 
   * @param {Array} simulators - Array of simulator instances
   */
  setSimulators(simulators) {
    this.simulators = simulators;
  }

  /**
   * Start the server
   */
  start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        logger.info({ port: this.port }, 'Server started');
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  stop() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            logger.error({ error: err.message }, 'Error stopping server');
            return reject(err);
          }
          
          logger.info('Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Export a singleton instance
const server = new Server();
module.exports = server;
