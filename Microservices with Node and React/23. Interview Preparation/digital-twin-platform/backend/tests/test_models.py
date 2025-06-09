"""
Tests for Pydantic models
"""
import pytest
from datetime import datetime
from pydantic import ValidationError

from app.models.sensor import (
    SensorReading, 
    SensorType, 
    DataQuality,
    BatchSensorReading,
    MachineStatus,
    WebSocketMessage
)


class TestSensorReading:
    """Test SensorReading model"""
    
    def test_valid_sensor_reading(self):
        """Test creating a valid sensor reading"""
        reading = SensorReading(
            machine_id="CNC-001",
            sensor_type=SensorType.TEMPERATURE,
            value=85.4,
            unit="celsius",
            timestamp=datetime.utcnow(),
            quality=DataQuality.GOOD
        )
        
        assert reading.machine_id == "CNC-001"
        assert reading.sensor_type == SensorType.TEMPERATURE
        assert reading.value == 85.4
        assert reading.unit == "celsius"
        assert reading.quality == DataQuality.GOOD
    
    def test_invalid_machine_id(self):
        """Test invalid machine ID format"""
        with pytest.raises(ValidationError):
            SensorReading(
                machine_id="invalid-id",  # Should be format XXX-000
                sensor_type=SensorType.TEMPERATURE,
                value=85.4,
                unit="celsius",
                timestamp=datetime.utcnow()
            )
    
    def test_temperature_value_validation(self):
        """Test temperature value range validation"""
        # Valid temperature
        reading = SensorReading(
            machine_id="CNC-001",
            sensor_type=SensorType.TEMPERATURE,
            value=25.0,
            unit="celsius",
            timestamp=datetime.utcnow()
        )
        assert reading.value == 25.0
        
        # Invalid temperature - too low
        with pytest.raises(ValidationError):
            SensorReading(
                machine_id="CNC-001",
                sensor_type=SensorType.TEMPERATURE,
                value=-100.0,  # Below -50°C
                unit="celsius",
                timestamp=datetime.utcnow()
            )
        
        # Invalid temperature - too high
        with pytest.raises(ValidationError):
            SensorReading(
                machine_id="CNC-001",
                sensor_type=SensorType.TEMPERATURE,
                value=300.0,  # Above 200°C
                unit="celsius",
                timestamp=datetime.utcnow()
            )
    
    def test_pressure_value_validation(self):
        """Test pressure value range validation"""
        # Valid pressure
        reading = SensorReading(
            machine_id="CNC-001",
            sensor_type=SensorType.PRESSURE,
            value=10.5,
            unit="bar",
            timestamp=datetime.utcnow()
        )
        assert reading.value == 10.5
        
        # Invalid pressure - negative
        with pytest.raises(ValidationError):
            SensorReading(
                machine_id="CNC-001",
                sensor_type=SensorType.PRESSURE,
                value=-5.0,
                unit="bar",
                timestamp=datetime.utcnow()
            )
    
    def test_metadata_validation(self):
        """Test metadata validation and sanitization"""
        # Valid metadata
        reading = SensorReading(
            machine_id="CNC-001",
            sensor_type=SensorType.TEMPERATURE,
            value=85.4,
            unit="celsius",
            timestamp=datetime.utcnow(),
            metadata={"location": "workshop_1", "calibrated": True}
        )
        
        assert reading.metadata["location"] == "workshop_1"
        assert reading.metadata["calibrated"] is True
        
        # Metadata too large
        with pytest.raises(ValidationError):
            large_metadata = {"data": "x" * 1001}  # Too large
            SensorReading(
                machine_id="CNC-001",
                sensor_type=SensorType.TEMPERATURE,
                value=85.4,
                unit="celsius",
                timestamp=datetime.utcnow(),
                metadata=large_metadata
            )


class TestBatchSensorReading:
    """Test BatchSensorReading model"""
    
    def test_valid_batch(self):
        """Test valid batch of sensor readings"""
        readings = [
            SensorReading(
                machine_id="CNC-001",
                sensor_type=SensorType.TEMPERATURE,
                value=85.4,
                unit="celsius",
                timestamp=datetime.utcnow()
            ),
            SensorReading(
                machine_id="CNC-001",
                sensor_type=SensorType.PRESSURE,
                value=10.5,
                unit="bar",
                timestamp=datetime.utcnow()
            )
        ]
        
        batch = BatchSensorReading(machine_id="CNC-001", readings=readings)
        assert batch.machine_id == "CNC-001"
        assert len(batch.readings) == 2
    
    def test_mismatched_machine_ids(self):
        """Test batch with mismatched machine IDs"""
        readings = [
            SensorReading(
                machine_id="CNC-001",
                sensor_type=SensorType.TEMPERATURE,
                value=85.4,
                unit="celsius",
                timestamp=datetime.utcnow()
            ),
            SensorReading(
                machine_id="CNC-002",  # Different machine ID
                sensor_type=SensorType.PRESSURE,
                value=10.5,
                unit="bar",
                timestamp=datetime.utcnow()
            )
        ]
        
        with pytest.raises(ValidationError):
            BatchSensorReading(machine_id="CNC-001", readings=readings)


class TestMachineStatus:
    """Test MachineStatus model"""
    
    def test_valid_machine_status(self):
        """Test creating valid machine status"""
        status = MachineStatus(
            machine_id="CNC-001",
            status="running",
            last_seen=datetime.utcnow(),
            active_sensors=[SensorType.TEMPERATURE, SensorType.PRESSURE],
            location="workshop_1"
        )
        
        assert status.machine_id == "CNC-001"
        assert status.status == "running"
        assert len(status.active_sensors) == 2
        assert status.location == "workshop_1"


class TestWebSocketMessage:
    """Test WebSocketMessage model"""
    
    def test_valid_websocket_message(self):
        """Test creating valid WebSocket message"""
        message = WebSocketMessage(
            type="sensor_update",
            data={"machine_id": "CNC-001", "value": 85.4},
            machine_id="CNC-001"
        )
        
        assert message.type == "sensor_update"
        assert message.data["machine_id"] == "CNC-001"
        assert message.machine_id == "CNC-001"
        assert message.timestamp is not None
