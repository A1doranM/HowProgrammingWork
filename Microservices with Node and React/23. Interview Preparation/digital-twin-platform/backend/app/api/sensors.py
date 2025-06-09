"""
API endpoints for sensor data management
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
import structlog

from app.models.sensor import (
    SensorReading, 
    SensorReadingResponse, 
    BatchSensorReading,
    MachineStatus,
    HealthCheckResponse
)
from app.services.redis_service import RedisService, get_redis_service
from app.websockets.connection_manager import ConnectionManager
from app.core.config import settings

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/v1", tags=["sensors"])

# This will be injected by the main app
connection_manager: Optional[ConnectionManager] = None


def get_connection_manager() -> ConnectionManager:
    """Dependency to get connection manager"""
    if connection_manager is None:
        raise HTTPException(500, "Connection manager not initialized")
    return connection_manager


async def process_sensor_reading_background(
    reading: SensorReading,
    redis_service: RedisService,
    manager: ConnectionManager
):
    """Background task to process sensor reading"""
    try:
        # Cache the reading
        await redis_service.cache_sensor_reading(
            reading.machine_id,
            reading,
            ttl=300  # 5 minutes
        )
        
        # Handle WebSocket broadcast
        await manager.handle_sensor_update(reading)
        
        # Update metrics
        await redis_service.increment_metric("sensor_readings_processed")
        await redis_service.increment_metric(f"sensor_readings_{reading.sensor_type}")
        
        logger.info(
            "Sensor reading processed",
            machine_id=reading.machine_id,
            sensor_type=reading.sensor_type,
            value=reading.value
        )
        
    except Exception as e:
        logger.error(
            "Failed to process sensor reading",
            error=str(e),
            machine_id=reading.machine_id
        )
        await redis_service.increment_metric("sensor_processing_errors")


@router.post(
    "/sensors/readings",
    response_model=SensorReadingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit sensor reading",
    description="Submit a single sensor reading for processing and real-time broadcast"
)
async def create_sensor_reading(
    reading: SensorReading,
    background_tasks: BackgroundTasks,
    redis_service: RedisService = Depends(get_redis_service),
    manager: ConnectionManager = Depends(get_connection_manager)
):
    """Submit a sensor reading for processing"""
    try:
        # Add processing timestamp
        response = SensorReadingResponse(
            **reading.dict(),
            id=f"{reading.machine_id}_{reading.sensor_type}_{int(reading.timestamp.timestamp())}",
            processed_at=datetime.utcnow()
        )
        
        # Process in background to ensure fast response
        background_tasks.add_task(
            process_sensor_reading_background,
            reading,
            redis_service,
            manager
        )
        
        return response
        
    except Exception as e:
        logger.error("Failed to create sensor reading", error=str(e))
        raise HTTPException(500, "Internal server error")


@router.post(
    "/sensors/readings/batch",
    response_model=List[SensorReadingResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Submit batch sensor readings",
    description="Submit multiple sensor readings for efficient batch processing"
)
async def create_batch_sensor_readings(
    batch: BatchSensorReading,
    background_tasks: BackgroundTasks,
    redis_service: RedisService = Depends(get_redis_service),
    manager: ConnectionManager = Depends(get_connection_manager)
):
    """Submit multiple sensor readings for batch processing"""
    try:
        responses = []
        
        for reading in batch.readings:
            response = SensorReadingResponse(
                **reading.dict(),
                id=f"{reading.machine_id}_{reading.sensor_type}_{int(reading.timestamp.timestamp())}",
                processed_at=datetime.utcnow()
            )
            responses.append(response)
            
            # Process each reading in background
            background_tasks.add_task(
                process_sensor_reading_background,
                reading,
                redis_service,
                manager
            )
        
        await redis_service.increment_metric("batch_readings_submitted", len(batch.readings))
        
        logger.info(
            "Batch sensor readings submitted",
            machine_id=batch.machine_id,
            count=len(batch.readings)
        )
        
        return responses
        
    except Exception as e:
        logger.error("Failed to create batch sensor readings", error=str(e))
        raise HTTPException(500, "Internal server error")


@router.get(
    "/sensors/readings/latest/{machine_id}",
    response_model=List[SensorReading],
    summary="Get latest readings",
    description="Get the latest cached sensor readings for a specific machine"
)
async def get_latest_readings(
    machine_id: str,
    sensor_type: Optional[str] = None,
    redis_service: RedisService = Depends(get_redis_service)
):
    """Get latest sensor readings for a machine"""
    try:
        if sensor_type:
            # Get specific sensor type
            reading = await redis_service.get_latest_reading(machine_id, sensor_type)
            return [reading] if reading else []
        else:
            # Get all sensor types for the machine
            # In a real implementation, you'd iterate through known sensor types
            # or store a list of active sensor types per machine
            from app.models.sensor import SensorType
            
            readings = []
            for sensor_type_enum in SensorType:
                reading = await redis_service.get_latest_reading(machine_id, sensor_type_enum.value)
                if reading:
                    readings.append(reading)
            
            return readings
            
    except Exception as e:
        logger.error("Failed to get latest readings", error=str(e))
        raise HTTPException(500, "Internal server error")


@router.get(
    "/machines",
    response_model=List[str],
    summary="Get active machines",
    description="Get list of currently active machines"
)
async def get_active_machines(
    redis_service: RedisService = Depends(get_redis_service)
):
    """Get list of active machines"""
    try:
        machines = await redis_service.get_active_machines()
        return machines
    except Exception as e:
        logger.error("Failed to get active machines", error=str(e))
        raise HTTPException(500, "Internal server error")


@router.get(
    "/machines/{machine_id}/status",
    response_model=MachineStatus,
    summary="Get machine status",
    description="Get current status information for a specific machine"
)
async def get_machine_status(
    machine_id: str,
    redis_service: RedisService = Depends(get_redis_service)
):
    """Get machine status"""
    try:
        status = await redis_service.get_machine_status(machine_id)
        if not status:
            raise HTTPException(404, f"Machine {machine_id} not found")
        
        return status
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get machine status", error=str(e))
        raise HTTPException(500, "Internal server error")


@router.post(
    "/machines/{machine_id}/status",
    response_model=MachineStatus,
    summary="Update machine status",
    description="Update status information for a specific machine"
)
async def update_machine_status(
    machine_id: str,
    status: MachineStatus,
    redis_service: RedisService = Depends(get_redis_service),
    manager: ConnectionManager = Depends(get_connection_manager)
):
    """Update machine status"""
    try:
        # Validate machine_id matches
        if status.machine_id != machine_id:
            raise HTTPException(400, "Machine ID in path and body must match")
        
        # Cache the status
        await redis_service.cache_machine_status(status, ttl=600)
        
        # Broadcast status update
        await manager.handle_machine_status_update(machine_id, status.dict())
        
        await redis_service.increment_metric("machine_status_updates")
        
        logger.info("Machine status updated", machine_id=machine_id)
        
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update machine status", error=str(e))
        raise HTTPException(500, "Internal server error")


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Health check",
    description="Check service health status"
)
async def health_check(
    redis_service: RedisService = Depends(get_redis_service)
):
    """Service health check"""
    try:
        redis_health = await redis_service.health_check()
        
        return HealthCheckResponse(
            status="healthy" if redis_health["status"] == "healthy" else "degraded",
            version=settings.version
        )
        
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return HealthCheckResponse(
            status="unhealthy",
            version=settings.version
        )


@router.get(
    "/metrics",
    summary="Get metrics",
    description="Get application metrics"
)
async def get_metrics(
    redis_service: RedisService = Depends(get_redis_service),
    manager: ConnectionManager = Depends(get_connection_manager)
):
    """Get application metrics"""
    try:
        redis_metrics = await redis_service.get_all_metrics()
        connection_stats = manager.get_connection_stats()
        
        return {
            "redis_metrics": redis_metrics,
            "websocket_stats": connection_stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error("Failed to get metrics", error=str(e))
        raise HTTPException(500, "Internal server error")


@router.get(
    "/debug/connections",
    summary="Debug: WebSocket connections",
    description="Get detailed WebSocket connection information (debug endpoint)"
)
async def debug_connections(
    manager: ConnectionManager = Depends(get_connection_manager)
):
    """Debug endpoint to inspect WebSocket connections"""
    try:
        return manager.get_connection_stats()
    except Exception as e:
        logger.error("Failed to get connection debug info", error=str(e))
        raise HTTPException(500, "Internal server error")


# Function to set connection manager (called from main app)
def set_connection_manager(manager: ConnectionManager):
    """Set the global connection manager instance"""
    global connection_manager
    connection_manager = manager
