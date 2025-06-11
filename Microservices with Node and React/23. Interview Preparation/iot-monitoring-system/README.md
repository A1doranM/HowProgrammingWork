# IoT Manufacturing Monitoring System

A real-time monitoring system for simulated IoT devices in a manufacturing environment. This system demonstrates advanced data collection, processing, and visualization capabilities using modern technologies.

## Tech Stack

- **Backend**: Node.js (Microservices Architecture)
- **Database**: PostgreSQL (Time-series Data)
- **Caching**: Redis (Real-time State Management)
- **Messaging**: Apache Kafka (Event Streaming)
- **Real-time Communication**: WebSockets
- **Frontend**: React with Plotly (Data Visualization)
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (planned)

## Project Overview

This project simulates a digital twin ecosystem for advanced manufacturing operations, collecting and processing data from 5 IoT devices:

1. **Temperature Sensor** - Assembly line temperature monitoring
2. **Pressure Sensor** - Hydraulic system pressure monitoring
3. **Vibration Sensor** - Motor unit vibration detection
4. **Production Counter** - Output conveyor production rate
5. **Quality Sensor** - Quality control measurement

The system employs a microservices architecture with the following components:

- **IoT Simulator Service** - Generates realistic sensor data
- **Data Ingestion Service** - Consumes and stores sensor readings
- **Data Processing Service** - Calculates metrics and detects anomalies
- **Alert Service** - Manages alert lifecycle and notifications
- **API Gateway** - Provides REST APIs for data access
- **WebSocket Service** - Delivers real-time updates to clients
- **React Dashboard** - Visualizes data with interactive charts

## Phase 1: Foundation Layer

This phase sets up the infrastructure components required by the system:

- PostgreSQL database with schema and indexes
- Redis cache with appropriate configuration
- Kafka message broker with required topics
- Docker Compose for orchestration

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for future phases)
- Git

### Installation & Setup

1. Clone the repository (if applicable)

2. Navigate to the project directory:
   ```
   cd iot-monitoring-system
   ```

3. Make the setup scripts executable:
   ```
   chmod +x scripts/setup.sh scripts/health-check.sh
   ```

4. Run the setup script:
   ```
   ./scripts/setup.sh
   ```

This will:
- Start PostgreSQL, Redis, Kafka, and Zookeeper containers
- Create the required Kafka topics
- Initialize the database schema and seed data
- Run health checks to verify everything is working

### Verifying Installation

After running the setup script, the health check should report all systems operational. You can also verify manually:

1. Check container status:
   ```
   docker-compose ps
   ```

2. Connect to PostgreSQL:
   ```
   psql -h localhost -U iot_user -d iot_monitoring
   ```
   Password: `iot_password`

3. Check Redis:
   ```
   redis-cli ping
   ```

4. Check Kafka topics:
   ```
   docker exec -it iot-kafka kafka-topics --list --bootstrap-server localhost:9092
   ```

### Development Tools

The setup includes web-based tools for monitoring:

- **Kafka UI**: http://localhost:8080 - Web interface for Kafka topics and messages
- **Redis Commander**: http://localhost:8081 - Redis data browser and editor

### Troubleshooting

Common issues and solutions:

1. **Network conflicts**: If you see errors about network overlaps, you may have existing Docker networks using the same subnet range. Run `docker network prune` to remove unused networks.

2. **Port conflicts**: If services fail to start due to port conflicts, check if any other applications are using the required ports (5432, 6379, 9092, 8080, 8081).

3. **Resource limitations**: Docker may need more memory. Check your Docker Desktop settings if you're on Windows/Mac.

4. **Container health**: Use `docker logs [container-name]` to see specific error messages for each service.

## Database Schema

The PostgreSQL database includes the following tables:

- `devices` - Device configuration and metadata
- `sensor_readings` - Time-series data from sensors
- `alerts` - Alert history and status
- `device_stats_hourly` - Aggregated statistics
- `system_events` - System operation logs
- `user_sessions` - (Future) User authentication data

## Next Steps

After successfully completing Phase 1, you can proceed to:

- **Phase 2**: Implement IoT Simulator and Data Ingestion services
- **Phase 3**: Implement Data Processing service with Redis integration
- **Phase 4**: Implement Alert Service for threshold monitoring
- **Phase 5**: Implement API Gateway for data access
- **Phase 6**: Implement WebSocket Service for real-time updates
- **Phase 7**: Implement React Dashboard with Plotly visualizations

## Documentation

Additional documentation for each service can be found in their respective directories.

## Monitoring & Management

Basic monitoring is provided via health checks and service logs. Future phases will integrate Prometheus and Grafana for comprehensive monitoring.
