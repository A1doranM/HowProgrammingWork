# IoT Monitoring System

A microservice-based application for collecting, processing, and visualizing data from IoT devices in real-time. This project demonstrates the use of modern technologies for building a scalable IoT monitoring solution.

## System Architecture

For a detailed architecture diagram and explanation, see [Architecture Documentation](./docs/architecture.md).

A text description of the architecture is available in the [Architecture Diagram Text](./docs/architecture-diagram.txt) file.

The system consists of the following microservices:

- **IoT Simulator**: Generates simulated IoT device data and publishes it to Kafka
- **Data Ingestion Service**: Consumes IoT data from Kafka and stores it in PostgreSQL and Redis
- **API Gateway**: Acts as a central entry point for client applications, routing requests to appropriate services
- **WebSocket Service**: Provides real-time updates to clients using Socket.IO
- **Dashboard UI**: Web interface for visualizing device data and metrics (test version provided)

## Technologies Used

- **Node.js**: Runtime for all microservices
- **PostgreSQL**: Persistent storage for IoT data
- **Redis**: Caching and pub/sub communication
- **Kafka (KRaft Mode)**: Message queue for handling high-volume sensor data without Zookeeper dependency
- **Docker & Docker Compose**: Containerization and orchestration
- **Express.js**: Web framework for API services
- **Socket.IO**: WebSocket implementation for real-time communication
- **HTML/CSS/JavaScript**: Frontend dashboard

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Git

### Running the System

1. Clone the repository
2. Navigate to the project directory
3. Make the test script executable:
   ```
   chmod +x test-system.sh
   ```
4. Start the system:
   ```
   ./test-system.sh start
   ```
5. Open your browser and navigate to `http://localhost:3000` to access the dashboard

### Other Commands

- Stop the system: `./test-system.sh stop`
- Restart the system: `./test-system.sh restart`
- View logs: `./test-system.sh logs [service-name]`
- Test API endpoints: `./test-system.sh test`
- View resource usage: `./test-system.sh resources`

### Testing KRaft Migration

To verify that the Kafka KRaft migration was successful:

```bash
./test-kraft-migration.sh
```

This script validates:
- Kafka is running in KRaft mode (without Zookeeper)
- All topics are functional
- Producer/Consumer operations work correctly
- All microservices are healthy
- Real-time data flow is active

For detailed information about the KRaft migration, see [KRaft Migration Documentation](./docs/kraft-migration.md).

## Microservices Details

### IoT Simulator

Simulates IoT devices sending sensor data including temperature, humidity, pressure, and vibration readings. Publishes data to a Kafka topic for consumption by other services.

- **Port**: 3001
- **Endpoints**:
  - `GET /health`: Health check endpoint
  - `GET /devices`: List of simulated devices
  - `GET /device/:id`: Get specific device information

### Data Ingestion Service

Consumes sensor data from Kafka, processes it, and stores it in PostgreSQL for persistent storage and Redis for real-time access.

- **Port**: 3002
- **Endpoints**:
  - `GET /health`: Health check endpoint
  - `GET /devices`: List devices
  - `GET /sensor-readings`: Get sensor readings
  - `GET /sensor-readings/:deviceId`: Get readings for a specific device

### API Gateway

Acts as a unified entry point for client applications, routing requests to the appropriate microservices.

- **Port**: 3000
- **Endpoints**:
  - `GET /health`: Health check endpoint
  - `GET /api/devices`: List all devices (proxied to Data Ingestion Service)
  - `GET /api/sensor-readings`: Get sensor readings (proxied to Data Ingestion Service)
  - `GET /`: Test dashboard

### WebSocket Service

Provides real-time updates to connected clients when new sensor data arrives.

- **Port**: 3003
- **Endpoints**:
  - `GET /health`: Health check endpoint
  - Socket.IO connection at `ws://localhost:3003`

## Testing the System

1. Start the system using `./test-system.sh start`
2. Open the test dashboard at `http://localhost:3000`
3. Click "Connect to WebSocket" to start receiving real-time updates
4. Use the "Fetch Devices" and "Fetch Recent Readings" buttons to test the API endpoints
5. Observe the real-time data updates in the "Live Sensor Readings" section

## Development

### Local Development

To run a specific service locally for development:

1. Navigate to the service directory
2. Install dependencies: `npm install`
3. Start in development mode: `npm run dev`

### Adding New Services

To add a new service:

1. Create a new directory under `services/`
2. Implement the service following the existing patterns
3. Add a Dockerfile for containerization
4. Update the `docker-compose.yml` file to include the new service

## License

This project is licensed under the MIT License - see the LICENSE file for details.
