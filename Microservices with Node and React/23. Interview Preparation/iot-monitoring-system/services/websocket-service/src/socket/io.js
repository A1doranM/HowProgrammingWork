/**
 * Socket.IO implementation for the WebSocket Service
 */
const { Server } = require('socket.io');
const config = require('../config');
const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.IO server
 * @param {object} httpServer - HTTP server instance
 * @returns {object} - Socket.IO server instance
 */
function initSocketIO(httpServer) {
  // Create Socket.IO server with CORS configuration
  io = new Server(httpServer, {
    cors: config.cors,
    path: config.socketIO.path,
    serveClient: config.socketIO.serveClient,
    pingInterval: config.socketIO.pingInterval,
    pingTimeout: config.socketIO.pingTimeout,
    cookie: config.socketIO.cookie,
  });

  // Set up connection handler
  io.on('connection', (socket) => {
    const clientId = socket.id;
    logger.info(`Client connected: ${clientId}`);

    // Send welcome message to the client
    socket.emit('welcome', {
      message: 'Connected to IoT Monitoring System WebSocket service',
      timestamp: new Date().toISOString(),
    });

    // Handle client subscription to device data
    socket.on('subscribe:device', (deviceId) => {
      logger.info(`Client ${clientId} subscribed to device: ${deviceId}`);
      socket.join(`device:${deviceId}`);
    });

    // Handle client unsubscription from device data
    socket.on('unsubscribe:device', (deviceId) => {
      logger.info(`Client ${clientId} unsubscribed from device: ${deviceId}`);
      socket.leave(`device:${deviceId}`);
    });

    // Handle client requesting historical data
    socket.on('get:history', async (params, callback) => {
      try {
        logger.info(`Client ${clientId} requested historical data`, params);
        // This is a placeholder - in a real implementation, you would fetch historical data
        // from a database or cache and return it to the client
        callback({
          success: true,
          message: 'Historical data retrieved successfully',
          data: [], // This would be actual data in a real implementation
        });
      } catch (error) {
        logger.error(`Error retrieving historical data: ${error.message}`, { error, params });
        callback({
          success: false,
          message: 'Failed to retrieve historical data',
          error: error.message,
        });
      }
    });

    // Handle client disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${clientId}, reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for client ${clientId}: ${error.message}`, { error });
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}

/**
 * Broadcast sensor reading to all connected clients subscribed to the device
 * @param {object} reading - Sensor reading data
 */
function broadcastSensorReading(reading) {
  if (!io) {
    logger.warn('Socket.IO server not initialized, cannot broadcast sensor reading');
    return;
  }

  try {
    if (reading && reading.deviceId) {
      // Broadcast to all clients subscribed to this device
      io.to(`device:${reading.deviceId}`).emit('sensor:reading', reading);
      logger.debug(`Broadcast sensor reading for device: ${reading.deviceId}`);
      
      // Also broadcast to all clients
      io.emit('sensor:all', reading);
    } else {
      logger.warn('Invalid sensor reading data, cannot broadcast', { reading });
    }
  } catch (error) {
    logger.error(`Error broadcasting sensor reading: ${error.message}`, { error, reading });
  }
}

/**
 * Broadcast device status update to all connected clients
 * @param {object} status - Device status data
 */
function broadcastDeviceStatus(status) {
  if (!io) {
    logger.warn('Socket.IO server not initialized, cannot broadcast device status');
    return;
  }

  try {
    if (status && status.deviceId) {
      // Broadcast to all clients subscribed to this device
      io.to(`device:${status.deviceId}`).emit('device:status', status);
      
      // Also broadcast to all clients
      io.emit('device:all', status);
      
      logger.debug(`Broadcast device status for device: ${status.deviceId}`);
    } else {
      logger.warn('Invalid device status data, cannot broadcast', { status });
    }
  } catch (error) {
    logger.error(`Error broadcasting device status: ${error.message}`, { error, status });
  }
}

/**
 * Broadcast alert to all connected clients
 * @param {object} alert - Alert data
 */
function broadcastAlert(alert) {
  if (!io) {
    logger.warn('Socket.IO server not initialized, cannot broadcast alert');
    return;
  }

  try {
    if (alert) {
      // Broadcast to all clients
      io.emit('alert', alert);
      
      // If the alert is associated with a specific device, also broadcast to that device's subscribers
      if (alert.deviceId) {
        io.to(`device:${alert.deviceId}`).emit('alert:device', alert);
      }
      
      logger.debug('Broadcast alert', { alert });
    } else {
      logger.warn('Invalid alert data, cannot broadcast', { alert });
    }
  } catch (error) {
    logger.error(`Error broadcasting alert: ${error.message}`, { error, alert });
  }
}

module.exports = {
  initSocketIO,
  broadcastSensorReading,
  broadcastDeviceStatus,
  broadcastAlert,
};
