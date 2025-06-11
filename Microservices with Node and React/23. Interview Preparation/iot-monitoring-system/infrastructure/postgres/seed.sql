-- Seed data for IoT Monitoring System
-- Insert device configurations for the 5 IoT devices

INSERT INTO devices (
    device_id, 
    device_type, 
    location, 
    normal_min, 
    normal_max, 
    alert_min, 
    alert_max, 
    unit, 
    update_frequency_seconds,
    description,
    status
) VALUES 
-- Temperature Sensor
(
    'device-001', 
    'temperature', 
    'assembly-line-1', 
    20.0, 
    80.0, 
    15.0, 
    85.0, 
    'celsius', 
    2,
    'Temperature sensor monitoring ambient temperature on assembly line 1',
    'active'
),
-- Pressure Sensor
(
    'device-002', 
    'pressure', 
    'hydraulic-system-A', 
    10.0, 
    50.0, 
    5.0, 
    55.0, 
    'psi', 
    3,
    'Pressure sensor monitoring hydraulic system pressure levels',
    'active'
),
-- Vibration Sensor
(
    'device-003', 
    'vibration', 
    'motor-unit-3', 
    0.0, 
    100.0, 
    NULL, 
    120.0, 
    'hz', 
    1,
    'Vibration sensor monitoring motor unit for early failure detection',
    'active'
),
-- Production Counter
(
    'device-004', 
    'production', 
    'output-conveyor', 
    100.0, 
    500.0, 
    50.0, 
    NULL, 
    'units/hour', 
    5,
    'Production counter tracking units per hour on output conveyor',
    'active'
),
-- Quality Score Sensor
(
    'device-005', 
    'quality', 
    'quality-control-station', 
    85.0, 
    100.0, 
    80.0, 
    NULL, 
    'percentage', 
    4,
    'Quality control sensor measuring product quality percentage',
    'active'
);

-- Insert some historical system events for testing
INSERT INTO system_events (
    event_type,
    service_name,
    message,
    severity,
    metadata,
    timestamp
) VALUES 
(
    'system_startup',
    'database',
    'Database initialization completed successfully',
    'info',
    '{"tables_created": 6, "indexes_created": 15, "views_created": 3}',
    NOW()
),
(
    'device_registration',
    'device_manager',
    'IoT devices registered successfully',
    'info',
    '{"devices_registered": 5, "device_types": ["temperature", "pressure", "vibration", "production", "quality"]}',
    NOW()
),
(
    'infrastructure_ready',
    'docker_compose',
    'All infrastructure services are healthy and ready',
    'info',
    '{"services": ["postgresql", "redis", "kafka", "zookeeper"], "status": "healthy"}',
    NOW()
);

-- Insert some sample device statistics (for testing dashboards)
INSERT INTO device_stats_hourly (
    device_id,
    hour_timestamp,
    avg_value,
    min_value,
    max_value,
    count_readings,
    std_deviation,
    trend,
    anomaly_count
) VALUES 
-- Temperature device hourly stats
(
    'device-001',
    DATE_TRUNC('hour', NOW() - INTERVAL '1 hour'),
    72.5,
    68.2,
    78.9,
    1800, -- 30 minutes * 60 readings per minute
    3.2,
    'stable',
    2
),
-- Pressure device hourly stats
(
    'device-002',
    DATE_TRUNC('hour', NOW() - INTERVAL '1 hour'),
    35.4,
    28.7,
    42.1,
    1200, -- 20 minutes * 60 readings per minute
    4.1,
    'increasing',
    1
),
-- Vibration device hourly stats
(
    'device-003',
    DATE_TRUNC('hour', NOW() - INTERVAL '1 hour'),
    45.6,
    12.3,
    89.4,
    3600, -- 60 minutes * 60 readings per minute
    15.8,
    'stable',
    0
),
-- Production counter hourly stats
(
    'device-004',
    DATE_TRUNC('hour', NOW() - INTERVAL '1 hour'),
    325.0,
    298.0,
    387.0,
    720, -- 12 minutes * 60 readings per minute
    28.5,
    'stable',
    1
),
-- Quality sensor hourly stats
(
    'device-005',
    DATE_TRUNC('hour', NOW() - INTERVAL '1 hour'),
    94.2,
    87.5,
    98.9,
    900, -- 15 minutes * 60 readings per minute
    3.7,
    'increasing',
    0
);

-- Insert some sample alerts for testing
INSERT INTO alerts (
    device_id,
    alert_type,
    message,
    severity,
    value,
    threshold,
    status,
    triggered_at
) VALUES 
(
    'device-002',
    'threshold_exceeded',
    'Pressure reading above maximum threshold - immediate attention required',
    'high',
    58.5,
    55.0,
    'active',
    NOW() - INTERVAL '15 minutes'
),
(
    'device-004',
    'threshold_below',
    'Production rate below minimum threshold - check conveyor system',
    'medium',
    45.0,
    50.0,
    'acknowledged',
    NOW() - INTERVAL '2 hours'
),
(
    'device-001',
    'data_anomaly',
    'Temperature sensor showing unusual fluctuation patterns',
    'low',
    NULL,
    NULL,
    'resolved',
    NOW() - INTERVAL '6 hours'
);

-- Insert some sample sensor readings for immediate testing
INSERT INTO sensor_readings (
    device_id,
    timestamp,
    sensor_type,
    value,
    unit,
    location,
    status
) VALUES 
-- Recent temperature readings
('device-001', NOW() - INTERVAL '30 seconds', 'temperature', 74.2, 'celsius', 'assembly-line-1', 'active'),
('device-001', NOW() - INTERVAL '1 minute', 'temperature', 73.8, 'celsius', 'assembly-line-1', 'active'),
('device-001', NOW() - INTERVAL '90 seconds', 'temperature', 75.1, 'celsius', 'assembly-line-1', 'active'),

-- Recent pressure readings
('device-002', NOW() - INTERVAL '45 seconds', 'pressure', 52.3, 'psi', 'hydraulic-system-A', 'active'),
('device-002', NOW() - INTERVAL '1 minute 15 seconds', 'pressure', 51.8, 'psi', 'hydraulic-system-A', 'active'),
('device-002', NOW() - INTERVAL '2 minutes', 'pressure', 53.1, 'psi', 'hydraulic-system-A', 'active'),

-- Recent vibration readings
('device-003', NOW() - INTERVAL '20 seconds', 'vibration', 67.4, 'hz', 'motor-unit-3', 'active'),
('device-003', NOW() - INTERVAL '40 seconds', 'vibration', 65.9, 'hz', 'motor-unit-3', 'active'),
('device-003', NOW() - INTERVAL '1 minute', 'vibration', 68.2, 'hz', 'motor-unit-3', 'active'),

-- Recent production readings
('device-004', NOW() - INTERVAL '2 minutes', 'production', 342.0, 'units/hour', 'output-conveyor', 'active'),
('device-004', NOW() - INTERVAL '4 minutes', 'production', 338.5, 'units/hour', 'output-conveyor', 'active'),
('device-004', NOW() - INTERVAL '6 minutes', 'production', 341.2, 'units/hour', 'output-conveyor', 'active'),

-- Recent quality readings
('device-005', NOW() - INTERVAL '1 minute 30 seconds', 'quality', 93.7, 'percentage', 'quality-control-station', 'active'),
('device-005', NOW() - INTERVAL '3 minutes', 'quality', 94.2, 'percentage', 'quality-control-station', 'active'),
('device-005', NOW() - INTERVAL '4 minutes 30 seconds', 'quality', 92.8, 'percentage', 'quality-control-station', 'active');

-- Commit all seed data
COMMIT;
