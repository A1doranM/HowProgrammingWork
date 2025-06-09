"""
Pydantic models for sensor data and related entities
"""
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any

from pydantic import BaseModel, Field, validator


class SensorType(str, Enum):
    """Enumeration of supported sensor types"""
    TEMPERATURE = "temperature"
    PRESSURE = "pressure"
    VIBRATION = "vibration"
    HUMIDITY = "humidity"
    SPEED = "speed"


class DataQuality(str, Enum):
    """Data quality indicators"""
    GOOD = "good"
    POOR = "poor"
    BAD = "bad"
    UNCERTAIN = "uncertain"


class SensorReading(BaseModel):
    """Model for individual sensor readings"""
    machine_id: str = Field(..., regex=r'^[A-Z]{3}-\d{3}$', description="Machine identifier (e.g., CNC-001)")
    sensor_type: SensorType = Field(..., description="Type of sensor measurement")
    value: float = Field(..., ge=-1000, le=1000, description="Sensor reading value")
    unit: str = Field(..., max_length=20, description="Measurement unit")
    timestamp: datetime = Field(..., description="Timestamp of the reading")
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
                
        return v
    
    @validator('metadata')
    def validate_metadata(cls, v):
        """Validate and sanitize metadata"""
        if v is None:
            return v
        
        # Limit metadata size
        if len(str(v)) > 1000:
            raise ValueError("Metadata too large (max 1000 characters)")
        
        # Ensure all keys are strings and values are simple types
        sanitized = {}
        for key, value in v.items():
            if not isinstance(key, str):
                raise ValueError("Metadata keys must be strings")
            
            if isinstance(value, (str, int, float, bool)):
                sanitized[key] = value
            else:
                sanitized[key] = str(value)
        
        return sanitized
    
    class Config:
        schema_extra = {
            "example": {
                "machine_id": "CNC-001",
                "sensor_type": "temperature",
                "value": 85.4,
                "unit": "celsius",
                "timestamp": "2024-01-15T10:30:00Z",
                "quality": "good",
                "metadata": {"location": "workshop_1", "calibrated": True}
            }
        }


class SensorReadingResponse(SensorReading):
    """Response model for sensor readings with additional fields"""
    id: Optional[str] = Field(None, description="Unique identifier for the reading")
    processed_at: Optional[datetime] = Field(None, description="When the reading was processed")


class BatchSensorReading(BaseModel):
    """Model for batch sensor reading submissions"""
    machine_id: str = Field(..., regex=r'^[A-Z]{3}-\d{3}$')
    readings: list[SensorReading] = Field(..., min_items=1, max_items=1000)
    
    @validator('readings')
    def validate_readings(cls, v, values):
        """Ensure all readings belong to the same machine"""
        machine_id = values.get('machine_id')
        for reading in v:
            if reading.machine_id != machine_id:
                raise ValueError(f"All readings must belong to machine {machine_id}")
        return v


class MachineStatus(BaseModel):
    """Model for machine status information"""
    machine_id: str = Field(..., regex=r'^[A-Z]{3}-\d{3}$')
    status: str = Field(..., description="Current machine status")
    last_seen: datetime = Field(..., description="Last communication timestamp")
    active_sensors: list[SensorType] = Field(default_factory=list)
    location: Optional[str] = Field(None, description="Physical location")
    
    class Config:
        schema_extra = {
            "example": {
                "machine_id": "CNC-001",
                "status": "running",
                "last_seen": "2024-01-15T10:30:00Z",
                "active_sensors": ["temperature", "pressure", "vibration"],
                "location": "workshop_1"
            }
        }


class WebSocketMessage(BaseModel):
    """Model for WebSocket messages"""
    type: str = Field(..., description="Message type")
    data: Dict[str, Any] = Field(..., description="Message payload")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    machine_id: Optional[str] = Field(None, description="Related machine ID")
    
    class Config:
        schema_extra = {
            "example": {
                "type": "sensor_update",
                "data": {
                    "machine_id": "CNC-001",
                    "sensor_type": "temperature",
                    "value": 85.4
                },
                "timestamp": "2024-01-15T10:30:00Z",
                "machine_id": "CNC-001"
            }
        }


class HealthCheckResponse(BaseModel):
    """Health check response model"""
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = Field(..., description="Application version")
    uptime: Optional[float] = Field(None, description="Uptime in seconds")
    
    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "timestamp": "2024-01-15T10:30:00Z",
                "version": "1.0.0",
                "uptime": 3600.5
            }
        }
