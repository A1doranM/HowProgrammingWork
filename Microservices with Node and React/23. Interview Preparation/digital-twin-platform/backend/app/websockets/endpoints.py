"""
WebSocket endpoints for real-time communication
"""
import json
import asyncio
from typing import Optional

from fastapi import WebSocket, WebSocketDisconnect
import structlog

from app.models.sensor import WebSocketMessage
from app.websockets.connection_manager import ConnectionManager
from app.services.redis_service import RedisService

logger = structlog.get_logger(__name__)


async def websocket_machine_endpoint(
    websocket: WebSocket,
    machine_id: str,
    connection_manager: ConnectionManager,
    redis_service: RedisService,
    token: Optional[str] = None
):
    """WebSocket endpoint for machine-specific updates"""
    try:
        # Basic authentication (in production, implement proper JWT validation)
        user_id = None
        if token:
            # In a real implementation, validate JWT token here
            user_id = "user_from_token"  # Placeholder
        
        # Connect to WebSocket
        await connection_manager.connect(
            websocket,
            machine_id=machine_id,
            user_id=user_id,
            metadata={"endpoint_type": "machine_specific"}
        )
        
        logger.info("WebSocket connection established", machine_id=machine_id, user_id=user_id)
        
        # Send initial data
        latest_readings = []
        from app.models.sensor import SensorType
        
        for sensor_type in SensorType:
            reading = await redis_service.get_latest_reading(machine_id, sensor_type.value)
            if reading:
                latest_readings.append(reading.dict())
        
        if latest_readings:
            initial_message = WebSocketMessage(
                type="initial_data",
                data={"readings": latest_readings},
                machine_id=machine_id
            )
            await connection_manager.send_personal_message(initial_message, websocket)
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for messages from client with timeout
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
                message_data = json.loads(data)
                
                await handle_client_message(
                    message_data,
                    websocket,
                    machine_id,
                    connection_manager,
                    redis_service
                )
                
            except asyncio.TimeoutError:
                # Send heartbeat if no message received
                heartbeat = WebSocketMessage(
                    type="heartbeat",
                    data={"timestamp": "now"}
                )
                await connection_manager.send_personal_message(heartbeat, websocket)
                
            except json.JSONDecodeError:
                error_message = WebSocketMessage(
                    type="error",
                    data={"message": "Invalid JSON format"}
                )
                await connection_manager.send_personal_message(error_message, websocket)
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected", machine_id=machine_id)
    except Exception as e:
        logger.error("WebSocket error", error=str(e), machine_id=machine_id)
    finally:
        connection_manager.disconnect(websocket)


async def websocket_dashboard_endpoint(
    websocket: WebSocket,
    connection_manager: ConnectionManager,
    redis_service: RedisService,
    token: Optional[str] = None
):
    """WebSocket endpoint for dashboard (all machines)"""
    try:
        # Basic authentication
        user_id = None
        if token:
            user_id = "dashboard_user"  # Placeholder
        
        # Connect to WebSocket
        await connection_manager.connect(
            websocket,
            user_id=user_id,
            metadata={"endpoint_type": "dashboard"}
        )
        
        logger.info("Dashboard WebSocket connection established", user_id=user_id)
        
        # Send initial dashboard data
        active_machines = await redis_service.get_active_machines()
        initial_data = {
            "active_machines": active_machines,
            "connection_stats": connection_manager.get_connection_stats()
        }
        
        initial_message = WebSocketMessage(
            type="dashboard_init",
            data=initial_data
        )
        await connection_manager.send_personal_message(initial_message, websocket)
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
                message_data = json.loads(data)
                
                await handle_dashboard_message(
                    message_data,
                    websocket,
                    connection_manager,
                    redis_service
                )
                
            except asyncio.TimeoutError:
                # Send heartbeat
                heartbeat = WebSocketMessage(
                    type="heartbeat",
                    data={"timestamp": "now"}
                )
                await connection_manager.send_personal_message(heartbeat, websocket)
                
            except json.JSONDecodeError:
                error_message = WebSocketMessage(
                    type="error",
                    data={"message": "Invalid JSON format"}
                )
                await connection_manager.send_personal_message(error_message, websocket)
                
    except WebSocketDisconnect:
        logger.info("Dashboard WebSocket disconnected")
    except Exception as e:
        logger.error("Dashboard WebSocket error", error=str(e))
    finally:
        connection_manager.disconnect(websocket)


