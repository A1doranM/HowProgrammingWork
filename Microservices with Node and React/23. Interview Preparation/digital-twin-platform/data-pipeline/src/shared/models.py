"""
Shared Pydantic models for the Digital Twin Data Pipeline
"""
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any, List
from uuid import UUID

from pydantic import BaseModel, Field, validator
import orjson


class SensorType(str, Enum):
    """Enumeration of supported sensor types"""
    TEMPERATURE = "temperature"
    PRESSURE = "pressure"
    VIBRATION = "vibration"
    HUMIDITY = "humidity"
    SPEED = "speed"
    POWER = "power"
    TORQUE = "torque"
    CURRENT = "current"


class DataQuality(str, Enum):
    """Data quality indicators"""
    GOOD = "good"
    POOR = "poor"
    BAD = "bad"
    UNCERTAIN = "uncertain"


class MachineStatus(str, Enum):
    """Machine status enumeration"""
    RUNNING = "running"
    IDLE = "idle"
    MAINTENANCE = "maintenance"
    ERROR = "error"
    OFFLINE = "offline"


class EventType(str, Enum):
    """Event types for event sourcing"""
    SENSOR_READING_RECEIVED = "sensor_reading_received"
    MACHINE_STATUS_CHANGED = "machine_status_changed"
    MAINTENANCE_SCHEDULED = "maintenance_scheduled"
    ALERT_TRIGGERED = "alert_triggered"
    CALIBRATION_PERFORMED = "calibration_performed"


