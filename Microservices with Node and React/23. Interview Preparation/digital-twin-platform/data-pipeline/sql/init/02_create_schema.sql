-- Digital Twin Database - Core Schema
-- This script creates the main database schema for time-series sensor data and event sourcing

-- =============================================================================
-- SCHEMA CREATION
-- =============================================================================

-- Create dedicated schemas for different data domains
CREATE SCHEMA IF NOT EXISTS manufacturing;
CREATE SCHEMA IF NOT EXISTS events;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS monitoring;

-- Set search path
SET search_path TO manufacturing, events, analytics, public;

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

-- Sensor types enumeration
CREATE TYPE manufacturing.sensor_type AS ENUM (
    'temperature',
    'pressure',
    'vibration',
    'humidity',
    'speed',
    'power',
    'torque',
    'current'
);

-- Data quality indicators
CREATE TYPE manufacturing.data_quality AS ENUM (
    'good',
    'poor',
    'bad',
    'uncertain'
);

-- Machine status enumeration
CREATE TYPE manufacturing.machine_status AS ENUM (
    'running',
    'idle',
    'maintenance',
    'error',
    'offline'
);

-- Event types for event sourcing
CREATE TYPE events.event_type AS ENUM (
    'sensor_reading_received',
    'machine_status_changed',
    'maintenance_scheduled',
    'alert_triggered',
    'calibration_performed'
);

-- =============================================================================
-- MAIN TABLES
-- =============================================================================

