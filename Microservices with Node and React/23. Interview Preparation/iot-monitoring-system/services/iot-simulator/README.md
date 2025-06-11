# IoT Simulator Service

This service generates realistic IoT sensor data for the IoT Monitoring System. It simulates 5 different types of sensors that would be found in a manufacturing environment, creates realistic data patterns, and publishes the readings to Kafka.

## Features

- Realistic data generation with 5 device types:
  - **Temperature Sensor**: Follows a sine wave pattern (daily cycle) with random noise
  - **Pressure Sensor**: Steady state with occasional spikes
  - **Vibration Sensor**: Random walk with occasional high-frequency bursts
  - **Production Counter**: Step function based on work shifts
  - **Quality Sensor**: Normal distribution with occasional dips

- Configurable data generation parameters for each device type
- Automatic anomaly injection with customizable patterns
- Kafka producer with batching and retries
- Health check and metrics endpoints
- Graceful shutdown handling

## Architecture

```
                           ┌──────────────┐
                           │   Kafka UI   │
                           └──────▲───────┘
                                  │
┌─────────────────┐      ┌────────┴───────┐      ┌──────────────────┐
│  Base Simulator │      │                │      │                  │
│  - Temperature  │──┬──▶│     Kafka      │─────▶│  Data Ingestion  │
│  - Pressure     │  │   │                │      │                  │
│  - Vibration    │  │   └────────────────┘      └──────────────────┘
│  - Production   │  │
│  - Quality      │  │   ┌────────────────┐
└──────┬──────────┘  └──▶│  Health Check  │
       │                 │    Server      │
       │                 └────────────────┘
       │
       │                 ┌────────────────┐
       └────────────────▶│  Stats/Metrics │
                         └────────────────┘
```

## Data Flow

1. Each device simulator generates readings at its configured frequency
2. Readings are formatted with device metadata
3. Formatted readings are sent to the Kafka producer
4. Producer buffers readings and sends them in batches
5. Kafka distributes messages to consumers (e.g., Data Ingestion Service)

## Setup & Running

### Environment Variables

The service can be configured with the following environment variables:

| Variable                | Description                           | Default              |
|-------------------------|---------------------------------------|----------------------|
| `IOT_SIMULATOR_PORT`    | HTTP server port                      | `3001`               |
| `KAFKA_BROKERS`         | Comma-separated Kafka brokers         | `localhost:9092`     |
| `KAFKA_CLIENT_ID`       | Kafka client ID                       | `iot-simulator`      |
| `KAFKA_TOPIC_SENSORS`   | Kafka topic for sensor readings       | `sensors-data`       |
| `LOG_LEVEL`             | Logging level                         | `info`               |
| `ANOMALY_PROBABILITY`   | Probability of generating anomalies   | `0.05` (5%)          |

### Running Locally

```bash
# Install dependencies
npm install

# Start the service
npm start

# Start with development mode (auto-restart)
npm run dev
```

### Running with Docker

```bash
# Build the Docker image
docker build -t iot-simulator .

# Run the container
docker run -p 3001:3001 iot-simulator
```

### Running with Docker Compose

```bash
# From the project root
docker-compose up iot-simulator
```

## API Endpoints

- **Health Check**: `GET /health`
  - Returns the health status of the service
  - Status code `200` if healthy, `503` if unhealthy

- **Metrics**: `GET /metrics`
  - Returns metrics about the service
  - Includes statistics about simulated devices and Kafka

## Example Output

Here's an example of a temperature sensor reading:

```json
{
  "deviceId": "device-001",
  "timestamp": "2025-06-11T10:45:22.543Z",
  "sensorType": "temperature",
  "value": 74.32,
  "unit": "celsius",
  "location": "assembly-line-1",
  "status": "active"
}
```

And a production counter reading with shift information:

```json
{
  "deviceId": "device-004",
  "timestamp": "2025-06-11T10:45:24.127Z",
  "sensorType": "production",
  "value": 342.15,
  "unit": "units/hour",
  "location": "output-conveyor",
  "status": "active",
  "shift": "morning"
}
