#!/bin/bash

# IoT Monitoring System - Setup Script
# Phase 1: Foundation Layer Setup and Testing

echo "🚀 IoT Monitoring System - Infrastructure Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}1. Infrastructure Startup${NC}"
echo "----------------------------------------"

# Change to project root directory (from scripts/ to project root)
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi

# Check if Docker is running
echo -n "Checking Docker daemon... "
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓ RUNNING${NC}"
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down > /dev/null 2>&1

# Start infrastructure services
echo "Starting infrastructure services..."
echo -e "${YELLOW}This may take a few minutes for initial setup...${NC}"

# Start services in dependency order
docker-compose up -d zookeeper
echo "Waiting for Zookeeper to be ready..."
sleep 10

docker-compose up -d kafka
echo "Waiting for Kafka to be ready..."
sleep 15

docker-compose up -d postgresql redis
echo "Waiting for PostgreSQL and Redis to be ready..."
sleep 10

# Initialize Kafka topics
docker-compose up kafka-init
sleep 5

# Start optional development tools
docker-compose up -d kafka-ui redis-commander
echo "Starting development tools..."
sleep 5

echo -e "\n${BLUE}2. Verifying Service Health${NC}"
echo "----------------------------------------"

# Wait for services to be fully ready
echo "Waiting for all services to be healthy..."
for i in {1..30}; do
    if docker-compose ps | grep -q "unhealthy\|starting"; then
        echo -n "."
        sleep 2
    else
        break
    fi
done
echo ""

echo -e "\n${BLUE}3. Running Health Checks${NC}"
echo "----------------------------------------"

# Run the health check script
cd scripts
./health-check.sh
HEALTH_STATUS=$?

echo -e "\n${BLUE}4. Service URLs${NC}"
echo "----------------------------------------"

if [ $HEALTH_STATUS -eq 0 ]; then
    echo -e "${GREEN}Infrastructure is ready! Access points:${NC}"
    echo ""
    echo "Database (PostgreSQL):"
    echo "  Host: localhost:5432"
    echo "  Database: iot_monitoring"
    echo "  Username: iot_user"
    echo "  Connection: psql -h localhost -U iot_user -d iot_monitoring"
    echo ""
    echo "Cache (Redis):"
    echo "  Host: localhost:6379"
    echo "  Connection: redis-cli -h localhost -p 6379"
    echo ""
    echo "Message Broker (Kafka):"
    echo "  Brokers: localhost:9092"
    echo "  Topics: sensors-data, alerts, metrics"
    echo ""
    echo "Development Tools:"
    echo "  Kafka UI: http://localhost:8080"
    echo "  Redis Commander: http://localhost:8081"
    echo ""
    echo -e "${GREEN}🎉 PHASE 1 COMPLETE: Foundation Layer Ready!${NC}"
    echo -e "${GREEN}✅ Ready to proceed to Phase 2: Data Generation & Ingestion${NC}"
else
    echo -e "${RED}❌ Infrastructure setup incomplete${NC}"
    echo "Check the health check output above for specific issues."
    echo ""
    echo "Common troubleshooting steps:"
    echo "1. Ensure Docker has enough resources (4GB+ RAM recommended)"
    echo "2. Check if ports are available (5432, 6379, 9092, 8080, 8081)"
    echo "3. Wait longer for services to start and try again"
    echo "4. Check Docker logs: docker-compose logs [service-name]"
    echo ""
    echo "To restart the setup:"
    echo "  docker-compose down && ./scripts/setup.sh"
fi

exit $HEALTH_STATUS