-- Machines registry table
CREATE TABLE manufacturing.machines (
    machine_id VARCHAR(20) PRIMARY KEY CHECK (machine_id ~ '^[A-Z]{3}-\d{3}$'),
    machine_name VARCHAR(100) NOT NULL,
    machine_type VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    installation_date DATE,
    last_maintenance_date TIMESTAMP WITH TIME ZONE,
    status manufacturing.machine_status DEFAULT 'offline',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sensor readings table (partitioned by time)
CREATE TABLE manufacturing.sensor_readings (
    id UUID DEFAULT uuid_generate_v4(),
    machine_id VARCHAR(20) NOT NULL,
    sensor_type manufacturing.sensor_type NOT NULL,
    value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    quality manufacturing.data_quality DEFAULT 'good',
    timestamp_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT sensor_readings_pkey PRIMARY KEY (id, timestamp_utc),
    CONSTRAINT fk_machine_id FOREIGN KEY (machine_id) REFERENCES manufacturing.machines(machine_id),
    CONSTRAINT valid_timestamp CHECK (timestamp_utc <= CURRENT_TIMESTAMP + INTERVAL '1 hour'),
    CONSTRAINT reasonable_value CHECK (value BETWEEN -1000000 AND 1000000)
) PARTITION BY RANGE (timestamp_utc);

-- Aggregated sensor data for analytics (partitioned by time)
CREATE TABLE analytics.sensor_aggregates (
    id UUID DEFAULT uuid_generate_v4(),
    machine_id VARCHAR(20) NOT NULL,
    sensor_type manufacturing.sensor_type NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    window_duration INTERVAL NOT NULL,
    
    -- Statistical aggregations
    count_readings INTEGER NOT NULL,
    avg_value NUMERIC(12, 4),
    min_value NUMERIC(12, 4),
    max_value NUMERIC(12, 4),
    stddev_value NUMERIC(12, 4),
    percentile_50 NUMERIC(12, 4),
    percentile_95 NUMERIC(12, 4),
    percentile_99 NUMERIC(12, 4),
    
    -- Quality metrics
    good_readings INTEGER DEFAULT 0,
    poor_readings INTEGER DEFAULT 0,
    bad_readings INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT sensor_aggregates_pkey PRIMARY KEY (id, window_start),
    CONSTRAINT fk_machine_id FOREIGN KEY (machine_id) REFERENCES manufacturing.machines(machine_id),
    CONSTRAINT valid_window CHECK (window_end > window_start),
    CONSTRAINT positive_count CHECK (count_readings > 0)
) PARTITION BY RANGE (window_start);

-- =============================================================================
-- EVENT SOURCING TABLES
-- =============================================================================

-- Event store for complete audit trail
CREATE TABLE events.event_store (
    event_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aggregate_id VARCHAR(100) NOT NULL, -- machine_id or other entity ID
    aggregate_type VARCHAR(50) NOT NULL, -- 'machine', 'sensor', etc.
    event_type events.event_type NOT NULL,
    event_version INTEGER NOT NULL DEFAULT 1,
    event_data JSONB NOT NULL,
    event_metadata JSONB DEFAULT '{}',
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_aggregate_version UNIQUE (aggregate_id, event_version),
    CONSTRAINT valid_occurred_at CHECK (occurred_at <= CURRENT_TIMESTAMP + INTERVAL '1 hour')
);

-- Event snapshots for performance optimization
CREATE TABLE events.aggregate_snapshots (
    snapshot_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aggregate_id VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    snapshot_version INTEGER NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_aggregate_snapshot UNIQUE (aggregate_id, snapshot_version)
);

-- =============================================================================
-- MONITORING TABLES
-- =============================================================================

-- System health metrics
CREATE TABLE monitoring.system_health (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(12, 4) NOT NULL,
    metric_unit VARCHAR(20),
    timestamp_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Data pipeline metrics
CREATE TABLE monitoring.pipeline_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pipeline_stage VARCHAR(50) NOT NULL, -- 'mqtt_ingestion', 'kafka_processing', etc.
    messages_processed INTEGER DEFAULT 0,
    messages_failed INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    throughput_per_second NUMERIC(10, 2),
    timestamp_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Machine indexes
CREATE INDEX idx_machines_status ON manufacturing.machines(status);
CREATE INDEX idx_machines_type ON manufacturing.machines(machine_type);
CREATE INDEX idx_machines_location ON manufacturing.machines(location);

-- Sensor readings indexes (will be inherited by partitions)
CREATE INDEX idx_sensor_readings_machine_time ON manufacturing.sensor_readings(machine_id, timestamp_utc DESC);
CREATE INDEX idx_sensor_readings_sensor_type ON manufacturing.sensor_readings(sensor_type, timestamp_utc DESC);
CREATE INDEX idx_sensor_readings_quality ON manufacturing.sensor_readings(quality);
CREATE INDEX idx_sensor_readings_received_at ON manufacturing.sensor_readings(received_at DESC);

-- GIN indexes for JSONB metadata
CREATE INDEX idx_sensor_readings_metadata_gin ON manufacturing.sensor_readings USING GIN(metadata);
CREATE INDEX idx_machines_metadata_gin ON manufacturing.machines USING GIN(metadata);

-- Event store indexes
CREATE INDEX idx_event_store_aggregate ON events.event_store(aggregate_id, event_version DESC);
CREATE INDEX idx_event_store_type ON events.event_store(event_type, occurred_at DESC);
CREATE INDEX idx_event_store_occurred_at ON events.event_store(occurred_at DESC);
CREATE INDEX idx_event_store_data_gin ON events.event_store USING GIN(event_data);

-- Aggregates indexes
CREATE INDEX idx_sensor_aggregates_machine_window ON analytics.sensor_aggregates(machine_id, window_start DESC);
CREATE INDEX idx_sensor_aggregates_type_window ON analytics.sensor_aggregates(sensor_type, window_start DESC);

-- Monitoring indexes
CREATE INDEX idx_system_health_service_time ON monitoring.system_health(service_name, timestamp_utc DESC);
CREATE INDEX idx_pipeline_metrics_stage_time ON monitoring.pipeline_metrics(pipeline_stage, timestamp_utc DESC);

-- =============================================================================
-- FUNCTIONS AND PROCEDURES
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for machines table
CREATE TRIGGER update_machines_updated_at 
    BEFORE UPDATE ON manufacturing.machines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate sensor readings
CREATE OR REPLACE FUNCTION validate_sensor_reading()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate temperature ranges
    IF NEW.sensor_type = 'temperature' THEN
        IF NEW.value < -50 OR NEW.value > 200 THEN
            RAISE EXCEPTION 'Temperature value % out of valid range (-50 to 200)', NEW.value;
        END IF;
    END IF;
    
    -- Validate pressure ranges
    IF NEW.sensor_type = 'pressure' THEN
        IF NEW.value < 0 OR NEW.value > 500 THEN
            RAISE EXCEPTION 'Pressure value % out of valid range (0 to 500)', NEW.value;
        END IF;
    END IF;
    
    -- Validate humidity ranges
    IF NEW.sensor_type = 'humidity' THEN
        IF NEW.value < 0 OR NEW.value > 100 THEN
            RAISE EXCEPTION 'Humidity value % out of valid range (0 to 100)', NEW.value;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sensor readings validation
CREATE TRIGGER validate_sensor_reading_trigger
    BEFORE INSERT ON manufacturing.sensor_readings
    FOR EACH ROW EXECUTE FUNCTION validate_sensor_reading();

-- Function to create monthly partitions
CREATE OR REPLACE FUNCTION create_monthly_partitions(
    start_date DATE,
    end_date DATE
) RETURNS VOID AS $$
DECLARE
    current_date DATE := start_date;
    partition_name TEXT;
    start_range TEXT;
    end_range TEXT;
BEGIN
    WHILE current_date < end_date LOOP
        -- Sensor readings partitions
        partition_name := 'sensor_readings_' || to_char(current_date, 'YYYY_MM');
        start_range := quote_literal(current_date);
        end_range := quote_literal(current_date + INTERVAL '1 month');
        
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS manufacturing.%I PARTITION OF manufacturing.sensor_readings
             FOR VALUES FROM (%s) TO (%s)',
            partition_name, start_range, end_range
        );
        
        -- Sensor aggregates partitions
        partition_name := 'sensor_aggregates_' || to_char(current_date, 'YYYY_MM');
        
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS analytics.%I PARTITION OF analytics.sensor_aggregates
             FOR VALUES FROM (%s) TO (%s)',
            partition_name, start_range, end_range
        );
        
        current_date := current_date + INTERVAL '1 month';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create partitions for current and next 12 months
