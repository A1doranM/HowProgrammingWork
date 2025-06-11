/**
 * PostgreSQL Database Connection Manager
 * Manages database connections and provides query execution methods
 */

const { Pool } = require('pg');
const format = require('pg-format');
const config = require('../config');
const logger = require('../utils/logger');

// Create a connection pool
const pool = new Pool({
  host: config.postgres.host,
  port: config.postgres.port,
  database: config.postgres.database,
  user: config.postgres.user,
  password: config.postgres.password,
  ssl: config.postgres.ssl,
  max: config.postgres.max,
  idleTimeoutMillis: config.postgres.idleTimeoutMillis,
  connectionTimeoutMillis: config.postgres.connectionTimeoutMillis
});

// Register event listeners on the pool
pool.on('connect', () => {
  logger.debug('New PostgreSQL client connected');
});

pool.on('error', (err) => {
  logger.error({ err }, 'PostgreSQL client error');
});

pool.on('remove', () => {
  logger.debug('PostgreSQL client removed from pool');
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug({
      query: text,
      params,
      rowCount: result.rowCount,
      duration
    }, 'Executed query');
    
    return result;
  } catch (err) {
    logger.error({
      err,
      query: text,
      params
    }, 'Query error');
    throw err;
  }
}

/**
 * Insert a single sensor reading into the database
 * @param {Object} reading - Prepared sensor reading
 * @returns {Promise<Object>} - Inserted row
 */
async function insertSensorReading(reading) {
  const queryText = `
    INSERT INTO sensor_readings
    (device_id, timestamp, sensor_type, value, unit, location, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `;
  
  const values = [
    reading.device_id,
    reading.timestamp,
    reading.sensor_type,
    reading.value,
    reading.unit,
    reading.location,
    reading.status,
    reading.created_at
  ];
  
  const result = await query(queryText, values);
  return result.rows[0];
}

/**
 * Insert multiple sensor readings in a batch for better performance
 * @param {Array<Object>} readings - Array of prepared sensor readings
 * @returns {Promise<Object>} - Query result
 */
async function batchInsertSensorReadings(readings) {
  if (!readings.length) {
    return { rowCount: 0 };
  }
  
  // Format SQL for batch insert
  const columns = [
    'device_id', 'timestamp', 'sensor_type', 'value', 
    'unit', 'location', 'status', 'created_at'
  ];
  
  const values = readings.map(r => [
    r.device_id, r.timestamp, r.sensor_type, r.value,
    r.unit, r.location, r.status, r.created_at
  ]);
  
  const queryText = format(
    `INSERT INTO sensor_readings (%s) VALUES %s`,
    columns.join(', '),
    values
  );
  
  const result = await query(queryText);
  logger.info(`Batch inserted ${result.rowCount} sensor readings`);
  return result;
}

/**
 * Ensure a device exists in the database, update if it exists
 * @param {string} deviceId - Device ID
 * @param {Object} deviceInfo - Device information
 * @returns {Promise<Object>} - Query result
 */
async function ensureDeviceExists(deviceId, deviceInfo) {
  const queryText = `
    INSERT INTO devices (
      device_id, device_type, location, status, updated_at
    ) VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (device_id) 
    DO UPDATE SET 
      location = EXCLUDED.location,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING *
  `;
  
  const values = [
    deviceId,
    deviceInfo.deviceType || 'unknown',
    deviceInfo.location || 'unknown',
    deviceInfo.status || 'active'
  ];
  
  const result = await query(queryText, values);
  return result.rows[0];
}

/**
 * Get device information by ID
 * @param {string} deviceId - Device ID
 * @returns {Promise<Object>} - Device information
 */
async function getDeviceById(deviceId) {
  const queryText = `
    SELECT * FROM devices
    WHERE device_id = $1
  `;
  
  const result = await query(queryText, [deviceId]);
  return result.rows[0];
}

/**
 * Close the connection pool
 * @returns {Promise<void>}
 */
async function close() {
  logger.info('Closing PostgreSQL connection pool');
  await pool.end();
}

module.exports = {
  query,
  insertSensorReading,
  batchInsertSensorReadings,
  ensureDeviceExists,
  getDeviceById,
  close
};
