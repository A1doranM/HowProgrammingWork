#!/bin/bash

# Manual Test Script for IoT Monitoring System
# This script tests PostgreSQL, Redis, and Kafka manually

echo "🧪 IoT Monitoring System - Manual Testing"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test timestamp for all operations
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
TEST_ID=$(date +"%s")

echo -e "\n${BLUE}1. PostgreSQL Database Tests${NC}"
echo "----------------------------------------"

# Check devices table
echo -e "${YELLOW}Querying devices table:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "SELECT device_id, device_type, location, normal_min, normal_max FROM devices;"

# Insert a new sensor reading
echo -e "\n${YELLOW}Inserting new sensor reading for device-001:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "INSERT INTO sensor_readings (device_id, timestamp, sensor_type, value, unit, location, status) VALUES ('device-001', NOW(), 'temperature', 78.6, 'celsius', 'assembly-line-1', 'active') RETURNING id, device_id, sensor_type, value, unit;"

# Query the latest sensor readings
echo -e "\n${YELLOW}Querying latest sensor readings:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "SELECT id, device_id, sensor_type, value, unit, timestamp FROM sensor_readings ORDER BY timestamp DESC LIMIT 5;"

# Query the devices_latest view
echo -e "\n${YELLOW}Querying devices_latest view:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "SELECT * FROM v_devices_latest;"

# Create a test alert
echo -e "\n${YELLOW}Creating a test alert:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "INSERT INTO alerts (device_id, alert_type, message, severity, value, threshold, status, triggered_at) VALUES ('device-003', 'test_alert', 'Manual test alert from CLI', 'medium', 115.0, 120.0, 'active', NOW()) RETURNING id, device_id, alert_type, severity, status, triggered_at;"

# Query the alerts
echo -e "\n${YELLOW}Querying active alerts:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "SELECT id, device_id, alert_type, severity, status, triggered_at FROM alerts WHERE status = 'active';"

echo -e "\n${BLUE}2. Redis Cache Tests${NC}"
echo "----------------------------------------"

# Set a simple key-value
echo -e "${YELLOW}Setting a simple key-value:${NC}"
docker exec iot-redis redis-cli SET "test:simple:$TEST_ID" "Hello Redis at $TIMESTAMP"
docker exec iot-redis redis-cli GET "test:simple:$TEST_ID"

# Set a hash representing device status
echo -e "\n${YELLOW}Setting a hash for device status:${NC}"
docker exec iot-redis redis-cli HSET "test:device:device-001:$TEST_ID" "value" "75.2" "timestamp" "$TIMESTAMP" "status" "normal" "unit" "celsius"
docker exec iot-redis redis-cli HGETALL "test:device:device-001:$TEST_ID"

# Set a list of recent readings
echo -e "\n${YELLOW}Creating a list of readings:${NC}"
docker exec iot-redis redis-cli LPUSH "test:readings:device-001:$TEST_ID" "75.2" "75.5" "76.1" "75.8" "75.3"
docker exec iot-redis redis-cli LRANGE "test:readings:device-001:$TEST_ID" 0 -1

# Set an expiring key (TTL demo)
echo -e "\n${YELLOW}Setting a key with expiration (10 seconds):${NC}"
docker exec iot-redis redis-cli SETEX "test:expiring:$TEST_ID" 10 "This will expire in 10 seconds"
docker exec iot-redis redis-cli TTL "test:expiring:$TEST_ID"
echo "Wait 5 seconds..."
sleep 5
docker exec iot-redis redis-cli TTL "test:expiring:$TEST_ID"

# Pub/sub demonstration
echo -e "\n${YELLOW}Testing Redis Pub/Sub (in background):${NC}"
docker exec -d iot-redis bash -c "redis-cli SUBSCRIBE test-channel > /tmp/redis-sub-output.txt &"
sleep 1
docker exec iot-redis redis-cli PUBLISH test-channel "Hello from manual test at $TIMESTAMP"
sleep 1
docker exec iot-redis cat /tmp/redis-sub-output.txt

echo -e "\n${BLUE}3. Kafka Message Tests${NC}"
echo "----------------------------------------"

# Produce a message to sensors-data topic
echo -e "${YELLOW}Producing a message to sensors-data topic:${NC}"
TEST_MESSAGE="{\"deviceId\":\"device-001\",\"timestamp\":\"$TIMESTAMP\",\"sensorType\":\"temperature\",\"value\":77.5,\"unit\":\"celsius\",\"location\":\"assembly-line-1\",\"status\":\"active\"}"
echo "$TEST_MESSAGE" > /tmp/test-message.json
docker exec iot-kafka bash -c "cat /tmp/test-message.json | kafka-console-producer --broker-list localhost:9092 --topic sensors-data"