SELECT create_monthly_partitions(
    date_trunc('month', CURRENT_DATE),
    date_trunc('month', CURRENT_DATE + INTERVAL '13 months')
);

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Insert sample machines
INSERT INTO manufacturing.machines (machine_id, machine_name, machine_type, location, manufacturer, model) VALUES
('CNC-001', 'CNC Milling Machine 1', 'CNC_MILL', 'Workshop A', 'Haas Automation', 'VF-2SS'),
('CNC-002', 'CNC Milling Machine 2', 'CNC_MILL', 'Workshop A', 'Haas Automation', 'VF-3SS'),
('CNC-003', 'CNC Lathe 1', 'CNC_LATHE', 'Workshop B', 'Mazak Corporation', 'QUICK TURN 250MSY'),
('CNC-004', 'CNC Lathe 2', 'CNC_LATHE', 'Workshop B', 'Mazak Corporation', 'QUICK TURN 300MSY'),
('CNC-005', '3D Printer 1', '3D_PRINTER', 'Prototyping Lab', 'Stratasys', 'F370')
ON CONFLICT (machine_id) DO NOTHING;

-- Log successful schema creation
DO $$
BEGIN
    RAISE NOTICE 'Digital Twin Database Schema Created Successfully';
    RAISE NOTICE 'Schemas: manufacturing, events, analytics, monitoring';
    RAISE NOTICE 'Tables: machines, sensor_readings, sensor_aggregates, event_store';
    RAISE NOTICE 'Partitions: Created for 13 months';
    RAISE NOTICE 'Sample Data: 5 machines inserted';
END $$;
