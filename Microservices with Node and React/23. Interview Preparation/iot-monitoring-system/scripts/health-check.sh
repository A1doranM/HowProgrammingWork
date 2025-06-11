#!/bin/bash

# IoT Monitoring System - Infrastructure Health Check Script
# Phase 1: Foundation Layer Testing

echo "🔍 IoT Monitoring System - Infrastructure Health Check"
echo "=================================================="

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local check_command=$2
    local description=$3
    
    echo -n "Checking $service_name ($description)... "
    
    if eval $check_command > /dev/null 2>&1; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}✗ UNHEALTHY${NC}"
        return 1
    fi
}

# Function to test database connection
test_postgres() {
    local query="SELECT COUNT(*) FROM devices;"
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c "$query"
}

# Function to test Redis connection
test_redis() {
    redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
}

# Function to test Kafka connection
test_kafka() {
    timeout 10 kafka-topics --bootstrap-server $KAFKA_BROKERS --list
}

echo -e "\n${BLUE}1. Container Health Checks${NC}"
echo "----------------------------------------"

# Check Docker containers
check_service "PostgreSQL Container" "docker ps --filter name=iot-postgresql --filter status=running -q" "Database Container"
check_service "Redis Container" "docker ps --filter name=iot-redis --filter status=running -q" "Cache Container"
check_service "Kafka Container" "docker ps --filter name=iot-kafka --filter status=running -q" "Message Broker Container"
check_service "Zookeeper Container" "docker ps --filter name=iot-zookeeper --filter status=running -q" "Kafka Coordination"

echo -e "\n${BLUE}2. Service Connectivity Tests${NC}"
echo "----------------------------------------"

# Test PostgreSQL connection
echo -n "Testing PostgreSQL connection... "
if docker exec iot-postgresql pg_isready -U $POSTGRES_USER -d $POSTGRES_DB > /dev/null 2>&1; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
    POSTGRES_CONNECTED=true
else
    echo -e "${RED}✗ CONNECTION FAILED${NC}"
    POSTGRES_CONNECTED=false
fi

# Test Redis connection
echo -n "Testing Redis connection... "
if docker exec iot-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
    REDIS_CONNECTED=true
else
    echo -e "${RED}✗ CONNECTION FAILED${NC}"
    REDIS_CONNECTED=false
fi

# Test Kafka connection
echo -n "Testing Kafka connection... "
if docker exec iot-kafka kafka-topics --bootstrap-server kafka:29092 --list > /dev/null 2>&1; then
    echo -e "${GREEN}✓ CONNECTED${NC}"
    KAFKA_CONNECTED=true
else
    echo -e "${RED}✗ CONNECTION FAILED${NC}"
    KAFKA_CONNECTED=false
fi

echo -e "\n${BLUE}3. Database Schema Validation${NC}"
echo "----------------------------------------"

