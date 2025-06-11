/**
 * SensorReading Repository
 * Handles database operations for the SensorReading entity
 */

const logger = require('../../utils/logger');
const { AppDataSource } = require('../database');
const config = require('../../config');

class SensorReadingRepository {
  constructor() {
    this.repository = AppDataSource.getRepository('SensorReading');
  }

  /**
   * Insert a single sensor reading
   * @param {Object} reading - Sensor reading data
   * @returns {Promise<SensorReading>} - The created sensor reading
   */
  async insertSensorReading(reading) {
    try {
      logger.debug({ reading }, 'Inserting sensor reading');
      
      const sensorReading = this.repository.create(reading);
      return await this.repository.save(sensorReading);
    } catch (error) {
      logger.error({ error, reading }, 'Error inserting sensor reading');
      throw error;
    }
  }

  /**
   * Batch insert multiple sensor readings for better performance
   * @param {Array<Object>} readings - Array of sensor reading data
   * @returns {Promise<Array<SensorReading>>} - The created sensor readings
   */
  async batchInsertSensorReadings(readings) {
    try {
      if (!readings.length) {
        logger.debug('No readings to insert in batch');
        return [];
      }
      
      logger.info(`Batch inserting ${readings.length} sensor readings`);
      
      const sensorReadings = this.repository.create(readings);
      return await this.repository.save(sensorReadings);
    } catch (error) {
      logger.error({ error }, `Failed to batch insert ${readings.length} sensor readings`);
      throw error;
    }
  }

  /**
   * Find readings by device ID and optional time range
   * @param {string} deviceId - Device ID
   * @param {Object} options - Query options
   * @param {Date} options.startTime - Start time for query range
   * @param {Date} options.endTime - End time for query range
   * @param {number} options.limit - Max number of readings to return
   * @returns {Promise<Array<SensorReading>>} - Array of sensor readings
   */
  async findByDeviceId(deviceId, options = {}) {
    try {
      const { startTime, endTime, limit = 100 } = options;
      
      const queryBuilder = this.repository.createQueryBuilder('reading')
        .where('reading.device_id = :deviceId', { deviceId })
        .orderBy('reading.timestamp', 'DESC')
        .limit(limit);
      
      if (startTime) {
        queryBuilder.andWhere('reading.timestamp >= :startTime', { startTime });
      }
      
      if (endTime) {
        queryBuilder.andWhere('reading.timestamp <= :endTime', { endTime });
      }
      
      return await queryBuilder.getMany();
    } catch (error) {
      logger.error({ error, deviceId, options }, 'Error finding readings by device ID');
      throw error;
    }
  }

  /**
   * Find readings by sensor type and optional time range
   * @param {string} sensorType - Sensor type
   * @param {Object} options - Query options
   * @param {Date} options.startTime - Start time for query range
   * @param {Date} options.endTime - End time for query range
   * @param {number} options.limit - Max number of readings to return
   * @returns {Promise<Array<SensorReading>>} - Array of sensor readings
   */
  async findBySensorType(sensorType, options = {}) {
    try {
      const { startTime, endTime, limit = 100 } = options;
      
      const queryBuilder = this.repository.createQueryBuilder('reading')
        .where('reading.sensor_type = :sensorType', { sensorType })
        .orderBy('reading.timestamp', 'DESC')
        .limit(limit);
      
      if (startTime) {
        queryBuilder.andWhere('reading.timestamp >= :startTime', { startTime });
      }
      
      if (endTime) {
        queryBuilder.andWhere('reading.timestamp <= :endTime', { endTime });
      }
      
      return await queryBuilder.getMany();
    } catch (error) {
      logger.error({ error, sensorType, options }, 'Error finding readings by sensor type');
      throw error;
    }
  }

  /**
   * Get the latest reading for a device and sensor type
   * @param {string} deviceId - Device ID
   * @param {string} sensorType - Sensor type
   * @returns {Promise<SensorReading|null>} - Latest sensor reading or null
   */
  async getLatestReading(deviceId, sensorType) {
    try {
      return await this.repository.findOne({
        where: {
          device_id: deviceId,
          sensor_type: sensorType
        },
        order: {
          timestamp: 'DESC'
        }
      });
    } catch (error) {
      logger.error({ error, deviceId, sensorType }, 'Error getting latest reading');
      throw error;
    }
  }
}

module.exports = SensorReadingRepository;
