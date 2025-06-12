/**
 * Routes for system metrics and dashboard analytics
 */
const express = require('express');
const { DeviceRepository, SensorReadingRepository } = require('../db/repositories');
const logger = require('../utils/logger');

const router = express.Router();
const deviceRepository = new DeviceRepository();
const sensorReadingRepository = new SensorReadingRepository();

// Get dashboard summary metrics
router.get('/metrics/dashboard', async (req, res) => {
  try {
    // Get all devices
    const devices = await deviceRepository.findAll();
    
    // Get active devices (those with recent readings in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeDevicesPromises = devices.map(async (device) => {
      const latestReading = await sensorReadingRepository.getLatestReading(device.device_id, device.device_type);
      return latestReading && new Date(latestReading.timestamp) > fiveMinutesAgo ? device : null;
    });
    
    const activeDevicesResults = await Promise.all(activeDevicesPromises);
    const activeDevices = activeDevicesResults.filter(device => device !== null);
    
    // Get current readings for all devices to check alert status
    const deviceStatusPromises = devices.map(async (device) => {
      const latestReading = await sensorReadingRepository.getLatestReading(device.device_id, device.device_type);
      
      if (!latestReading) {
        return { deviceId: device.device_id, status: 'offline', alertLevel: 'none' };
      }
      
      const value = parseFloat(latestReading.value);
      let status = 'normal';
      let alertLevel = 'none';
      
      if (device.alert_max && value > device.alert_max) {
        status = 'critical_high';
        alertLevel = 'critical';
      } else if (device.alert_min && value < device.alert_min) {
        status = 'critical_low';
        alertLevel = 'critical';
      } else if (device.normal_max && value > device.normal_max) {
        status = 'warning_high';
        alertLevel = 'warning';
      } else if (device.normal_min && value < device.normal_min) {
        status = 'warning_low';
        alertLevel = 'warning';
      }
      
      return {
        deviceId: device.device_id,
        deviceType: device.device_type,
        status,
        alertLevel,
        value,
        timestamp: latestReading.timestamp
      };
    });
    
    const deviceStatuses = await Promise.all(deviceStatusPromises);
    
    // Count alerts by level
    const criticalAlerts = deviceStatuses.filter(d => d.alertLevel === 'critical').length;
    const warningAlerts = deviceStatuses.filter(d => d.alertLevel === 'warning').length;
    const totalAlerts = criticalAlerts + warningAlerts;
    
    // Get data points from last hour for system health
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentDataPromises = devices.map(device => 
      sensorReadingRepository.findByDeviceId(device.device_id, {
        startTime: oneHourAgo,
        limit: 1000
      })
    );
    
    const recentDataResults = await Promise.all(recentDataPromises);
    const totalDataPointsLastHour = recentDataResults.reduce((sum, readings) => sum + readings.length, 0);
    
    // Determine system health
    let systemHealth = 'healthy';
    if (criticalAlerts > 0 || activeDevices.length < devices.length * 0.8) {
      systemHealth = 'critical';
    } else if (warningAlerts > 0 || activeDevices.length < devices.length * 0.9) {
      systemHealth = 'warning';
    }
    
    const response = {
      summary: {
        totalDevices: devices.length,
        activeDevices: activeDevices.length,
        offlineDevices: devices.length - activeDevices.length,
        systemHealth,
        dataPointsLastHour: totalDataPointsLastHour,
        lastUpdate: new Date().toISOString()
      },
      alerts: {
        total: totalAlerts,
        critical: criticalAlerts,
        warning: warningAlerts,
        normal: devices.length - totalAlerts
      },
      deviceStatuses: deviceStatuses.map(device => ({
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        status: device.status,
        alertLevel: device.alertLevel,
        lastUpdate: device.timestamp
      }))
    };

    res.json(response);
  } catch (error) {
    logger.error({ error }, 'Error fetching dashboard metrics');
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// Get system health metrics
router.get('/metrics/system', async (req, res) => {
  try {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    
    // Get total counts
    const devices = await deviceRepository.findAll();
    const activeDevices = await deviceRepository.findByStatus('active');
    
    // Get recent data volume
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentDataPromises = devices.map(device => 
      sensorReadingRepository.findByDeviceId(device.device_id, {
        startTime: oneHourAgo,
        limit: 1000
      })
    );
    
    const recentDataResults = await Promise.all(recentDataPromises);
    const dataVolumeLastHour = recentDataResults.reduce((sum, readings) => sum + readings.length, 0);
    
    const response = {
      service: 'data-ingestion',
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memory.heapUsed / 1024 / 1024), // MB
        total: Math.round(memory.heapTotal / 1024 / 1024), // MB
        external: Math.round(memory.external / 1024 / 1024) // MB
      },
      database: {
        totalDevices: devices.length,
        activeDevices: activeDevices.length,
        dataVolumeLastHour
      },
      performance: {
        dataPointsPerSecond: Math.round(dataVolumeLastHour / 3600),
        avgMemoryUsage: Math.round((memory.heapUsed / memory.heapTotal) * 100)
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    logger.error({ error }, 'Error fetching system metrics');
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

// Get trend analysis for a specific device
router.get('/analytics/trends/:deviceId', async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const { period = '24h' } = req.query;
    
    // Calculate time range based on period
    const endTime = new Date();
    let startTime = new Date();
    let groupBy = 'hour'; // Default grouping
    
    switch (period) {
      case '1h':
        startTime.setHours(startTime.getHours() - 1);
        groupBy = 'minute';
        break;
      case '6h':
        startTime.setHours(startTime.getHours() - 6);
        groupBy = 'hour';
        break;
      case '24h':
        startTime.setHours(startTime.getHours() - 24);
        groupBy = 'hour';
        break;
      case '7d':
        startTime.setDate(startTime.getDate() - 7);
        groupBy = 'day';
        break;
      case '30d':
        startTime.setDate(startTime.getDate() - 30);
        groupBy = 'day';
        break;
      default:
        startTime.setHours(startTime.getHours() - 24);
    }

    // Get device info
    const device = await deviceRepository.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Get readings for the time period
    const readings = await sensorReadingRepository.findByDeviceId(deviceId, {
      startTime,
      endTime,
      limit: 1000
    });

    if (readings.length === 0) {
      return res.json({
        deviceId,
        period,
        trend: 'no_data',
        statistics: null,
        data: []
      });
    }

    // Calculate statistics
    const values = readings.map(r => parseFloat(r.value));
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate trend direction
    const firstQuarter = values.slice(0, Math.floor(values.length / 4));
    const lastQuarter = values.slice(-Math.floor(values.length / 4));
    
    const firstAvg = firstQuarter.reduce((sum, val) => sum + val, 0) / firstQuarter.length;
    const lastAvg = lastQuarter.reduce((sum, val) => sum + val, 0) / lastQuarter.length;
    
    let trend = 'stable';
    const trendThreshold = stdDev * 0.5; // Use standard deviation for trend detection
    
    if (lastAvg > firstAvg + trendThreshold) {
      trend = 'increasing';
    } else if (lastAvg < firstAvg - trendThreshold) {
      trend = 'decreasing';
    }
    
    // Group data for trend visualization
    const groupedData = groupReadingsByTime(readings.reverse(), groupBy);

    const response = {
      deviceId,
      deviceType: device.device_type,
      period,
      dataPoints: readings.length,
      trend,
      statistics: {
        avg: parseFloat(avg.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        firstQuarterAvg: parseFloat(firstAvg.toFixed(2)),
        lastQuarterAvg: parseFloat(lastAvg.toFixed(2))
      },
      thresholds: {
        normalMin: parseFloat(device.normal_min) || null,
        normalMax: parseFloat(device.normal_max) || null,
        alertMin: parseFloat(device.alert_min) || null,
        alertMax: parseFloat(device.alert_max) || null
      },
      data: groupedData
    };

    res.json(response);
  } catch (error) {
    logger.error({ error, deviceId: req.params.deviceId }, 'Error fetching trend analysis');
    res.status(500).json({ error: 'Failed to fetch trend analysis' });
  }
});

// Get overall system analytics summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const devices = await deviceRepository.findAll();
    
    // Get analytics for each device
    const deviceAnalyticsPromises = devices.map(async (device) => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const readings = await sensorReadingRepository.findByDeviceId(device.device_id, {
        startTime: oneHourAgo,
        limit: 100
      });
      
      if (readings.length === 0) {
        return {
          deviceId: device.device_id,
          deviceType: device.device_type,
          status: 'no_data',
          dataPoints: 0
        };
      }
      
      const values = readings.map(r => parseFloat(r.value));
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const latestValue = values[0]; // Most recent (first in desc order)
      
      let status = 'normal';
      if (device.alert_max && latestValue > device.alert_max) {
        status = 'critical_high';
      } else if (device.alert_min && latestValue < device.alert_min) {
        status = 'critical_low';
      } else if (device.normal_max && latestValue > device.normal_max) {
        status = 'warning_high';
      } else if (device.normal_min && latestValue < device.normal_min) {
        status = 'warning_low';
      }
      
      return {
        deviceId: device.device_id,
        deviceType: device.device_type,
        location: device.location,
        status,
        currentValue: parseFloat(latestValue.toFixed(2)),
        avgValue: parseFloat(avg.toFixed(2)),
        dataPoints: readings.length,
        lastUpdate: readings[0].timestamp
      };
    });
    
    const deviceAnalytics = await Promise.all(deviceAnalyticsPromises);
    
    // Calculate overall statistics
    const totalDataPoints = deviceAnalytics.reduce((sum, device) => sum + device.dataPoints, 0);
    const devicesByType = deviceAnalytics.reduce((acc, device) => {
      acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
      return acc;
    }, {});
    
    const statusCounts = deviceAnalytics.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {});

    const response = {
      overview: {
        totalDevices: devices.length,
        deviceTypes: Object.keys(devicesByType).length,
        totalDataPointsLastHour: totalDataPoints,
        avgDataPointsPerDevice: Math.round(totalDataPoints / devices.length)
      },
      devicesByType,
      statusDistribution: statusCounts,
      devices: deviceAnalytics,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    logger.error({ error }, 'Error fetching analytics summary');
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

// Helper function to group readings by time period
function groupReadingsByTime(readings, groupBy) {
  const groups = {};
  
  readings.forEach(reading => {
    const date = new Date(reading.timestamp);
    let key;
    
    switch (groupBy) {
      case 'minute':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        break;
      case 'hour':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        break;
      default:
        key = reading.timestamp;
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(parseFloat(reading.value));
  });
  
  // Convert groups to array with averages
  return Object.entries(groups).map(([timestamp, values]) => ({
    timestamp,
    value: parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2)),
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values)
  })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

module.exports = router;