if [ "$POSTGRES_CONNECTED" = true ]; then
    # Check if tables exist
    echo -n "Checking database tables... "
    TABLES=$(docker exec iot-postgresql psql -U iot_user -d iot_monitoring -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    if [ "$TABLES" -ge 6 ]; then
        echo -e "${GREEN}✓ $TABLES TABLES FOUND${NC}"
    else
        echo -e "${RED}✗ MISSING TABLES (Found: $TABLES, Expected: 6+)${NC}"
    fi
    
    # Check device data
    echo -n "Checking device configurations... "
    DEVICES=$(docker exec iot-postgresql psql -U iot_user -d iot_monitoring -t -c "SELECT COUNT(*) FROM devices;" | xargs)
    if [ "$DEVICES" -eq 5 ]; then
        echo -e "${GREEN}✓ 5 DEVICES CONFIGURED${NC}"
    else
        echo -e "${RED}✗ INCORRECT DEVICE COUNT (Found: $DEVICES, Expected: 5)${NC}"
    fi
    
    # Check indexes
    echo -n "Checking database indexes... "
    INDEXES=$(docker exec iot-postgresql psql -U iot_user -d iot_monitoring -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" | xargs)
    if [ "$INDEXES" -ge 10 ]; then
        echo -e "${GREEN}✓ $INDEXES INDEXES CREATED${NC}"
    else
        echo -e "${YELLOW}⚠ LOW INDEX COUNT (Found: $INDEXES)${NC}"
    fi
else
    echo -e "${RED}✗ SKIPPING DATABASE TESTS (No connection)${NC}"
fi

echo -e "\n${BLUE}4. Kafka Topics Validation${NC}"
echo "----------------------------------------"

if [ "$KAFKA_CONNECTED" = true ]; then
    # Check required topics
    TOPICS=$(docker exec iot-kafka kafka-topics --bootstrap-server kafka:29092 --list 2>/dev/null)
    
    for topic in "sensors-data" "alerts" "metrics"; do
        echo -n "Checking topic '$topic'... "
        if echo "$TOPICS" | grep -q "^$topic$"; then
            echo -e "${GREEN}✓ EXISTS${NC}"
        else
            echo -e "${RED}✗ MISSING${NC}"
        fi
    done
else
    echo -e "${RED}✗ SKIPPING KAFKA TESTS (No connection)${NC}"
fi

echo -e "\n${BLUE}5. Redis Configuration Test${NC}"
echo "----------------------------------------"

if [ "$REDIS_CONNECTED" = true ]; then
    # Test Redis write/read
    echo -n "Testing Redis read/write operations... "
    TEST_KEY="iot:health:test:$(date +%s)"
    TEST_VALUE="health-check-$(date +%s)"
    
    if docker exec iot-redis redis-cli SET "$TEST_KEY" "$TEST_VALUE" > /dev/null 2>&1; then
        RETRIEVED=$(docker exec iot-redis redis-cli GET "$TEST_KEY" 2>/dev/null)
        if [ "$RETRIEVED" = "$TEST_VALUE" ]; then
            echo -e "${GREEN}✓ READ/WRITE OK${NC}"
            docker exec iot-redis redis-cli DEL "$TEST_KEY" > /dev/null 2>&1
        else
            echo -e "${RED}✗ READ/WRITE FAILED${NC}"
        fi
    else
        echo -e "${RED}✗ WRITE FAILED${NC}"
    fi
    
    # Check Redis memory settings
    echo -n "Checking Redis memory configuration... "
    MAX_MEMORY=$(docker exec iot-redis redis-cli CONFIG GET maxmemory | tail -n 1 2>/dev/null)
    if [ "$MAX_MEMORY" != "0" ]; then
        echo -e "${GREEN}✓ MEMORY LIMIT SET${NC}"
    else
        echo -e "${YELLOW}⚠ NO MEMORY LIMIT${NC}"
    fi
else
    echo -e "${RED}✗ SKIPPING REDIS TESTS (No connection)${NC}"
fi

echo -e "\n${BLUE}6. Performance Baseline Test${NC}"
echo "----------------------------------------"

if [ "$POSTGRES_CONNECTED" = true ]; then
    echo -n "Testing database insert performance... "
    START_TIME=$(date +%s%N)
    for i in {1..100}; do
        docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "INSERT INTO sensor_readings (device_id, timestamp, sensor_type, value, unit, location) VALUES ('test-device', NOW(), 'test', $i, 'unit', 'test-location');" > /dev/null 2>&1
    done
    END_TIME=$(date +%s%N)
    DURATION=$(( (END_TIME - START_TIME) / 1000000 )) # Convert to milliseconds
    
    # Cleanup test data
    docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "DELETE FROM sensor_readings WHERE device_id = 'test-device';" > /dev/null 2>&1
    
    if [ $DURATION -lt 5000 ]; then # Less than 5 seconds for 100 inserts
        echo -e "${GREEN}✓ GOOD PERFORMANCE (${DURATION}ms for 100 inserts)${NC}"
    else
        echo -e "${YELLOW}⚠ SLOW PERFORMANCE (${DURATION}ms for 100 inserts)${NC}"
    fi
fi

echo -e "\n${BLUE}7. Summary${NC}"
echo "========================================"

# Count successful checks
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Calculate overall health status
if [ "$POSTGRES_CONNECTED" = true ]; then
    ((PASSED_CHECKS++))
fi
if [ "$REDIS_CONNECTED" = true ]; then
    ((PASSED_CHECKS++))
fi
if [ "$KAFKA_CONNECTED" = true ]; then
    ((PASSED_CHECKS++))
fi
TOTAL_CHECKS=3

echo "Infrastructure Health: $PASSED_CHECKS/$TOTAL_CHECKS services operational"

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}🎉 PHASE 1: FOUNDATION LAYER - ALL SYSTEMS OPERATIONAL${NC}"
    echo -e "${GREEN}✅ Ready for Phase 2: Data Generation & Ingestion${NC}"
    exit 0
elif [ $PASSED_CHECKS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  PHASE 1: FOUNDATION LAYER - PARTIAL SUCCESS${NC}"
    echo -e "${YELLOW}⚠️  Some services need attention before proceeding${NC}"
    exit 1
else
    echo -e "${RED}❌ PHASE 1: FOUNDATION LAYER - CRITICAL FAILURE${NC}"
    echo -e "${RED}❌ Infrastructure setup required before proceeding${NC}"
    exit 2
fi
