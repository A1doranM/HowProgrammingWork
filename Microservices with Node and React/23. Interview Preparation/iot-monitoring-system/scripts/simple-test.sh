#!/bin/bash

# Simplified Test Script for IoT Monitoring System
# This script tests PostgreSQL and Redis directly

echo "🧪 IoT Monitoring System - Simplified Testing"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test timestamp for all operations
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
TEST_ID=$(date +"%s")

echo -e "\n${BLUE}1. PostgreSQL - Insert and Query Test${NC}"
echo "----------------------------------------"

# Generate a random value
VALUE=$(echo "scale=1; 70 + $RANDOM % 20" | bc)
echo -e "${YELLOW}Generated test value: $VALUE°C${NC}"

# Insert a reading
echo -e "\n${YELLOW}Inserting a new reading:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "
  INSERT INTO sensor_readings (
    device_id, 
    timestamp, 
    sensor_type, 
    value, 
    unit, 
    location, 
    status
  ) VALUES (
    'device-001',
    NOW(),
    'temperature',
    $VALUE,
    'celsius',
    'assembly-line-1',
    'active'
  ) RETURNING id, device_id, value, timestamp;"

# Query readings for this device
echo -e "\n${YELLOW}Querying readings for device-001:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "
  SELECT 
    id, 
    device_id, 
    sensor_type, 
    value, 
    unit, 
    timestamp 
  FROM 
    sensor_readings 
  WHERE 
    device_id = 'device-001' 
  ORDER BY 
    timestamp DESC 
  LIMIT 5;"

echo -e "\n${BLUE}2. Redis - Cache Test${NC}"
echo "----------------------------------------"

# Store device status in Redis
echo -e "${YELLOW}Caching device status in Redis:${NC}"
docker exec iot-redis redis-cli HSET "device:device-001:current" "value" "$VALUE" "timestamp" "$TIMESTAMP" "status" "normal"

# Retrieve device status from Redis
echo -e "\n${YELLOW}Retrieving device status from Redis:${NC}"
docker exec iot-redis redis-cli HGETALL "device:device-001:current"

echo -e "\n${BLUE}3. Alert Logic Test${NC}"
echo "----------------------------------------"

# Test alert logic based on value
if (( $(echo "$VALUE > 80" | bc -l) )); then
    echo -e "${RED}🚨 ALERT: Temperature above threshold ($VALUE > 80)${NC}"
    
    # Create an alert in the database
    echo -e "\n${YELLOW}Creating alert in database:${NC}"
    docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "
      INSERT INTO alerts (
        device_id, 
        alert_type, 
        message, 
        severity, 
        value, 
        threshold, 
        status, 
        triggered_at
      ) VALUES (
        'device-001',
        'threshold_exceeded',
        'Temperature above normal range',
        'high',
        $VALUE,
        80,
        'active',
        NOW()
      ) RETURNING id, device_id, alert_type, severity, value, threshold;"
else
    echo -e "${GREEN}✅ NORMAL: Temperature within acceptable range ($VALUE ≤ 80)${NC}"
fi

# Count active alerts
echo -e "\n${YELLOW}Counting active alerts:${NC}"
docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "
  SELECT 
    COUNT(*) as active_alerts, 
    COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_alerts
  FROM 
    alerts 
  WHERE 
    status = 'active';"

echo -e "\n${GREEN}✅ Manual Testing Complete${NC}"
echo "You can also access the following web interfaces:"
echo "- Kafka UI: http://localhost:8080"
echo "- Redis Commander: http://localhost:8081"
