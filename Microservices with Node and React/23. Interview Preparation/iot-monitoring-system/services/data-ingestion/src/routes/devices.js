/**
 * Routes for device operations
 */
const express = require('express');
const { DeviceRepository } = require('../db/repositories');
const logger = require('../utils/logger');

const router = express.Router();
const deviceRepository = new DeviceRepository();

// Get all devices
router.get('/devices', async (req, res) => {
  try {
    const devices = await deviceRepository.findAll();
    res.json(devices);
  } catch (error) {
    logger.error({ error }, 'Error fetching all devices');
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get a specific device by ID
router.get('/devices/:id', async (req, res) => {
  try {
    const device = await deviceRepository.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    logger.error({ error, deviceId: req.params.id }, 'Error fetching device by ID');
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Get devices by status
router.get('/devices/status/:status', async (req, res) => {
  try {
    const devices = await deviceRepository.findByStatus(req.params.status);
    res.json(devices);
  } catch (error) {
    logger.error({ error, status: req.params.status }, 'Error fetching devices by status');
    res.status(500).json({ error: 'Failed to fetch devices by status' });
  }
});

module.exports = router;