class BaseMessage(BaseModel):
    """Base message model with common fields"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    correlation_id: Optional[str] = None
    source_service: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        
    def to_json_bytes(self) -> bytes:
        """Serialize to JSON bytes using orjson for performance"""
        return orjson.dumps(
            self.dict(),
            option=orjson.OPT_UTC_Z | orjson.OPT_SERIALIZE_DATETIME
        )


class SensorReading(BaseMessage):
    """Model for individual sensor readings"""
    machine_id: str = Field(..., pattern=r'^[A-Z]{3}-\d{3}$', description="Machine identifier (e.g., CNC-001)")
    sensor_type: SensorType = Field(..., description="Type of sensor measurement")
    value: float = Field(..., ge=-1000000, le=1000000, description="Sensor reading value")
    unit: str = Field(..., max_length=20, description="Measurement unit")
    quality: DataQuality = Field(default=DataQuality.GOOD, description="Data quality indicator")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    
    @validator('value')
    def validate_sensor_value(cls, v, values):
        """Validate sensor values based on type"""
        sensor_type = values.get('sensor_type')
        
        if sensor_type == SensorType.TEMPERATURE:
            if v < -50 or v > 200:
                raise ValueError('Temperature must be between -50°C and 200°C')
        elif sensor_type == SensorType.PRESSURE:
            if v < 0 or v > 500:
                raise ValueError('Pressure must be between 0 and 500 bar')
        elif sensor_type == SensorType.HUMIDITY:
            if v < 0 or v > 100:
                raise ValueError('Humidity must be between 0% and 100%')
        elif sensor_type == SensorType.SPEED:
            if v < 0:
                raise ValueError('Speed cannot be negative')
        elif sensor_type == SensorType.POWER:
            if v < 0:
                raise ValueError('Power cannot be negative')
        elif sensor_type == SensorType.CURRENT:
            if v < 0:
                raise ValueError('Current cannot be negative')
                
        return v
    
    @validator('metadata')
    def validate_metadata(cls, v):
        """Validate and sanitize metadata"""
        if v is None:
            return v
        
        # Limit metadata size
        if len(str(v)) > 1000:
            raise ValueError("Metadata too large (max 1000 characters)")
        
        return v


class MachineInfo(BaseMessage):
    """Model for machine information"""
    machine_id: str = Field(..., pattern=r'^[A-Z]{3}-\d{3}$')
    machine_name: str = Field(..., max_length=100)
    machine_type: str = Field(..., max_length=50)
    location: Optional[str] = Field(None, max_length=100)
    manufacturer: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    status: MachineStatus = Field(default=MachineStatus.OFFLINE)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class SensorAggregate(BaseMessage):
    """Model for aggregated sensor data"""
    machine_id: str = Field(..., pattern=r'^[A-Z]{3}-\d{3}$')
    sensor_type: SensorType
    window_start: datetime
    window_end: datetime
    window_duration_seconds: int
    
    # Statistical aggregations
    count_readings: int = Field(..., ge=1)
    avg_value: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    stddev_value: Optional[float] = None
    percentile_50: Optional[float] = None
    percentile_95: Optional[float] = None
    percentile_99: Optional[float] = None
    
    # Quality metrics
    good_readings: int = Field(default=0, ge=0)
    poor_readings: int = Field(default=0, ge=0)
    bad_readings: int = Field(default=0, ge=0)
    
    @validator('window_end')
    def validate_window_end(cls, v, values):
        """Ensure window_end is after window_start"""
        if 'window_start' in values and v <= values['window_start']:
            raise ValueError('window_end must be after window_start')
        return v


class EventMessage(BaseMessage):
    """Model for event sourcing messages"""
    event_id: Optional[UUID] = None
    aggregate_id: str = Field(..., description="Entity ID (machine_id, etc.)")
    aggregate_type: str = Field(..., description="Entity type (machine, sensor, etc.)")
    event_type: EventType
    event_version: int = Field(default=1, ge=1)
    event_data: Dict[str, Any] = Field(..., description="Event payload")
    event_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    occurred_at: datetime = Field(default_factory=datetime.utcnow)


class MQTTMessage(BaseMessage):
    """Model for MQTT messages"""
    topic: str = Field(..., description="MQTT topic")
    payload: Dict[str, Any] = Field(..., description="Message payload")
    qos: int = Field(default=1, ge=0, le=2, description="QoS level")
    retain: bool = Field(default=False, description="Retain flag")


class KafkaMessage(BaseMessage):
    """Model for Kafka messages"""
    topic: str = Field(..., description="Kafka topic")
    key: Optional[str] = Field(None, description="Message key for partitioning")
    value: Dict[str, Any] = Field(..., description="Message value")
    partition: Optional[int] = Field(None, ge=0, description="Target partition")
    headers: Optional[Dict[str, str]] = Field(default_factory=dict)


class HealthCheck(BaseModel):
    """Model for health check responses"""
    service_name: str
    status: str  # "healthy", "unhealthy", "degraded"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0.0"
    uptime_seconds: Optional[float] = None
    
    # Component health
    components: Dict[str, str] = Field(default_factory=dict)
    
    # Metrics
    metrics: Optional[Dict[str, float]] = Field(default_factory=dict)
    
    # Additional info
    details: Optional[Dict[str, Any]] = Field(default_factory=dict)


class PipelineMetrics(BaseMessage):
    """Model for pipeline performance metrics"""
    service_name: str
    pipeline_stage: str
    messages_processed: int = Field(default=0, ge=0)
    messages_failed: int = Field(default=0, ge=0)
    processing_time_ms: Optional[float] = Field(None, ge=0)
    throughput_per_second: Optional[float] = Field(None, ge=0)
    error_rate: Optional[float] = Field(None, ge=0, le=1)
    
    # Resource utilization
    cpu_percent: Optional[float] = Field(None, ge=0, le=100)
    memory_mb: Optional[float] = Field(None, ge=0)
    
    # Custom metrics
    custom_metrics: Optional[Dict[str, float]] = Field(default_factory=dict)


class AlertMessage(BaseMessage):
    """Model for alert messages"""
    alert_id: str
    alert_type: str  # "threshold_exceeded", "connection_lost", etc.
    severity: str  # "info", "warning", "error", "critical"
    machine_id: Optional[str] = None
    sensor_type: Optional[SensorType] = None
    message: str
    threshold_value: Optional[float] = None
    actual_value: Optional[float] = None
    resolved: bool = Field(default=False)
    resolved_at: Optional[datetime] = None


class BatchSensorReading(BaseMessage):
    """Model for batch sensor readings"""
    machine_id: str = Field(..., pattern=r'^[A-Z]{3}-\d{3}$')
    readings: List[SensorReading] = Field(..., min_items=1, max_items=1000)
    
    @validator('readings')
    def validate_readings_consistency(cls, v, values):
        """Ensure all readings are for the same machine"""
        machine_id = values.get('machine_id')
        if machine_id:
            for reading in v:
                if reading.machine_id != machine_id:
                    raise ValueError(f'All readings must be for machine {machine_id}')
        return v


# Export all models for easy importing
__all__ = [
    'SensorType',
    'DataQuality', 
    'MachineStatus',
    'EventType',
    'BaseMessage',
    'SensorReading',
    'MachineInfo',
    'SensorAggregate',
    'EventMessage',
    'MQTTMessage',
    'KafkaMessage',
    'HealthCheck',
    'PipelineMetrics',
    'AlertMessage',
    'BatchSensorReading'
]
