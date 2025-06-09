"""
WebSocket connection manager for real-time communication
"""
import asyncio
from typing import Dict, Set, Optional
from datetime import datetime

from fastapi import WebSocket
import structlog

from app.models.sensor import WebSocketMessage, SensorReading
from app.services.redis_service import RedisService

logger = structlog.get_logger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and real-time message broadcasting"""
    
    def __init__(self, redis_service: RedisService):
        # Active connections by machine_id
        self.machine_connections: Dict[str, Set[WebSocket]] = {}
        # All active connections
        self.active_connections: Set[WebSocket] = set()
        # User-specific connections (for authentication)
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        # Connection metadata
        self.connection_metadata: Dict[WebSocket, Dict] = {}
        
        self.redis_service = redis_service
        self._redis_subscriber_task: Optional[asyncio.Task] = None
        
    async def start(self):
        """Start the connection manager and Redis subscriber"""
        # Start Redis subscriber for multi-instance coordination
        self._redis_subscriber_task = asyncio.create_task(self._redis_subscriber())
        logger.info("Connection manager started")
        
    async def stop(self):
        """Stop the connection manager"""
        if self._redis_subscriber_task:
            self._redis_subscriber_task.cancel()
            try:
                await self._redis_subscriber_task
            except asyncio.CancelledError:
                pass
        
        # Close all connections
        for websocket in list(self.active_connections):
            try:
                await websocket.close()
            except:
                pass
        
        logger.info("Connection manager stopped")
    
    async def connect(
        self, 
        websocket: WebSocket, 
        machine_id: Optional[str] = None,
        user_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        
        # Add to active connections
        self.active_connections.add(websocket)
        
        # Store connection metadata
        self.connection_metadata[websocket] = {
            "machine_id": machine_id,
            "user_id": user_id,
            "connected_at": datetime.utcnow(),
            "metadata": metadata or {}
        }
        
        # Add to machine-specific connections
        if machine_id:
            if machine_id not in self.machine_connections:
                self.machine_connections[machine_id] = set()
            self.machine_connections[machine_id].add(websocket)
        
        # Add to user-specific connections
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)
        
        # Update metrics
        await self.redis_service.increment_metric("websocket_connections_total")
        await self._update_active_connections_metric()
        
        logger.info(
            "WebSocket connected",
            machine_id=machine_id,
            user_id=user_id,
            total_connections=len(self.active_connections)
        )
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket not in self.active_connections:
            return
        
        metadata = self.connection_metadata.get(websocket, {})
        machine_id = metadata.get("machine_id")
        user_id = metadata.get("user_id")
        
        # Remove from active connections
        self.active_connections.discard(websocket)
        
        # Remove from machine connections
        if machine_id and machine_id in self.machine_connections:
            self.machine_connections[machine_id].discard(websocket)
            if not self.machine_connections[machine_id]:
                del self.machine_connections[machine_id]
        
        # Remove from user connections
        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        # Remove metadata
        self.connection_metadata.pop(websocket, None)
        
        logger.info(
            "WebSocket disconnected",
            machine_id=machine_id,
            user_id=user_id,
            total_connections=len(self.active_connections)
        )
    
    async def send_personal_message(self, message: WebSocketMessage, websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(message.json())
        except Exception as e:
            logger.error("Failed to send personal message", error=str(e))
            self.disconnect(websocket)
    
    async def broadcast_to_machine(self, machine_id: str, message: WebSocketMessage):
        """Broadcast message to all connections for a specific machine"""
        if machine_id not in self.machine_connections:
            return
        
        disconnected = []
        connections = list(self.machine_connections[machine_id])
        
        for websocket in connections:
            try:
                await websocket.send_text(message.json())
            except Exception as e:
                logger.error("Failed to send to machine connection", error=str(e))
                disconnected.append(websocket)
        
        # Clean up disconnected connections
        for websocket in disconnected:
            self.disconnect(websocket)
        
        logger.debug(
            "Broadcasted to machine",
            machine_id=machine_id,
            connections=len(connections),
            disconnected=len(disconnected)
        )
    
    async def broadcast_to_user(self, user_id: str, message: WebSocketMessage):
        """Broadcast message to all connections for a specific user"""
        if user_id not in self.user_connections:
            return
        
        disconnected = []
        connections = list(self.user_connections[user_id])
        
        for websocket in connections:
            try:
                await websocket.send_text(message.json())
            except Exception as e:
                logger.error("Failed to send to user connection", error=str(e))
                disconnected.append(websocket)
        
        # Clean up disconnected connections
        for websocket in disconnected:
            self.disconnect(websocket)
        
        logger.debug(
            "Broadcasted to user",
            user_id=user_id,
            connections=len(connections),
            disconnected=len(disconnected)
        )
    
    async def broadcast_to_all(self, message: WebSocketMessage):
        """Broadcast message to all active connections"""
        disconnected = []
        connections = list(self.active_connections)
        
        for websocket in connections:
            try:
                await websocket.send_text(message.json())
            except Exception as e:
                logger.error("Failed to send broadcast message", error=str(e))
                disconnected.append(websocket)
        
        # Clean up disconnected connections
        for websocket in disconnected:
            self.disconnect(websocket)
        
        logger.debug(
            "Broadcasted to all",
            connections=len(connections),
            disconnected=len(disconnected)
        )
    
    async def handle_sensor_update(self, reading: SensorReading):
        """Handle incoming sensor reading and broadcast to relevant connections"""
        message = WebSocketMessage(
            type="sensor_update",
            data=reading.dict(),
            machine_id=reading.machine_id
        )
        
        # Broadcast to machine-specific connections
        await self.broadcast_to_machine(reading.machine_id, message)
        
        # Also publish to Redis for other instances
        await self.redis_service.publish_sensor_update(reading)
        
        # Update metrics
        await self.redis_service.increment_metric("sensor_updates_broadcast")
    
    async def handle_machine_status_update(self, machine_id: str, status_data: Dict):
        """Handle machine status update"""
        message = WebSocketMessage(
            type="machine_status",
            data=status_data,
            machine_id=machine_id
        )
        
        # Broadcast to machine-specific connections
        await self.broadcast_to_machine(machine_id, message)
        
        # Broadcast to all connections (for dashboard overview)
        await self.broadcast_to_all(message)
    
    async def send_heartbeat(self):
        """Send heartbeat to all connections to check connectivity"""
        heartbeat_message = WebSocketMessage(
            type="heartbeat",
            data={"timestamp": datetime.utcnow().isoformat()}
        )
        
        await self.broadcast_to_all(heartbeat_message)
        logger.debug("Sent heartbeat to all connections")
    
    async def _redis_subscriber(self):
        """Background task to handle Redis pub/sub messages"""
        try:
            channels = ["sensor_updates:all", "machine_status:all", "websocket_broadcasts"]
            pubsub = await self.redis_service.subscribe_to_updates(channels)
            
            async for redis_message in self.redis_service.get_messages():
                channel = redis_message["channel"]
                data = redis_message["data"]
                
                if channel == "sensor_updates:all":
                    # Handle sensor update from Redis
                    message = WebSocketMessage(**data)
                    if message.machine_id:
                        await self.broadcast_to_machine(message.machine_id, message)
                
                elif channel == "machine_status:all":
                    # Handle machine status update from Redis
                    message = WebSocketMessage(**data)
                    await self.broadcast_to_all(message)
                
                elif channel == "websocket_broadcasts":
                    # Handle general WebSocket broadcasts
                    message = WebSocketMessage(**data)
                    if message.machine_id:
                        await self.broadcast_to_machine(message.machine_id, message)
                    else:
                        await self.broadcast_to_all(message)
                        
        except Exception as e:
            logger.error("Redis subscriber error", error=str(e))
            # Restart subscriber after delay
            await asyncio.sleep(5)
            self._redis_subscriber_task = asyncio.create_task(self._redis_subscriber())
    
    async def _update_active_connections_metric(self):
        """Update active connections metric in Redis"""
        await self.redis_service.increment_metric(
            "websocket_connections_active", 
            len(self.active_connections)
        )
    
    def get_connection_stats(self) -> Dict:
        """Get connection statistics"""
        return {
            "total_connections": len(self.active_connections),
            "machine_connections": {
                machine_id: len(connections) 
                for machine_id, connections in self.machine_connections.items()
            },
            "user_connections": {
                user_id: len(connections)
                for user_id, connections in self.user_connections.items()
            },
            "connection_details": [
                {
                    "machine_id": metadata.get("machine_id"),
                    "user_id": metadata.get("user_id"),
                    "connected_at": metadata.get("connected_at").isoformat() if metadata.get("connected_at") else None,
                    "metadata": metadata.get("metadata", {})
                }
                for metadata in self.connection_metadata.values()
            ]
        }


# Background task for periodic heartbeat
async def heartbeat_task(manager: ConnectionManager):
    """Periodic heartbeat task"""
    while True:
        try:
            await asyncio.sleep(30)  # Send heartbeat every 30 seconds
            await manager.send_heartbeat()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error("Heartbeat task error", error=str(e))
            await asyncio.sleep(5)
