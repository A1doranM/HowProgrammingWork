const config = {
  port: process.env.PORT || 3004,
  
  kafka: {
    clientId: 'alert-processing',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    groupId: 'alert-processing-group',
    topics: {
      sensors: 'sensors-data',
      alerts: 'alerts'
    },
    consumer: {
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxBytesPerPartition: 1048576,
      minBytes: 1,
      maxBytes: 10485760,
      maxWaitTimeInMs: 5000
    },
    producer: {
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    }
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3
  },
  
  alerts: {
    evaluationIntervalMs: 5000,        // How often to check for alerts
    escalationTimeoutMs: 300000,       // 5 minutes - when to escalate unacknowledged alerts
    deduplicationWindowMs: 60000,      // 1 minute - prevent duplicate alerts
    maxActiveAlertsPerDevice: 10,      // Prevent alert spam
    retentionDays: 30                  // How long to keep resolved alerts
  },
  
  // Device-specific alert thresholds
  thresholds: {
    'device-001': { 
      min: 15, 
      max: 85, 
      type: 'temperature', 
      unit: 'celsius',
      location: 'assembly-line-1'
    },
    'device-002': { 
      min: 5, 
      max: 55, 
      type: 'pressure', 
      unit: 'psi',
      location: 'hydraulic-system-A'
    },
    'device-003': { 
      min: 0, 
      max: 120, 
      type: 'vibration', 
      unit: 'hz',
      location: 'motor-unit-3'
    },
    'device-004': { 
      min: 50, 
      max: 1000, 
      type: 'production', 
      unit: 'units/hour',
      location: 'production-line-1'
    },
    'device-005': { 
      min: 80, 
      max: 100, 
      type: 'quality', 
      unit: 'percentage',
      location: 'quality-control-station'
    }
  },
  
  // Severity calculation parameters
  severity: {
    critical: { threshold: 0.3, color: '#ff0000' },  // 30% deviation
    high: { threshold: 0.2, color: '#ff6600' },      // 20% deviation
    medium: { threshold: 0.1, color: '#ffaa00' },    // 10% deviation
    low: { threshold: 0.05, color: '#ffff00' }       // 5% deviation
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.NODE_ENV !== 'production'
  }
};

module.exports = config;