async def handle_client_message(
    message_data: dict,
    websocket: WebSocket,
    machine_id: str,
    connection_manager: ConnectionManager,
    redis_service: RedisService
):
    """Handle incoming client messages"""
    message_type = message_data.get("type")
    
    if message_type == "subscribe":
        # Client wants to subscribe to specific sensor types
        sensor_types = message_data.get("sensor_types", [])
        response = WebSocketMessage(
            type="subscription_confirmed",
            data={"sensor_types": sensor_types, "machine_id": machine_id}
        )
        await connection_manager.send_personal_message(response, websocket)
        
    elif message_type == "get_latest":
        # Client requests latest readings
        sensor_type = message_data.get("sensor_type")
        if sensor_type:
            reading = await redis_service.get_latest_reading(machine_id, sensor_type)
            if reading:
                response = WebSocketMessage(
                    type="latest_reading",
                    data=reading.dict(),
                    machine_id=machine_id
                )
                await connection_manager.send_personal_message(response, websocket)
        
    elif message_type == "ping":
        # Respond to ping
        pong = WebSocketMessage(
            type="pong",
            data={"timestamp": message_data.get("timestamp")}
        )
        await connection_manager.send_personal_message(pong, websocket)
        
    else:
        # Unknown message type
        error = WebSocketMessage(
            type="error",
            data={"message": f"Unknown message type: {message_type}"}
        )
        await connection_manager.send_personal_message(error, websocket)


async def handle_dashboard_message(
    message_data: dict,
    websocket: WebSocket,
    connection_manager: ConnectionManager,
    redis_service: RedisService
):
    """Handle incoming dashboard messages"""
    message_type = message_data.get("type")
    
    if message_type == "get_metrics":
        # Dashboard requests metrics
        metrics = await redis_service.get_all_metrics()
        stats = connection_manager.get_connection_stats()
        
        response = WebSocketMessage(
            type="metrics_data",
            data={
                "metrics": metrics,
                "connection_stats": stats
            }
        )
        await connection_manager.send_personal_message(response, websocket)
        
    elif message_type == "get_machines":
        # Dashboard requests machine list
        machines = await redis_service.get_active_machines()
        response = WebSocketMessage(
            type="machines_list",
            data={"machines": machines}
        )
        await connection_manager.send_personal_message(response, websocket)
        
    elif message_type == "subscribe_machine":
        # Dashboard wants to subscribe to a specific machine
        machine_id = message_data.get("machine_id")
        if machine_id:
            response = WebSocketMessage(
                type="machine_subscription_confirmed",
                data={"machine_id": machine_id}
            )
            await connection_manager.send_personal_message(response, websocket)
        
    elif message_type == "ping":
        # Respond to ping
        pong = WebSocketMessage(
            type="pong",
            data={"timestamp": message_data.get("timestamp")}
        )
        await connection_manager.send_personal_message(pong, websocket)
        
    else:
        # Unknown message type
        error = WebSocketMessage(
            type="error",
            data={"message": f"Unknown message type: {message_type}"}
        )
        await connection_manager.send_personal_message(error, websocket)


# WebSocket route handlers (to be used in main app)
async def handle_machine_websocket(
    websocket: WebSocket,
    machine_id: str,
    connection_manager: ConnectionManager,
    redis_service: RedisService,
    token: Optional[str] = None
):
    """Handle machine-specific WebSocket connections"""
    await websocket_machine_endpoint(
        websocket,
        machine_id,
        connection_manager,
        redis_service,
        token
    )


async def handle_dashboard_websocket(
    websocket: WebSocket,
    connection_manager: ConnectionManager,
    redis_service: RedisService,
    token: Optional[str] = None
):
    """Handle dashboard WebSocket connections"""
    await websocket_dashboard_endpoint(
        websocket,
        connection_manager,
        redis_service,
        token
    )
