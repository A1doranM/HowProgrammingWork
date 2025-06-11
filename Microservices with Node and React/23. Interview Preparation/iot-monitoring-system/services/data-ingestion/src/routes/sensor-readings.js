/**
 * Routes for sensor readings operations
 */
const express = require('express');
const { SensorReadingRepository } = require('../db/repositories');
const logger = require('../utils/logger');

const router = express.Router();
const sensorReadingRepository = new SensorReadingRepository();

// Get sensor readings with optional query parameters
router.get('/sensor-readings', async (req, res) => {
  try {
    const { deviceId, sensorType, startTime, endTime, limit } = req.query;
    let readings = [];

    // Create options object for repository methods
    const options = {
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      limit: limit ? parseInt(limit, 10) : 100
    };

    // If deviceId is provided, get readings for that device
    if (deviceId) {
      readings = await sensorReadingRepository.findByDeviceId(deviceId, options);
    }
    // If sensorType is provided, get readings for that sensor type
    else if (sensorType) {
      readings = await sensorReadingRepository.findBySensorType(sensorType, options);
    }
    // If neither is provided, return an error
    else {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Either deviceId or sensorType query parameter is required' 
      });
    }

    res.json(readings);
  } catch (error) {
    logger.error({ error, query: req.query }, 'Error fetching sensor readings');
    res.status(500).json({ error: 'Failed to fetch sensor readings' });
  }
});

// Get sensor readings for a specific device
router.get('/sensor-readings/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { startTime, endTime, limit } = req.query;

    const options = {
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      limit: limit ? parseInt(limit, 10) : 100
    };

    const readings = await sensorReadingRepository.findByDeviceId(deviceId, options);
    res.json(readings);
  } catch (error) {
    logger.error({ error, deviceId: req.params.deviceId }, 'Error fetching sensor readings by device ID');
    res.status(500).json({ error: 'Failed to fetch sensor readings' });
  }
});

// Get sensor readings for a specific sensor type
router.get('/sensor-readings/type/:sensorType', async (req, res) => {
  try {
    const { sensorType } = req.params;
    const { startTime, endTime, limit } = req.query;

    const options = {
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      limit: limit ? parseInt(limit, 10) : 100
    };

    const readings = await sensorReadingRepository.findBySensorType(sensorType, options);
    res.json(readings);
  } catch (error) {
    logger.error({ error, sensorType: req.params.sensorType }, 'Error fetching sensor readings by sensor type');
    res.status(500).json({ error: 'Failed to fetch sensor readings' });
  }
});

// Get the latest reading for a device and sensor type
router.get('/sensor-readings/latest/:deviceId/:sensorType', async (req, res) => {
  try {
    const { deviceId, sensorType } = req.params;
    
    const reading = await sensorReadingRepository.getLatestReading(deviceId, sensorType);
    
    if (!reading) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: `No readings found for device ${deviceId} and sensor type ${sensorType}` 
      });
    }
    
    res.json(reading);
  } catch (error) {
    logger.error({ 
      error, 
      deviceId: req.params.deviceId, 
      sensorType: req.params.sensorType 
    }, 'Error fetching latest sensor reading');
    res.status(500).json({ error: 'Failed to fetch latest sensor reading' });
  }
});

module.exports = router;
