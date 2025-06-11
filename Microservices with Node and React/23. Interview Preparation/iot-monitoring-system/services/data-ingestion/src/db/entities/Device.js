/**
 * Device Entity for TypeORM
 * Represents IoT device metadata
 */

const { EntitySchema } = require('typeorm');

const Device = new EntitySchema({
  name: 'Device',
  tableName: 'devices',
  columns: {
    device_id: {
      type: 'varchar',
      length: 50,
      primary: true
    },
    device_type: {
      type: 'varchar',
      length: 50,
      nullable: false
    },
    location: {
      type: 'varchar',
      length: 100,
      nullable: false
    },
    normal_min: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true
    },
    normal_max: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true
    },
    alert_min: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true
    },
    alert_max: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true
    },
    unit: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    status: {
      type: 'varchar',
      length: 20,
      default: 'active'
    },
    update_frequency_seconds: {
      type: 'integer',
      default: 5
    },
    description: {
      type: 'text',
      nullable: true
    },
    created_at: {
      type: 'timestamptz',
      createDate: true
    },
    updated_at: {
      type: 'timestamptz',
      updateDate: true
    }
  },
  checks: [
    { expression: `status IN ('active', 'inactive', 'maintenance', 'error')` }
  ],
  indices: [
    { name: 'idx_device_status', columns: ['status'] },
    { name: 'idx_device_location', columns: ['location'] }
  ],
  relations: {
    readings: {
      type: 'one-to-many',
      target: 'SensorReading',
      inverseSide: 'device',
      cascade: true
    }
  }
});

module.exports = Device;
