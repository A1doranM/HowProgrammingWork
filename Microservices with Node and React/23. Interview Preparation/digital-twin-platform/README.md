# Digital Twin Manufacturing Platform

A comprehensive real-time IoT sensor data processing and monitoring platform built for interview preparation, demonstrating senior full-stack engineering skills.

## 🎯 Day 1 Completed Features

### ✅ FastAPI Foundation
- **Async API endpoints** with proper error handling
- **Pydantic models** with comprehensive validation
- **Dependency injection** system for clean architecture
- **Structured logging** with detailed context
- **Health checks** and metrics endpoints

### ✅ Redis Integration
- **Caching patterns** (cache-aside, write-through)
- **Pub/sub messaging** for real-time communication
- **Session management** for user state
- **Rate limiting** with sliding window algorithm
- **Metrics storage** for monitoring

### ✅ WebSocket Real-time Communication
- **Connection manager** with proper lifecycle handling
- **Machine-specific** and **dashboard** endpoints
- **Heartbeat mechanism** for connection health
- **Redis pub/sub integration** for horizontal scaling
- **Error handling** and automatic reconnection

### ✅ Testing Framework
- **Model validation tests** with pytest
- **API endpoint tests** with TestClient
- **Mock Redis** for isolated testing
- **Async test support** with pytest-asyncio

### ✅ Docker Setup
- **Multi-stage Dockerfile** for development and production
- **Docker-compose** with Redis service
- **Environment configuration**
- **Health checks** and proper startup order

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11+ (for local development)

### Running with Docker
```bash
# Clone and navigate to project
cd "Microservices with Node and React/23. Interview Preparation/digital-twin-platform"

# Start the services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f api
```

## 📚 API Documentation

Once running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Application Info**: http://localhost:8000/info

## 🔌 WebSocket Endpoints

### Machine-Specific Updates
```javascript
// Connect to machine-specific updates
const ws = new WebSocket('ws://localhost:8000/ws/machines/CNC-001');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};

// Send message
ws.send(JSON.stringify({
    type: "subscribe",
    sensor_types: ["temperature", "pressure"]
}));
```

### Dashboard Updates
```javascript
// Connect to dashboard for all machines
const ws = new WebSocket('ws://localhost:8000/ws/dashboard');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Dashboard update:', data);
};
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_models.py -v

# Run API tests only
pytest tests/test_api.py -v
```

## 📊 Sample API Usage

### Submit Sensor Reading
```bash
curl -X POST "http://localhost:8000/api/v1/sensors/readings" \
  -H "Content-Type: application/json" \
  -d '{
    "machine_id": "CNC-001",
    "sensor_type": "temperature",
    "value": 85.4,
    "unit": "celsius",
    "timestamp": "2024-01-15T10:30:00Z",
    "quality": "good"
  }'
```

### Get Latest Readings
```bash
curl "http://localhost:8000/api/v1/sensors/readings/latest/CNC-001"
```

### Health Check
```bash
curl "http://localhost:8000/api/v1/health"
```

### Application Metrics
```bash
curl "http://localhost:8000/api/v1/metrics"
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IoT Sensors   │────│  FastAPI Gateway │────│  Redis Cache    │
│   (Simulated)   │    │   + WebSockets   │    │   + Pub/Sub     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ React Dashboard │
                       │  (Coming Day 3) │
                       └─────────────────┘
```

## 🎯 Interview Demonstration Points

### Technical Skills Demonstrated
1. **Async Python Programming**: FastAPI with proper async/await patterns
2. **Redis Mastery**: Caching, pub/sub, session management, rate limiting
3. **WebSocket Scaling**: Connection management, heartbeats, horizontal scaling
4. **API Design**: RESTful endpoints, proper error handling, documentation
5. **Testing**: Comprehensive test suite with mocks and fixtures
6. **Docker**: Multi-stage builds, compose orchestration, health checks

### System Design Concepts
- **Real-time Communication**: WebSocket with Redis pub/sub
- **Horizontal Scalability**: Stateless design with Redis coordination
- **Caching Strategies**: Multiple Redis patterns for performance
- **Health Monitoring**: Comprehensive health checks and metrics
- **Error Resilience**: Proper error handling and graceful degradation

## 📋 Day 1 Checklist

- [x] **Project Setup** - Complete structure with virtual environment
- [x] **FastAPI Foundation** - Async endpoints with dependency injection
- [x] **Pydantic Models** - Comprehensive validation and serialization
- [x] **Redis Integration** - Caching, pub/sub, sessions, rate limiting
- [x] **WebSocket Server** - Real-time communication with connection management
- [x] **Testing Framework** - Model and API tests with 70%+ coverage
- [x] **Docker Setup** - Development environment with Redis
- [x] **API Documentation** - Interactive Swagger/OpenAPI docs
- [x] **Health Checks** - Service health monitoring
- [x] **Logging** - Structured logging with context

## 🚦 Next Steps (Day 2)

Tomorrow we'll add:
- **MQTT Broker** for IoT device simulation
- **Kafka** for reliable message streaming
- **PostgreSQL** with time-series optimization
- **Data aggregation workers**
- **Event sourcing patterns**

## 🔧 Configuration

Environment variables can be configured in `.env` file (copy from `.env.example`):
- Redis connection settings
- Security configurations
- CORS origins
- Logging levels

## 🐛 Troubleshooting

### Common Issues
1. **Redis Connection Failed**: Ensure Redis is running on port 6379
2. **Port Already in Use**: Change PORT in environment or stop conflicting services
3. **Import Errors**: Ensure PYTHONPATH includes the app directory

### Docker Issues
```bash
# Rebuild containers
docker-compose down && docker-compose up --build

# Check container logs
docker-compose logs api
docker-compose logs redis

# Clean up
docker-compose down -v  # Removes volumes too
```

Built with ❤️ for interview preparation - demonstrating production-ready FastAPI patterns, Redis mastery, and real-time WebSocket communication.
