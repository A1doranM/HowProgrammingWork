"""
Configuration management for the Digital Twin Data Pipeline
"""
import os
from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Global settings for data pipeline services"""
    
    # =========================================================================
    # Service Configuration
    # =========================================================================
    service_name: str = "digital-twin-pipeline"
    version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"
    
    # =========================================================================
    # MQTT Configuration
    # =========================================================================
    mqtt_broker_host: str = "localhost"
    mqtt_broker_port: int = 1883
    mqtt_client_id_prefix: str = "digital_twin_"
    mqtt_keepalive: int = 60
    mqtt_qos: int = 1
    mqtt_retain: bool = False
    mqtt_clean_session: bool = True
    
    # MQTT Topics
    mqtt_topic_prefix: str = "manufacturing"
    mqtt_sensor_topic_template: str = "{prefix}/{machine_id}/{sensor_type}"
    mqtt_machine_status_topic: str = "manufacturing/status"
    mqtt_alert_topic: str = "manufacturing/alerts"
    
    # =========================================================================
    # Kafka Configuration
    # =========================================================================
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_client_id: str = "digital-twin-client"
    kafka_group_id: str = "digital-twin-group"
    kafka_auto_offset_reset: str = "latest"
    kafka_enable_auto_commit: bool = False
    kafka_session_timeout_ms: int = 30000
    kafka_heartbeat_interval_ms: int = 10000
    kafka_max_poll_records: int = 500
    kafka_fetch_max_wait_ms: int = 500
    
    # Kafka Topics
    kafka_sensor_readings_topic: str = "sensor-readings"
    kafka_machine_status_topic: str = "machine-status"
    kafka_events_topic: str = "events"
    kafka_aggregates_topic: str = "sensor-aggregates"
    kafka_alerts_topic: str = "alerts"
    kafka_dead_letter_topic: str = "dead-letter-queue"
    
    # Kafka Partitions and Replication
    kafka_partitions: int = 3
    kafka_replication_factor: int = 1
    kafka_compression_type: str = "gzip"
    
    # Producer Configuration
    kafka_producer_acks: str = "all"
    kafka_producer_retries: int = 3
    kafka_producer_retry_backoff_ms: int = 1000
    kafka_producer_batch_size: int = 16384
    kafka_producer_linger_ms: int = 10
    kafka_producer_buffer_memory: int = 33554432
    
    # Consumer Configuration
    kafka_consumer_fetch_min_bytes: int = 1
    kafka_consumer_fetch_max_bytes: int = 52428800
    kafka_consumer_max_partition_fetch_bytes: int = 1048576
    
    # =========================================================================
    # PostgreSQL Configuration
    # =========================================================================
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/digital_twin"
    database_pool_size: int = 20
    database_max_overflow: int = 0
    database_pool_timeout: int = 30
    database_pool_recycle: int = 3600
    database_echo: bool = False
    
    # =========================================================================
    # Redis Configuration
    # =========================================================================
    redis_url: str = "redis://localhost:6379/0"
    redis_pool_size: int = 10
    redis_socket_timeout: int = 5
    redis_socket_connect_timeout: int = 5
    redis_retry_on_timeout: bool = True
    
    # =========================================================================
    # Stream Processing Configuration
    # =========================================================================
    # Windowing configuration
    aggregation_window_seconds: int = 10
    aggregation_overlap_seconds: int = 2
    max_aggregation_delay_seconds: int = 30
    
    # Batch processing
    batch_size: int = 100
    batch_timeout_seconds: int = 5
    max_batch_size: int = 1000
    
    # Error handling
    max_retry_attempts: int = 3
    retry_backoff_seconds: int = 2
    dead_letter_queue_enabled: bool = True
    
    # =========================================================================
    # Monitoring and Health
    # =========================================================================
    health_check_interval_seconds: int = 30
    metrics_collection_interval_seconds: int = 10
    metrics_retention_days: int = 7
    
    # Alerting thresholds
    error_rate_threshold: float = 0.05  # 5%
    latency_threshold_seconds: float = 5.0
    cpu_threshold_percent: float = 80.0
    memory_threshold_percent: float = 80.0
    
    # =========================================================================
    # Security Configuration
    # =========================================================================
    # MQTT Security (for production)
    mqtt_username: Optional[str] = None
    mqtt_password: Optional[str] = None
    mqtt_ca_cert_file: Optional[str] = None
    mqtt_cert_file: Optional[str] = None
    mqtt_key_file: Optional[str] = None
    
    # Kafka Security (for production)
    kafka_security_protocol: str = "PLAINTEXT"
    kafka_sasl_mechanism: Optional[str] = None
    kafka_sasl_username: Optional[str] = None
    kafka_sasl_password: Optional[str] = None
    kafka_ssl_ca_location: Optional[str] = None
    kafka_ssl_certificate_location: Optional[str] = None
    kafka_ssl_key_location: Optional[str] = None
    
    # =========================================================================
    # Development and Testing
    # =========================================================================
    enable_simulator: bool = False
    simulator_machines: List[str] = ["CNC-001", "CNC-002", "CNC-003", "CNC-004", "CNC-005"]
    simulator_sensors_per_machine: int = 5
    simulator_publish_interval_seconds: int = 2
    simulator_value_variance: float = 0.1  # 10% variance
    
    # Testing configuration
    test_mode: bool = False
    test_database_url: Optional[str] = None
    test_kafka_bootstrap_servers: Optional[str] = None
    test_mqtt_broker_host: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    def get_mqtt_topic(self, machine_id: str, sensor_type: str) -> str:
        """Generate MQTT topic for sensor readings"""
        return self.mqtt_sensor_topic_template.format(
            prefix=self.mqtt_topic_prefix,
            machine_id=machine_id,
            sensor_type=sensor_type
        )
    
    def get_kafka_consumer_config(self) -> dict:
        """Get Kafka consumer configuration"""
        config = {
            'bootstrap_servers': self.kafka_bootstrap_servers,
            'client_id': f"{self.kafka_client_id}-consumer",
            'group_id': self.kafka_group_id,
            'auto_offset_reset': self.kafka_auto_offset_reset,
            'enable_auto_commit': self.kafka_enable_auto_commit,
            'session_timeout_ms': self.kafka_session_timeout_ms,
            'heartbeat_interval_ms': self.kafka_heartbeat_interval_ms,
            'max_poll_records': self.kafka_max_poll_records,
            'fetch_max_wait_ms': self.kafka_fetch_max_wait_ms,
            'fetch_min_bytes': self.kafka_consumer_fetch_min_bytes,
            'fetch_max_bytes': self.kafka_consumer_fetch_max_bytes,
            'max_partition_fetch_bytes': self.kafka_consumer_max_partition_fetch_bytes,
        }
        
        # Add security configuration if enabled
        if self.kafka_security_protocol != "PLAINTEXT":
            config.update({
                'security_protocol': self.kafka_security_protocol,
                'sasl_mechanism': self.kafka_sasl_mechanism,
                'sasl_plain_username': self.kafka_sasl_username,
                'sasl_plain_password': self.kafka_sasl_password,
            })
            
        return config
    
    def get_kafka_producer_config(self) -> dict:
        """Get Kafka producer configuration"""
        config = {
            'bootstrap_servers': self.kafka_bootstrap_servers,
            'client_id': f"{self.kafka_client_id}-producer",
            'acks': self.kafka_producer_acks,
            'retries': self.kafka_producer_retries,
            'retry_backoff_ms': self.kafka_producer_retry_backoff_ms,
            'batch_size': self.kafka_producer_batch_size,
            'linger_ms': self.kafka_producer_linger_ms,
            'buffer_memory': self.kafka_producer_buffer_memory,
            'compression_type': self.kafka_compression_type,
        }
        
        # Add security configuration if enabled
        if self.kafka_security_protocol != "PLAINTEXT":
            config.update({
                'security_protocol': self.kafka_security_protocol,
                'sasl_mechanism': self.kafka_sasl_mechanism,
                'sasl_plain_username': self.kafka_sasl_username,
                'sasl_plain_password': self.kafka_sasl_password,
            })
            
        return config


class MQTTBridgeSettings(Settings):
    """Settings specific to MQTT-Kafka bridge"""
    service_name: str = "mqtt-kafka-bridge"
    
    # Bridge specific settings
    bridge_buffer_size: int = 1000
    bridge_flush_interval_seconds: int = 1
    bridge_max_concurrent_messages: int = 100
    
    # Topic mapping
    mqtt_to_kafka_topic_mapping: dict = {
        f"manufacturing/+/temperature": "sensor-readings",
        f"manufacturing/+/pressure": "sensor-readings", 
        f"manufacturing/+/vibration": "sensor-readings",
        f"manufacturing/+/humidity": "sensor-readings",
        f"manufacturing/+/speed": "sensor-readings",
        f"manufacturing/+/power": "sensor-readings",
        f"manufacturing/+/torque": "sensor-readings",
        f"manufacturing/+/current": "sensor-readings",
        f"manufacturing/status": "machine-status",
        f"manufacturing/alerts": "alerts"
    }


class StreamProcessorSettings(Settings):
    """Settings specific to stream processor"""
    service_name: str = "stream-processor"
    
    # Processing configuration
    processor_parallelism: int = 4
    processor_buffer_size: int = 10000
    processor_checkpoint_interval_seconds: int = 60
    
    # Aggregation configuration
    enable_real_time_aggregation: bool = True
    aggregation_functions: List[str] = ["avg", "min", "max", "count", "stddev", "percentiles"]
    percentiles: List[float] = [0.5, 0.95, 0.99]


class EventStoreSettings(Settings):
    """Settings specific to event store"""
    service_name: str = "event-store"
    
    # Event store configuration
    enable_snapshots: bool = True
    snapshot_frequency: int = 100  # Create snapshot every N events
    event_retention_days: int = 365
    snapshot_retention_days: int = 30
    snapshot_management_interval_seconds: int = 300  # 5 minutes
    
    # Performance tuning
    event_batch_size: int = 50
    event_commit_interval_seconds: int = 5
    
    # Event processing
    enable_event_replay: bool = True
    max_events_per_query: int = 1000
    event_processing_timeout_seconds: int = 30


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


@lru_cache()
def get_mqtt_bridge_settings() -> MQTTBridgeSettings:
    """Get cached MQTT bridge settings"""
    return MQTTBridgeSettings()


@lru_cache()
def get_stream_processor_settings() -> StreamProcessorSettings:
    """Get cached stream processor settings"""
    return StreamProcessorSettings()


@lru_cache()
def get_event_store_settings() -> EventStoreSettings:
    """Get cached event store settings"""
    return EventStoreSettings()


# Environment detection utilities
def is_development() -> bool:
    """Check if running in development mode"""
    return os.getenv("ENV", "development").lower() == "development"


def is_production() -> bool:
    """Check if running in production mode"""
    return os.getenv("ENV", "development").lower() == "production"


def is_testing() -> bool:
    """Check if running in test mode"""
    return os.getenv("ENV", "development").lower() == "testing"
