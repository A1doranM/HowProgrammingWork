-- IoT Monitoring System Database Initialization
-- Database: iot_monitoring

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main sensor readings table for time-series data
CREATE TABLE sensor_readings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  sensor_type VARCHAR(50) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device metadata table
CREATE TABLE devices (
  device_id VARCHAR(50) PRIMARY KEY,
  device_type VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  normal_min DECIMAL(10,2),
  normal_max DECIMAL(10,2),
  alert_min DECIMAL(10,2),
  alert_max DECIMAL(10,2),
  unit VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  update_frequency_seconds INTEGER DEFAULT 5,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table for tracking alert lifecycle
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  alert_id VARCHAR(50) UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  device_id VARCHAR(50) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  value DECIMAL(10,2),
  threshold DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  triggered_at TIMESTAMPTZ NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by VARCHAR(100),
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(100),
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated statistics for performance (hourly rollups)
CREATE TABLE device_stats_hourly (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  hour_timestamp TIMESTAMPTZ NOT NULL,
  avg_value DECIMAL(10,2),
  min_value DECIMAL(10,2),
  max_value DECIMAL(10,2),
  count_readings INTEGER,
  std_deviation DECIMAL(10,2),
  trend VARCHAR(20), -- 'increasing', 'decreasing', 'stable'
  anomaly_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System events log for monitoring and debugging
CREATE TABLE system_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(50) UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  service_name VARCHAR(50),
  message TEXT,
  metadata JSONB,
  severity VARCHAR(20) DEFAULT 'info',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions (for future authentication)
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(50),
  username VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
-- Sensor readings indexes for time-series queries
CREATE INDEX idx_sensor_readings_device_timestamp 
ON sensor_readings(device_id, timestamp DESC);

CREATE INDEX idx_sensor_readings_sensor_type 
ON sensor_readings(sensor_type, timestamp DESC);

CREATE INDEX idx_sensor_readings_location 
ON sensor_readings(location, timestamp DESC);

CREATE INDEX idx_sensor_readings_timestamp 
ON sensor_readings(timestamp DESC);

-- Alerts indexes for quick lookups
CREATE INDEX idx_alerts_device_status 
ON alerts(device_id, status);

CREATE INDEX idx_alerts_triggered_at 
ON alerts(triggered_at DESC);

CREATE INDEX idx_alerts_status_severity 
ON alerts(status, severity);

CREATE INDEX idx_alerts_device_type 
ON alerts(device_id, alert_type);

-- Device stats indexes
CREATE UNIQUE INDEX idx_device_stats_hourly_unique 
ON device_stats_hourly(device_id, hour_timestamp);

CREATE INDEX idx_device_stats_device_time 
ON device_stats_hourly(device_id, hour_timestamp DESC);

-- System events indexes
CREATE INDEX idx_system_events_type_timestamp 
ON system_events(event_type, timestamp DESC);

CREATE INDEX idx_system_events_service_timestamp 
ON system_events(service_name, timestamp DESC);

CREATE INDEX idx_system_events_severity 
ON system_events(severity, timestamp DESC);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id 
ON user_sessions(user_id);

CREATE INDEX idx_user_sessions_expires_at 
ON user_sessions(expires_at);

-- Foreign Key Constraints
ALTER TABLE sensor_readings 
ADD CONSTRAINT fk_sensor_readings_device 
FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE;

ALTER TABLE alerts 
ADD CONSTRAINT fk_alerts_device 
FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE;

ALTER TABLE device_stats_hourly 
ADD CONSTRAINT fk_device_stats_device 
FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE;

-- Check Constraints
ALTER TABLE alerts 
ADD CONSTRAINT check_alert_severity 
CHECK (severity IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE alerts 
ADD CONSTRAINT check_alert_status 
CHECK (status IN ('active', 'acknowledged', 'resolved', 'escalated'));

ALTER TABLE devices 
ADD CONSTRAINT check_device_status 
CHECK (status IN ('active', 'inactive', 'maintenance', 'error'));

ALTER TABLE system_events 
ADD CONSTRAINT check_event_severity 
CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical'));

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at 
BEFORE UPDATE ON devices 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at 
BEFORE UPDATE ON alerts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean old data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete sensor readings older than 3 months
    DELETE FROM sensor_readings 
    WHERE timestamp < NOW() - INTERVAL '3 months';
    
    -- Delete resolved alerts older than 6 months
    DELETE FROM alerts 
    WHERE status = 'resolved' AND resolved_at < NOW() - INTERVAL '6 months';
    
    -- Delete system events older than 1 month
    DELETE FROM system_events 
    WHERE timestamp < NOW() - INTERVAL '1 month';
    
    -- Delete expired user sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    RAISE NOTICE 'Old data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- Views for common queries
-- Active devices with latest readings
CREATE VIEW v_devices_latest AS
SELECT 
    d.device_id,
    d.device_type,
    d.location,
    d.status as device_status,
    sr.value as last_value,
    sr.unit,
    sr.timestamp as last_reading_time,
    sr.status as reading_status,
    CASE 
        WHEN sr.timestamp < NOW() - INTERVAL '1 minute' * d.update_frequency_seconds * 2 
        THEN 'offline'
        ELSE 'online'
    END as connectivity_status
FROM devices d
LEFT JOIN LATERAL (
    SELECT value, unit, timestamp, status
    FROM sensor_readings 
    WHERE device_id = d.device_id 
    ORDER BY timestamp DESC 
    LIMIT 1
) sr ON true
WHERE d.status = 'active';

-- Active alerts summary
CREATE VIEW v_alerts_summary AS
SELECT 
    device_id,
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_alerts,
    COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_alerts,
    COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_alerts,
    COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_alerts,
    MIN(triggered_at) as oldest_alert,
    MAX(triggered_at) as newest_alert
FROM alerts 
WHERE status IN ('active', 'acknowledged')
GROUP BY device_id;

-- System health metrics
CREATE VIEW v_system_health AS
SELECT 
    (SELECT COUNT(*) FROM devices WHERE status = 'active') as active_devices,
    (SELECT COUNT(*) FROM devices WHERE status != 'active') as inactive_devices,
    (SELECT COUNT(*) FROM alerts WHERE status IN ('active', 'acknowledged')) as active_alerts,
    (SELECT COUNT(*) FROM sensor_readings WHERE timestamp > NOW() - INTERVAL '1 hour') as readings_last_hour,
    (SELECT COUNT(*) FROM system_events WHERE severity IN ('error', 'critical') AND timestamp > NOW() - INTERVAL '1 hour') as errors_last_hour;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iot_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iot_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO iot_user;

-- Create indexes on JSONB columns for better performance
CREATE INDEX idx_system_events_metadata_gin ON system_events USING GIN (metadata);

COMMIT;
