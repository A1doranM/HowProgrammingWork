/**
 * Device Repository
 * Handles database operations for the Device entity
 */

const logger = require('../../utils/logger');
const { AppDataSource } = require('../database');

class DeviceRepository {
  constructor() {
    this.repository = AppDataSource.getRepository('Device');
  }

  /**
   * Find a device by its ID
   * @param {string} deviceId - The device ID
   * @returns {Promise<Device|null>} - The device or null if not found
   */
  async findById(deviceId) {
    try {
      return await this.repository.findOne({
        where: { device_id: deviceId }
      });
    } catch (error) {
      logger.error({ error, deviceId }, 'Error finding device by ID');
      throw error;
    }
  }

  /**
   * Ensure a device exists in the database
   * If the device exists, update its properties
   * If not, create a new device
   * 
   * @param {string} deviceId - The device ID
   * @param {Object} deviceInfo - Device information
   * @returns {Promise<Device>} - The created or updated device
   */
  async ensureDeviceExists(deviceId, deviceInfo) {
    try {
      logger.debug({ deviceId, deviceInfo }, 'Ensuring device exists');
      
      // Try to find the device
      const existingDevice = await this.findById(deviceId);
      
      if (existingDevice) {
        // Update the device if it exists
        logger.debug({ deviceId }, 'Device exists, updating');
        
        const updateResult = await this.repository.update(
          { device_id: deviceId }, 
          {
            location: deviceInfo.location || existingDevice.location,
            status: deviceInfo.status || existingDevice.status,
            device_type: deviceInfo.deviceType || existingDevice.device_type
          }
        );
        
        if (updateResult.affected > 0) {
          return this.findById(deviceId);
        }
        
        return existingDevice;
      } else {
        // Create a new device if it doesn't exist
        logger.debug({ deviceId, deviceInfo }, 'Device does not exist, creating new device');
        
        const newDevice = this.repository.create({
          device_id: deviceId,
          device_type: deviceInfo.deviceType || 'unknown',
          location: deviceInfo.location || 'unknown',
          status: deviceInfo.status || 'active'
        });
        
        return await this.repository.save(newDevice);
      }
    } catch (error) {
      logger.error({ error, deviceId, deviceInfo }, 'Error ensuring device exists');
      throw error;
    }
  }

  /**
   * Find all devices
   * @param {Object} options - Query options
   * @returns {Promise<Device[]>} - Array of devices
   */
  async findAll(options = {}) {
    try {
      return await this.repository.find(options);
    } catch (error) {
      logger.error({ error }, 'Error finding all devices');
      throw error;
    }
  }

  /**
   * Find devices by status
   * @param {string} status - Device status
   * @returns {Promise<Device[]>} - Array of devices
   */
  async findByStatus(status) {
    try {
      return await this.repository.find({
        where: { status }
      });
    } catch (error) {
      logger.error({ error, status }, 'Error finding devices by status');
      throw error;
    }
  }
}

module.exports = DeviceRepository;
