/**
 * Database Connection Management for TypeORM
 * Manages the connection to PostgreSQL
 */

const { DataSource } = require('typeorm');
const config = require('../config');
const logger = require('../utils/logger');
const { Device, SensorReading } = require('./entities');

// Require reflect-metadata for TypeORM decorators
require('reflect-metadata');

// Create a new TypeORM data source
const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.postgres.host,
  port: config.postgres.port,
  username: config.postgres.user,
  password: config.postgres.password,
  database: config.postgres.database,
  synchronize: false, // Don't auto-create tables in production
  logging: config.service.environment === 'development',
  entities: [Device, SensorReading],
  subscribers: [],
  migrations: [],
  ssl: config.postgres.ssl
});

/**
 * Initialize the database connection
 * @returns {Promise<DataSource>} The initialized data source
 */
async function initializeDatabase() {
  try {
    logger.info('Initializing database connection');
    await AppDataSource.initialize();
    logger.info('Database connection established');
    return AppDataSource;
  } catch (error) {
    logger.error({ error }, 'Error during database initialization');
    throw error;
  }
}

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
async function closeDatabase() {
  try {
    if (AppDataSource.isInitialized) {
      logger.info('Closing database connection');
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error({ error }, 'Error during database shutdown');
    throw error;
  }
}

module.exports = {
  AppDataSource,
  initializeDatabase,
  closeDatabase
};
