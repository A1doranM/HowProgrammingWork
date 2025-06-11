#!/bin/bash

# Simple script to test IoT Simulator functionality

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}IoT Simulator Test${NC}"
echo "======================"

# 1. Build the service
echo -e "\n${YELLOW}Building IoT Simulator...${NC}"
cd "$(dirname "$0")"
npm install

# 2. Check if Kafka is running
echo -e "\n${YELLOW}Checking if Kafka is running...${NC}"
if nc -z localhost 9092 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Kafka is running${NC}"
else
    echo -e "${RED}✗ Kafka is not running${NC}"
    echo "Please start the infrastructure first with:"
    echo "  cd ../../"
    echo "  docker-compose up -d zookeeper kafka kafka-init"
    exit 1
fi

# 3. Start the simulator in development mode
echo -e "\n${YELLOW}Starting IoT Simulator in development mode...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
npm run dev
