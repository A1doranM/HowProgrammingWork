"""
Tests for API endpoints
"""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
import fakeredis

from app.main import app
from app.models.sensor import SensorReading, SensorType


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture
def mock_redis(monkeypatch):
    """Mock Redis for testing"""
    fake_redis = fakeredis.FakeRedis()
    
    # Mock the redis service
    from app.services.redis_service import redis_service
    monkeypatch.setattr(redis_service, "redis", fake_redis)
    
    return fake_redis


class TestHealthEndpoints:
    """Test health and status endpoints"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint returns HTML"""
        response = client.get("/")
        assert response.status_code == 200
        assert "Digital Twin Manufacturing Platform" in response.text
    
    def test_status_endpoint(self, client):
        """Test status endpoint"""
        response = client.get("/status")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data
    
    def test_info_endpoint(self, client):
        """Test info endpoint"""
        response = client.get("/info")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "Digital Twin Manufacturing Platform"
        assert data["version"] == "1.0.0"
        assert "uptime_seconds" in data


class TestSensorEndpoints:
    """Test sensor-related endpoints"""
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert "version" in data
    
    def test_create_sensor_reading(self, client, mock_redis):
        """Test creating a sensor reading"""
        sensor_data = {
            "machine_id": "CNC-001",
            "sensor_type": "temperature",
            "value": 85.4,
            "unit": "celsius",
            "timestamp": datetime.utcnow().isoformat(),
            "quality": "good"
        }
        
        response = client.post("/api/v1/sensors/readings", json=sensor_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["machine_id"] == "CNC-001"
        assert data["sensor_type"] == "temperature"
        assert data["value"] == 85.4
        assert "id" in data
        assert "processed_at" in data
    
    def test_create_invalid_sensor_reading(self, client):
        """Test creating invalid sensor reading"""
        invalid_data = {
            "machine_id": "invalid-id",  # Invalid format
            "sensor_type": "temperature",
            "value": 85.4,
            "unit": "celsius",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        response = client.post("/api/v1/sensors/readings", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_create_batch_readings(self, client, mock_redis):
        """Test creating batch sensor readings"""
        batch_data = {
            "machine_id": "CNC-001",
            "readings": [
                {
                    "machine_id": "CNC-001",
                    "sensor_type": "temperature",
                    "value": 85.4,
                    "unit": "celsius",
                    "timestamp": datetime.utcnow().isoformat()
                },
                {
                    "machine_id": "CNC-001",
                    "sensor_type": "pressure",
                    "value": 10.5,
                    "unit": "bar",
                    "timestamp": datetime.utcnow().isoformat()
                }
            ]
        }
        
        response = client.post("/api/v1/sensors/readings/batch", json=batch_data)
        assert response.status_code == 201
        
        data = response.json()
        assert len(data) == 2
        assert data[0]["machine_id"] == "CNC-001"
        assert data[1]["machine_id"] == "CNC-001"
    
    def test_get_active_machines(self, client, mock_redis):
        """Test getting active machines"""
        response = client.get("/api/v1/machines")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_latest_readings(self, client, mock_redis):
        """Test getting latest readings for a machine"""
        response = client.get("/api/v1/sensors/readings/latest/CNC-001")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_latest_readings_with_sensor_type(self, client, mock_redis):
        """Test getting latest readings for specific sensor type"""
        response = client.get("/api/v1/sensors/readings/latest/CNC-001?sensor_type=temperature")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)


class TestMetricsEndpoints:
    """Test metrics and monitoring endpoints"""
    
    def test_get_metrics(self, client, mock_redis):
        """Test getting application metrics"""
        response = client.get("/api/v1/metrics")
        assert response.status_code == 200
        
        data = response.json()
        assert "redis_metrics" in data
        assert "websocket_stats" in data
        assert "timestamp" in data
    
    def test_debug_connections(self, client):
        """Test debug connections endpoint"""
        response = client.get("/api/v1/debug/connections")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_connections" in data
        assert "machine_connections" in data
        assert "user_connections" in data