# Consume messages from sensors-data topic
echo -e "\n${YELLOW}Consuming messages from sensors-data topic:${NC}"
docker exec iot-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic sensors-data --from-beginning --max-messages 3

# Produce a message to alerts topic
echo -e "\n${YELLOW}Producing a message to alerts topic:${NC}"
ALERT_MESSAGE="{\"alertId\":\"test-alert-$TEST_ID\",\"deviceId\":\"device-002\",\"type\":\"test_alert\",\"severity\":\"low\",\"message\":\"Test alert message\",\"value\":52.1,\"threshold\":55.0,\"timestamp\":\"$TIMESTAMP\"}"
echo "$ALERT_MESSAGE" > /tmp/alert-message.json
docker exec iot-kafka bash -c "cat /tmp/alert-message.json | kafka-console-producer --broker-list localhost:9092 --topic alerts"

# Consume messages from alerts topic
echo -e "\n${YELLOW}Consuming messages from alerts topic:${NC}"
docker exec iot-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic alerts --from-beginning --max-messages 2

echo -e "\n${BLUE}4. End-to-End Data Flow Test${NC}"
echo "----------------------------------------"

# Create a sensor reading, store in PostgreSQL, cache in Redis, and publish to Kafka
echo -e "${YELLOW}Simulating an end-to-end data flow:${NC}"

# 1. Generate the reading
VALUE=$(echo "scale=1; 60 + $RANDOM % 20" | bc)
echo "Generated sensor reading: $VALUE °C for device-001"

# 2. Store in PostgreSQL
echo -e "\n${YELLOW}Storing in PostgreSQL:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "INSERT INTO sensor_readings (device_id, timestamp, sensor_type, value, unit, location, status) VALUES ('device-001', NOW(), 'temperature', $VALUE, 'celsius', 'assembly-line-1', 'active') RETURNING id, device_id, value, timestamp;"

# 3. Cache in Redis
echo -e "\n${YELLOW}Caching in Redis:${NC}"
docker exec iot-redis redis-cli HSET "device:device-001:current" "value" "$VALUE" "timestamp" "$TIMESTAMP" "status" "normal" "unit" "celsius"
docker exec iot-redis redis-cli HGETALL "device:device-001:current"

# 4. Publish to Kafka
echo -e "\n${YELLOW}Publishing to Kafka:${NC}"
FLOW_MESSAGE="{\"deviceId\":\"device-001\",\"timestamp\":\"$TIMESTAMP\",\"sensorType\":\"temperature\",\"value\":$VALUE,\"unit\":\"celsius\",\"location\":\"assembly-line-1\",\"status\":\"active\"}"
echo "$FLOW_MESSAGE" > /tmp/flow-message.json
docker exec iot-kafka bash -c "cat /tmp/flow-message.json | kafka-console-producer --broker-list localhost:9092 --topic sensors-data"

# 5. Validate the alert threshold - demonstrate logic
echo -e "\n${YELLOW}Checking for alert conditions:${NC}"
if (( $(echo "$VALUE > 80" | bc -l) )); then
    echo -e "${RED}ALERT: Temperature above threshold ($VALUE > 80)${NC}"
    # Create an alert in the database
    docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "INSERT INTO alerts (device_id, alert_type, message, severity, value, threshold, status, triggered_at) VALUES ('device-001', 'threshold_exceeded', 'Temperature above threshold', 'high', $VALUE, 80, 'active', NOW()) RETURNING id, alert_type, value, threshold;"
    # Publish alert to Kafka
    THRESHOLD_ALERT="{\"alertId\":\"auto-$TEST_ID\",\"deviceId\":\"device-001\",\"type\":\"threshold_exceeded\",\"severity\":\"high\",\"message\":\"Temperature above threshold\",\"value\":$VALUE,\"threshold\":80,\"timestamp\":\"$TIMESTAMP\"}"
    echo "$THRESHOLD_ALERT" > /tmp/threshold-alert.json
    docker exec iot-kafka bash -c "cat /tmp/threshold-alert.json | kafka-console-producer --broker-list localhost:9092 --topic alerts"
else
    echo -e "${GREEN}Normal: Temperature within acceptable range ($VALUE <= 80)${NC}"
fi

echo -e "\n${GREEN}✅ Manual Testing Complete${NC}"
echo "You can also access the following web interfaces:"
echo "- Kafka UI: http://localhost:8080"
echo "- Redis Commander: http://localhost:8081"
