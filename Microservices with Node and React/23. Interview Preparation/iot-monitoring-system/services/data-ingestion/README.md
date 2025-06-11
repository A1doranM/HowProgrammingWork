# Data Ingestion Service

This service consumes IoT sensor data from Kafka, validates it, and stores it in PostgreSQL and Redis for further processing.

## Features

- Consumes sensor data from Kafka topic
- Validates incoming data with schema validation
- Stores data in PostgreSQL using TypeORM for database access
- Caches recent readings in Redis for fast access
- Batch processing for efficient database operations
- Health check and metrics endpoints

## Architecture

The service follows a modular architecture:

```
├── config/         # Configuration management
├── db/             # Database integration
│   ├── entities/   # TypeORM entity definitions
│   ├── repositories/ # TypeORM repositories
│   ├── database.js # TypeORM data source setup
│   └── redis.js    # Redis client
├── kafka/          # Kafka consumer
├── models/         # Data models and validation
└── utils/          # Utility functions
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATA_INGESTION_PORT` | HTTP port for health check | `3002` |
| `KAFKA_BROKERS` | Comma-separated list of Kafka brokers | `localhost:9092` |
| `KAFKA_TOPIC_SENSORS` | Topic to consume sensor data from | `sensors-data` |
| `KAFKA_GROUP_ID` | Consumer group ID | `data-ingestion-group` |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DB` | PostgreSQL database name | `iot_monitoring` |
| `POSTGRES_USER` | PostgreSQL username | `iot_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `iot_password` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `LOG_LEVEL` | Logging level | `info` |

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /metrics` - Basic metrics endpoint

## Getting Started

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the service:
   ```
   npm run dev
   ```

### Docker

1. Build the Docker image:
   ```
   docker build -t iot-monitoring/data-ingestion .
   ```

2. Run the container:
   ```
   docker run -p 3002:3002 iot-monitoring/data-ingestion
   ```

## Implementation Details

### TypeORM Integration

The service uses TypeORM for database access, providing:
- Entity-based database schema
- Repository pattern for data access
- Relationship management between entities
- Type safety and better code organization
- Efficient batch operations

### Batch Processing

For better performance, the service implements batch processing for database writes:

1. Incoming messages are collected in memory up to a configured batch size
2. When the batch is full or a time threshold is reached, all records are inserted at once
3. This reduces database load and improves throughput

### Caching Strategy

The service uses Redis to cache:

1. Latest readings for each device and sensor type with TTL
2. Time-series data for recent readings using sorted sets
3. Device metadata for quick access
