/**
 * SensorReading Entity for TypeORM
 * Represents IoT sensor readings time-series data
 */

const { EntitySchema } = require('typeorm');

const SensorReading = new EntitySchema({
  name: 'SensorReading',
  tableName: 'sensor_readings',
  columns: {
    id: {
      type: 'integer',
      primary: true,
      generated: 'increment'
    },
    device_id: {
      type: 'varchar',
      length: 50,
      nullable: false
    },
    timestamp: {
      type: 'timestamptz',
      nullable: false
    },
    sensor_type: {
      type: 'varchar',
      length: 50,
      nullable: false
    },
    value: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false
    },
    unit: {
      type: 'varchar',
      length: 20,
      nullable: false
    },
    location: {
      type: 'varchar',
      length: 100,
      nullable: true
    },
    status: {
      type: 'varchar',
      length: 20,
      default: 'active'
    },
    created_at: {
      type: 'timestamptz',
      createDate: true
    }
  },
  indices: [
    { name: 'idx_sensor_readings_device_timestamp', columns: ['device_id', 'timestamp'] },
    { name: 'idx_sensor_readings_sensor_type', columns: ['sensor_type', 'timestamp'] },
    { name: 'idx_sensor_readings_location', columns: ['location', 'timestamp'] },
    { name: 'idx_sensor_readings_timestamp', columns: ['timestamp'] }
  ],
  relations: {
    device: {
      type: 'many-to-one',
      target: 'Device',
      joinColumn: {
        name: 'device_id',
        referencedColumnName: 'device_id'
      },
      onDelete: 'CASCADE'
    }
  }
});

module.exports = SensorReading;
