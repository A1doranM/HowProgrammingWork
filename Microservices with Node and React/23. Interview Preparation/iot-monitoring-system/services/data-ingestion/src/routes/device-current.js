/**
 * Routes for device current state and real-time data
 */
const express = require('express');
const { DeviceRepository, SensorReadingRepository } = require('../db/repositories');
const logger = require('../utils/logger');

const router = express.Router();
const deviceRepository = new DeviceRepository();
const sensorReadingRepository = new SensorReadingRepository();

// Get current state for a specific device (for real-time dashboard)
router.get('/devices/:id/current', async (req, res) => {
  try {
    const deviceId = req.params.id;
    
    // Get device details
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Get the latest reading for this device
    const latestReading = await sensorReadingRepository.getLatestReading(deviceId, device.device_type);
    
    // Get recent readings for trend calculation (last 10 readings)
    const recentReadings = await sensorReadingRepository.findByDeviceId(deviceId, { limit: 10 });
    
    // Calculate basic statistics from recent readings
    let trend = 'stable';
    let avgValue = null;
    
    if (recentReadings.length >= 2) {
      const values = recentReadings.map(r => parseFloat(r.value)).reverse(); // Chronological order
      avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Simple trend calculation (compare first and last half)
      const midPoint = Math.floor(values.length / 2);
      const firstHalf = values.slice(0, midPoint);
      const secondHalf = values.slice(midPoint);
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      const trendThreshold = avgValue * 0.05; // 5% threshold
      if (secondAvg > firstAvg + trendThreshold) {
        trend = 'increasing';
      } else if (secondAvg < firstAvg - trendThreshold) {
        trend = 'decreasing';
      }
    }

    // Determine status based on thresholds
    let status = 'normal';
    if (latestReading) {
      const value = parseFloat(latestReading.value);
      if (device.alert_max && value > device.alert_max) {
        status = 'critical_high';
      } else if (device.alert_min && value < device.alert_min) {
        status = 'critical_low';
      } else if (device.normal_max && value > device.normal_max) {
        status = 'warning_high';
      } else if (device.normal_min && value < device.normal_min) {
        status = 'warning_low';
      }
    }

    const response = {
      deviceId,
      deviceType: device.device_type,
      location: device.location,
      status,
      currentReading: latestReading ? {
        value: parseFloat(latestReading.value),
        timestamp: latestReading.timestamp,
        unit: device.unit
      } : null,
      thresholds: {
        normalMin: parseFloat(device.normal_min) || null,
        normalMax: parseFloat(device.normal_max) || null,
        alertMin: parseFloat(device.alert_min) || null,
        alertMax: parseFloat(device.alert_max) || null
      },
      statistics: {
        trend,
        avgValue: avgValue ? parseFloat(avgValue.toFixed(2)) : null,
        dataPoints: recentReadings.length
      },
      lastUpdate: latestReading?.timestamp || null
    };

    res.json(response);
  } catch (error) {
    logger.error({ error, deviceId: req.params.id }, 'Error fetching current device state');
    res.status(500).json({ error: 'Failed to fetch current device state' });
  }
});

// Get historical data for a specific device (for charts)
router.get('/devices/:id/history', async (req, res) => {
  try {
    const deviceId = req.params.id;
    const { timeRange = '1h', points = 100 } = req.query;
    
    // Calculate time range
    const endTime = new Date();
    let startTime = new Date();
    
    switch (timeRange) {
      case '15m':
        startTime.setMinutes(startTime.getMinutes() - 15);
        break;
      case '1h':
        startTime.setHours(startTime.getHours() - 1);
        break;
      case '6h':
        startTime.setHours(startTime.getHours() - 6);
        break;
      case '24h':
        startTime.setHours(startTime.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(startTime.getDate() - 7);
        break;
      default:
        startTime.setHours(startTime.getHours() - 1);
    }

    // Get device for threshold information
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Get readings for the time range
    const readings = await sensorReadingRepository.findByDeviceId(deviceId, {
      startTime,
      endTime,
      limit: parseInt(points, 10)
    });

    // Format data for charts
    const chartData = readings.reverse().map(reading => ({
      timestamp: reading.timestamp,
      value: parseFloat(reading.value),
      status: getReadingStatus(parseFloat(reading.value), device)
    }));

    const response = {
      deviceId,
      deviceType: device.device_type,
      unit: device.unit,
      timeRange,
      dataPoints: chartData.length,
      thresholds: {
        normalMin: parseFloat(device.normal_min) || null,
        normalMax: parseFloat(device.normal_max) || null,
        alertMin: parseFloat(device.alert_min) || null,
        alertMax: parseFloat(device.alert_max) || null
      },
      data: chartData
    };

    res.json(response);
  } catch (error) {
    logger.error({ error, deviceId: req.params.id }, 'Error fetching device history');
    res.status(500).json({ error: 'Failed to fetch device history' });
  }
});

// Helper function to determine reading status
function getReadingStatus(value, device) {
  if (device.alert_max && value > device.alert_max) {
    return 'critical_high';
  } else if (device.alert_min && value < device.alert_min) {
    return 'critical_low';
  } else if (device.normal_max && value > device.normal_max) {
    return 'warning_high';
  } else if (device.normal_min && value < device.normal_min) {
    return 'warning_low';
  }
  return 'normal';
}

module.exports = router;
