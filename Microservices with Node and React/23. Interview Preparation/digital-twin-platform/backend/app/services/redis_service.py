"""
Redis service for caching, session management, and pub/sub
"""
import json
import asyncio
from typing import Optional, Dict, Any, List, AsyncIterator
from datetime import datetime, timedelta

import aioredis
import structlog

from app.core.config import settings
from app.models.sensor import SensorReading, MachineStatus, WebSocketMessage

logger = structlog.get_logger(__name__)


class RedisService:
    """Redis service providing caching, pub/sub, and session management"""
    
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self.pubsub: Optional[aioredis.client.PubSub] = None
        
    async def connect(self):
        """Initialize Redis connection"""
        try:
            self.redis = aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=settings.redis_pool_size
            )
            # Test connection
            await self.redis.ping()
            logger.info("Connected to Redis", url=settings.redis_url)
            
        except Exception as e:
            logger.error("Failed to connect to Redis", error=str(e))
            raise
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
            logger.info("Disconnected from Redis")
    
    # Caching methods
    async def cache_sensor_reading(
        self, 
        machine_id: str, 
        reading: SensorReading, 
        ttl: int = 300
    ) -> None:
        """Cache the latest sensor reading for a machine"""
        key = f"sensor:latest:{machine_id}:{reading.sensor_type}"
        value = reading.json()
        
        await self.redis.setex(key, ttl, value)
        logger.debug("Cached sensor reading", machine_id=machine_id, sensor_type=reading.sensor_type)
    
    async def get_latest_reading(
        self, 
        machine_id: str, 
        sensor_type: str
    ) -> Optional[SensorReading]:
        """Get the latest cached reading for a machine/sensor"""
        key = f"sensor:latest:{machine_id}:{sensor_type}"
        
        try:
            value = await self.redis.get(key)
            if value:
                return SensorReading.parse_raw(value)
            return None
        except Exception as e:
            logger.error("Failed to get cached reading", error=str(e))
            return None
    
    async def cache_machine_status(
        self, 
        machine_status: MachineStatus, 
        ttl: int = 600
    ) -> None:
        """Cache machine status information"""
        key = f"machine:status:{machine_status.machine_id}"
        value = machine_status.json()
        
        await self.redis.setex(key, ttl, value)
        logger.debug("Cached machine status", machine_id=machine_status.machine_id)
    
    async def get_machine_status(self, machine_id: str) -> Optional[MachineStatus]:
        """Get cached machine status"""
        key = f"machine:status:{machine_id}"
        
        try:
            value = await self.redis.get(key)
            if value:
                return MachineStatus.parse_raw(value)
            return None
        except Exception as e:
            logger.error("Failed to get machine status", error=str(e))
            return None
    
    async def get_active_machines(self) -> List[str]:
        """Get list of currently active machines"""
        pattern = "machine:status:*"
        keys = await self.redis.keys(pattern)
        
        # Extract machine IDs from keys
        machine_ids = []
        for key in keys:
            machine_id = key.split(":")[-1]
            machine_ids.append(machine_id)
        
        return machine_ids
    
    # Pub/Sub methods
    async def publish_sensor_update(self, reading: SensorReading) -> None:
        """Publish sensor update to subscribers"""
        message = WebSocketMessage(
            type="sensor_update",
            data=reading.dict(),
            machine_id=reading.machine_id
        )
        
        # Publish to machine-specific channel
        machine_channel = f"sensor_updates:{reading.machine_id}"
        await self.redis.publish(machine_channel, message.json())
        
        # Publish to global channel
        await self.redis.publish("sensor_updates:all", message.json())
        
        logger.debug(
            "Published sensor update", 
            machine_id=reading.machine_id,
            sensor_type=reading.sensor_type
        )
    
    async def publish_machine_status(self, status: MachineStatus) -> None:
        """Publish machine status update"""
        message = WebSocketMessage(
            type="machine_status",
            data=status.dict(),
            machine_id=status.machine_id
        )
        
        await self.redis.publish("machine_status:all", message.json())
        logger.debug("Published machine status", machine_id=status.machine_id)
    
    async def subscribe_to_updates(self, channels: List[str]) -> aioredis.client.PubSub:
        """Subscribe to update channels"""
        self.pubsub = self.redis.pubsub()
        await self.pubsub.subscribe(*channels)
        
        logger.info("Subscribed to channels", channels=channels)
        return self.pubsub
    
    async def get_messages(self) -> AsyncIterator[Dict[str, Any]]:
        """Get messages from subscribed channels"""
        if not self.pubsub:
            return
        
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    yield {
                        "channel": message["channel"],
                        "data": data
                    }
                except json.JSONDecodeError as e:
                    logger.error("Failed to decode message", error=str(e))
    
    # Session management
    async def create_session(
        self, 
        session_id: str, 
        user_data: Dict[str, Any],
        ttl: int = 3600
    ) -> None:
        """Create user session"""
        key = f"session:{session_id}"
        value = json.dumps(user_data)
        
        await self.redis.setex(key, ttl, value)
        logger.debug("Created session", session_id=session_id)
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        key = f"session:{session_id}"
        
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error("Failed to get session", error=str(e))
            return None
    
    async def delete_session(self, session_id: str) -> None:
        """Delete session"""
        key = f"session:{session_id}"
        await self.redis.delete(key)
        logger.debug("Deleted session", session_id=session_id)
    
    # Rate limiting
    async def check_rate_limit(
        self, 
        identifier: str, 
        limit: int, 
        window: int = 60
    ) -> tuple[bool, int]:
        """Check if rate limit is exceeded"""
        key = f"rate_limit:{identifier}"
        
        # Use sliding window rate limiting
        now = datetime.utcnow().timestamp()
        cutoff = now - window
        
        # Remove old entries
        await self.redis.zremrangebyscore(key, "-inf", cutoff)
        
        # Count current requests
        current_count = await self.redis.zcard(key)
        
        if current_count >= limit:
            return False, limit - current_count
        
        # Add current request
        await self.redis.zadd(key, {str(now): now})
        await self.redis.expire(key, window)
        
        return True, limit - current_count - 1
    
    # Metrics and monitoring
    async def increment_metric(self, metric_name: str, value: int = 1) -> None:
        """Increment a metric counter"""
        key = f"metrics:{metric_name}"
        await self.redis.incrby(key, value)
        await self.redis.expire(key, 3600)  # Expire after 1 hour
    
    async def get_metric(self, metric_name: str) -> int:
        """Get metric value"""
        key = f"metrics:{metric_name}"
        value = await self.redis.get(key)
        return int(value) if value else 0
    
    async def get_all_metrics(self) -> Dict[str, int]:
        """Get all metrics"""
        pattern = "metrics:*"
        keys = await self.redis.keys(pattern)
        
        metrics = {}
        for key in keys:
            metric_name = key.split(":", 1)[1]
            value = await self.redis.get(key)
            metrics[metric_name] = int(value) if value else 0
        
        return metrics
    
    # Health check
    async def health_check(self) -> Dict[str, Any]:
        """Perform Redis health check"""
        try:
            start_time = datetime.utcnow()
            await self.redis.ping()
            response_time = (datetime.utcnow() - start_time).total_seconds()
            
            info = await self.redis.info()
            
            return {
                "status": "healthy",
                "response_time_ms": round(response_time * 1000, 2),
                "connected_clients": info.get("connected_clients", 0),
                "used_memory_human": info.get("used_memory_human", "unknown"),
                "uptime_in_seconds": info.get("uptime_in_seconds", 0)
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Global Redis service instance
redis_service = RedisService()


# Dependency for FastAPI
async def get_redis_service() -> RedisService:
    """FastAPI dependency to get Redis service"""
    return redis_service
