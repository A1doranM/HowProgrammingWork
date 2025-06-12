#!/bin/bash

# IoT Monitoring System Comprehensive Test Script
# This script performs complete end-to-end testing of the IoT monitoring system
# including Kafka KRaft mode, PostgreSQL, Redis, and all microservices

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to display messages
log() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
  ((PASSED_TESTS++))
}

warn() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
  ((FAILED_TESTS++))
}

test_start() {
  echo -e "${PURPLE}[TEST]${NC} $1"
  ((TOTAL_TESTS++))
}

info() {
  echo -e "${CYAN}[INFO]${NC} $1"
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

# Function to test Kafka KRaft mode and topics
test_kafka() {
  test_start "Testing Kafka KRaft mode and topics"
  
  # Check if Kafka container is running
  if ! docker ps | grep -q "iot-kafka"; then
    error "Kafka container is not running"
    return 1
  fi
  
  # Test Kafka broker connectivity
  if docker exec iot-kafka kafka-broker-api-versions --bootstrap-server localhost:9092 >/dev/null 2>&1; then
    success "Kafka broker is accessible"
  else
    error "Cannot connect to Kafka broker"
    return 1
  fi
  
  # Check if topics exist
  info "Checking Kafka topics..."
  local topics=$(docker exec iot-kafka kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null)
  
  if echo "$topics" | grep -q "sensors-data"; then
    success "sensors-data topic exists"
  else
    error "sensors-data topic not found"
  fi
  
  if echo "$topics" | grep -q "alerts"; then
    success "alerts topic exists"
  else
    error "alerts topic not found"
  fi
  
  # Check consumer groups
  info "Checking Kafka consumer groups..."
  local groups=$(docker exec iot-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list 2>/dev/null)
  
  if echo "$groups" | grep -q "data-ingestion-group"; then
    success "data-ingestion-group consumer group found"
  else
    warn "data-ingestion-group consumer group not found"
  fi
  
  if echo "$groups" | grep -q "alert-processing-group"; then
    success "alert-processing-group consumer group found"
  else
    warn "alert-processing-group consumer group not found"
  fi
}

# Function to test PostgreSQL database
test_database() {
  test_start "Testing PostgreSQL database connectivity and schema"
  
  # Check if PostgreSQL container is running
  if ! docker ps | grep -q "iot-postgresql"; then
    error "PostgreSQL container is not running"
    return 1
  fi
  
  # Test database connectivity
  if docker exec iot-postgresql pg_isready -U iot_user -d iot_monitoring >/dev/null 2>&1; then
    success "PostgreSQL database is accessible"
  else
    error "Cannot connect to PostgreSQL database"
    return 1
  fi
  
  # Check if tables exist
  info "Checking database schema..."
  local tables=$(docker exec iot-postgresql psql -U iot_user -d iot_monitoring -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null | tr -d ' ')
  
  if echo "$tables" | grep -q "devices"; then
    success "devices table exists"
  else
    error "devices table not found"
  fi
  
  if echo "$tables" | grep -q "sensor_readings"; then
    success "sensor_readings table exists"
  else
    error "sensor_readings table not found"
  fi
  
  # Test data insertion capability
  local test_query="INSERT INTO devices (device_id, device_type, location) VALUES ('test-device-$$', 'test', 'test-location') ON CONFLICT (device_id) DO NOTHING;"
  if docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "$test_query" >/dev/null 2>&1; then
    success "Database write operation successful"
    
    # Clean up test data
    docker exec iot-postgresql psql -U iot_user -d iot_monitoring -c "DELETE FROM devices WHERE device_id = 'test-device-$$';" >/dev/null 2>&1
  else
    error "Database write operation failed"
  fi
}

# Function to test Redis connectivity and operations
test_redis() {
  test_start "Testing Redis connectivity and operations"
  
  # Check if Redis container is running
  if ! docker ps | grep -q "iot-redis"; then
    error "Redis container is not running"
    return 1
  fi
  
  # Test Redis connectivity
  if docker exec iot-redis redis-cli ping | grep -q "PONG"; then
    success "Redis is accessible"
  else
    error "Cannot connect to Redis"
    return 1
  fi
  
  # Test Redis operations
  local test_key="test-key-$$"
  local test_value="test-value-$$"
  
  if docker exec iot-redis redis-cli set "$test_key" "$test_value" >/dev/null 2>&1; then
    local retrieved_value=$(docker exec iot-redis redis-cli get "$test_key" 2>/dev/null)
    if [ "$retrieved_value" = "$test_value" ]; then
      success "Redis read/write operations successful"
      docker exec iot-redis redis-cli del "$test_key" >/dev/null 2>&1
    else
      error "Redis read operation failed"
    fi
  else
    error "Redis write operation failed"
  fi
}

# Function to test data ingestion flow
test_data_ingestion() {
  test_start "Testing data ingestion flow (Simulator → Kafka → Database)"
  
  # Wait for services to be ready
  info "Waiting for services to be ready..."
  sleep 5
  
  # Get initial count of sensor readings
  local initial_count=$(docker exec iot-postgresql psql -U iot_user -d iot_monitoring -t -c "SELECT COUNT(*) FROM sensor_readings;" 2>/dev/null | tr -d ' ')
  
  if [ -z "$initial_count" ]; then
    initial_count=0
  fi
  
  info "Initial sensor readings count: $initial_count"
  
  # Wait for new data to be ingested (simulator should be generating data)
  info "Waiting for new sensor data to be ingested..."
  sleep 15
  
  # Check if new data has been ingested
  local final_count=$(docker exec iot-postgresql psql -U iot_user -d iot_monitoring -t -c "SELECT COUNT(*) FROM sensor_readings;" 2>/dev/null | tr -d ' ')
  
  if [ -z "$final_count" ]; then
    final_count=0
  fi
  
  info "Final sensor readings count: $final_count"
  
  if [ "$final_count" -gt "$initial_count" ]; then
    success "Data ingestion flow is working (new data: $((final_count - initial_count)) records)"
  else
    error "No new data ingested - data flow may be broken"
  fi
  
  # Check if recent data exists
  local recent_data=$(docker exec iot-postgresql psql -U iot_user -d iot_monitoring -t -c "SELECT COUNT(*) FROM sensor_readings WHERE timestamp > NOW() - INTERVAL '1 minute';" 2>/dev/null | tr -d ' ')
  
  if [ "$recent_data" -gt "0" ]; then
    success "Recent sensor data found in database ($recent_data records)"
  else
    warn "No recent sensor data found in database"
  fi
}

# Function to test alert processing
test_alert_processing() {
  test_start "Testing alert processing system"
  
  # Check if alert processing service is healthy
  if ! check_service_health "Alert Processing Service" "http://localhost:3004/health" 3 2; then
    error "Alert processing service is not healthy"
    return 1
  fi
  
  # Check if alert processing service is consuming from Kafka
  info "Checking Kafka consumer group for alert processing..."
  local consumer_info=$(docker exec iot-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group alert-processing-group 2>/dev/null || echo "")
  
  if echo "$consumer_info" | grep -q "sensors-data"; then
    success "Alert processing service is consuming from sensors-data topic"
  else
    warn "Alert processing service consumer group not found or not active"
  fi
  
  # Test alert endpoint if available
  local alert_response=$(curl -s http://localhost:3004/health 2>/dev/null || echo "")
  if echo "$alert_response" | grep -q "alert-processing\|healthy\|ok"; then
    success "Alert processing service is responding"
  else
    warn "Alert processing service may not be responding properly"
  fi
}

# Function to test WebSocket functionality
test_websocket() {
  test_start "Testing WebSocket service functionality"
  
  # Check if WebSocket service is healthy
  if ! check_service_health "WebSocket Service" "http://localhost:3003/health" 3 2; then
    error "WebSocket service is not healthy"
    return 1
  fi
  
  # Test WebSocket endpoint accessibility
  local ws_response=$(curl -s http://localhost:3003/health 2>/dev/null || echo "")
  if echo "$ws_response" | grep -q "websocket\|healthy\|ok"; then
    success "WebSocket service is responding"
  else
    error "WebSocket service health check failed"
  fi
  
  # Check if WebSocket service is consuming from Kafka
  info "Checking Kafka consumer group for WebSocket service..."
  local consumer_info=$(docker exec iot-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group websocket-consumer-group 2>/dev/null || echo "")
  
  if echo "$consumer_info" | grep -q "sensors-data"; then
    success "WebSocket service is consuming from sensors-data topic"
  else
    warn "WebSocket service consumer group not found or not active"
  fi
}

# Function to test API endpoints comprehensively
test_api_comprehensive() {
  test_start "Testing API endpoints comprehensively"
  
  # Test API Gateway health endpoint
  local response=$(curl -s http://localhost:3000/health 2>/dev/null || echo "")
  if echo "$response" | grep -q "api-gateway\|healthy\|ok"; then
    success "API Gateway health check successful"
  else
    error "API Gateway health check failed"
  fi
  
  # Test devices endpoint
  info "Testing devices API endpoint..."
  local devices_response=$(curl -s http://localhost:3000/api/devices 2>/dev/null || echo "")
  if echo "$devices_response" | grep -q "\[\|\{.*device"; then
    success "Devices API endpoint is responding with data"
  else
    warn "Devices API endpoint may not have data yet"
  fi
  
  # Test sensor readings endpoint
  info "Testing sensor readings API endpoint..."
  local readings_response=$(curl -s http://localhost:3000/api/sensor-readings 2>/dev/null || echo "")
  if echo "$readings_response" | grep -q "\[\|\{.*reading\|\{.*sensor"; then
    success "Sensor readings API endpoint is responding with data"
  else
    warn "Sensor readings API endpoint may not have data yet"
  fi
  
  # Test data ingestion service health
  if check_service_health "Data Ingestion Service" "http://localhost:3002/health" 3 2; then
    success "Data Ingestion Service is healthy"
  else
    error "Data Ingestion Service health check failed"
  fi
}

# Function to run complete end-to-end test
test_complete_system() {
  log "Starting comprehensive IoT Monitoring System test..."
  echo "=================================================="
  
  # Reset test counters
  TOTAL_TESTS=0
  PASSED_TESTS=0
  FAILED_TESTS=0
  
  # Test infrastructure components
  test_kafka
  test_database
  test_redis
  
  # Test services
  test_api_comprehensive
  test_websocket
  test_alert_processing
  
  # Test data flow
  test_data_ingestion
  
  # Display test summary
  echo "=================================================="
  echo -e "${CYAN}TEST SUMMARY${NC}"
  echo "=================================================="
  echo -e "Total Tests: $TOTAL_TESTS"
  echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
  echo -e "${RED}Failed: $FAILED_TESTS${NC}"
  
  if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! System is working correctly.${NC}"
  else
    echo -e "${RED}❌ Some tests failed. Please check the system.${NC}"
  fi
  
  echo "=================================================="
}

# Function to start the system
start_system() {
  log "Starting IoT Monitoring System..."
  
  # Build and start the services
  docker-compose build
  docker-compose up -d
  
  # Wait for services to start
  log "Waiting for services to start..."
  sleep 15
  
  # Check services health
  check_service_health "API Gateway" "http://localhost:3000/health" 5 5 || true
  check_service_health "Data Ingestion Service" "http://localhost:3002/health" 5 5 || true
  check_service_health "WebSocket Service" "http://localhost:3003/health" 5 5 || true
  check_service_health "Alert Processing Service" "http://localhost:3004/health" 5 5 || true
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

# Function to test API endpoints (legacy)
test_api() {
  test_api_comprehensive
}

# Function to display resource usage
show_resources() {
  log "Showing container resource usage..."
  docker stats --no-stream
}

# Function to show system status
show_status() {
  log "IoT Monitoring System Status"
  echo "=================================================="
  
  # Show container status
  echo -e "${CYAN}Container Status:${NC}"
  docker-compose ps
  
  echo ""
  echo -e "${CYAN}Service Health:${NC}"
  
  # Quick health checks
  if curl -s http://localhost:3000/health >/dev/null 2>&1; then
    echo -e "API Gateway: ${GREEN}✓ Healthy${NC}"
  else
    echo -e "API Gateway: ${RED}✗ Unhealthy${NC}"
  fi
  
  if curl -s http://localhost:3002/health >/dev/null 2>&1; then
    echo -e "Data Ingestion: ${GREEN}✓ Healthy${NC}"
  else
    echo -e "Data Ingestion: ${RED}✗ Unhealthy${NC}"
  fi
  
  if curl -s http://localhost:3003/health >/dev/null 2>&1; then
    echo -e "WebSocket Service: ${GREEN}✓ Healthy${NC}"
  else
    echo -e "WebSocket Service: ${RED}✗ Unhealthy${NC}"
  fi
  
  if curl -s http://localhost:3004/health >/dev/null 2>&1; then
    echo -e "Alert Processing: ${GREEN}✓ Healthy${NC}"
  else
    echo -e "Alert Processing: ${RED}✗ Unhealthy${NC}"
  fi
  
  if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    echo -e "IoT Simulator: ${GREEN}✓ Healthy${NC}"
  else
    echo -e "IoT Simulator: ${RED}✗ Unhealthy${NC}"
  fi
  
  echo "=================================================="
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
    test_api_comprehensive
    ;;
  test-full|test-complete)
    test_complete_system
    ;;
  test-kafka)
    test_kafka
    ;;
  test-database)
    test_database
    ;;
  test-redis)
    test_redis
    ;;
  test-ingestion)
    test_data_ingestion
    ;;
  test-alerts)
    test_alert_processing
    ;;
  test-websocket)
    test_websocket
    ;;
  status)
    show_status
    ;;
  resources)
    show_resources
    ;;
  *)
    echo "IoT Monitoring System Comprehensive Test Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "System Commands:"
    echo "  start           - Start the IoT Monitoring System"
    echo "  stop            - Stop the IoT Monitoring System"
    echo "  restart         - Restart the IoT Monitoring System"
    echo "  status          - Show system status and health"
    echo "  logs [service]  - View logs (optionally for a specific service)"
    echo "  resources       - Show container resource usage"
    echo ""
    echo "Testing Commands:"
    echo "  test-full       - Run complete end-to-end system test"
    echo "  test            - Run basic API tests"
    echo "  test-kafka      - Test Kafka KRaft mode and topics"
    echo "  test-database   - Test PostgreSQL connectivity and schema"
    echo "  test-redis      - Test Redis operations"
    echo "  test-ingestion  - Test data ingestion flow"
    echo "  test-alerts     - Test alert processing system"
    echo "  test-websocket  - Test WebSocket functionality"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 test-full"
    echo "  $0 logs api-gateway"
    echo "  $0 status"
    ;;
esac
