#!/bin/bash

# IoT Monitoring System Test Script
# This script helps with running and testing the IoT monitoring system

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display messages
log() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a service is healthy
check_service_health() {
  local service=$1
  local url=$2
  local max_attempts=$3
  local delay=$4
  
  log "Checking health of $service at $url (max $max_attempts attempts with $delay second delay)..."
  
  for (( i=1; i<=$max_attempts; i++ )); do
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
      success "$service is healthy! (attempt $i/$max_attempts)"
      return 0
    else
      warn "$service health check failed (attempt $i/$max_attempts). Retrying in $delay seconds..."
      sleep $delay
    fi
  done
  
  error "$service health check failed after $max_attempts attempts"
  return 1
}

# Function to start the system
start_system() {
  log "Starting IoT Monitoring System..."
  
  # Build and start the services
  docker-compose build
  docker-compose up -d
  
  # Wait for a moment to allow services to start
  log "Waiting for services to start..."
  sleep 10
  
  # Check services health
  check_service_health "PostgreSQL" "http://localhost:5432" 3 5 || true
  check_service_health "API Gateway" "http://localhost:3000/health" 5 5 || true
  check_service_health "Data Ingestion Service" "http://localhost:3002/health" 5 5 || true
  check_service_health "WebSocket Service" "http://localhost:3003/health" 5 5 || true
  check_service_health "IoT Simulator" "http://localhost:3001/health" 5 5 || true
  
  success "System started and health checks completed"
  log "IoT Monitoring System is now running"
  log "  - Dashboard: http://localhost:3000"
  log "  - API Gateway: http://localhost:3000/api"
  log "  - WebSocket Service: ws://localhost:3003"
  log "  - Kafka UI: http://localhost:8080"
  log "  - Redis Commander: http://localhost:8081"
}

# Function to stop the system
stop_system() {
  log "Stopping IoT Monitoring System..."
  docker-compose down
  success "System stopped"
}

# Function to view logs
view_logs() {
  local service=$1
  if [ -z "$service" ]; then
    log "Viewing logs for all services (press Ctrl+C to exit)..."
    docker-compose logs -f
  else
    log "Viewing logs for $service (press Ctrl+C to exit)..."
    docker-compose logs -f "$service"
  fi
}

# Function to test API endpoints
test_api() {
  log "Testing API endpoints..."
  
  # Test API Gateway health endpoint
  response=$(curl -s http://localhost:3000/health)
  if [[ $response == *"api-gateway"* ]]; then
    success "API Gateway health check successful"
  else
    error "API Gateway health check failed"
  fi
  
  # Test devices endpoint
  response=$(curl -s http://localhost:3000/api/devices)
  if [[ $response == *"["* || $response == *"devices"* ]]; then
    success "Devices API endpoint check successful"
  else
    error "Devices API endpoint check failed"
  fi
  
  # Test sensor readings endpoint
  response=$(curl -s http://localhost:3000/api/sensor-readings)
  if [[ $response == *"["* || $response == *"readings"* ]]; then
    success "Sensor readings API endpoint check successful"
  else
    error "Sensor readings API endpoint check failed"
  fi
}

# Function to display resource usage
show_resources() {
  log "Showing container resource usage..."
  docker stats --no-stream
}

# Main script logic
case "$1" in
  start)
    start_system
    ;;
  stop)
    stop_system
    ;;
  restart)
    stop_system
    start_system
    ;;
  logs)
    view_logs "$2"
    ;;
  test)
    test_api
    ;;
  resources)
    show_resources
    ;;
  *)
    echo "IoT Monitoring System Test Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start      - Start the IoT Monitoring System"
    echo "  stop       - Stop the IoT Monitoring System"
    echo "  restart    - Restart the IoT Monitoring System"
    echo "  logs [svc] - View logs (optionally for a specific service)"
    echo "  test       - Run API tests"
    echo "  resources  - Show container resource usage"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs api-gateway"
    echo "  $0 test"
    ;;
esac
