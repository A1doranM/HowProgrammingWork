"""
Health check module for Event Store Service
"""
import asyncio
import asyncpg
from aiokafka import AIOKafkaConsumer
from src.shared.config import get_event_store_settings


async def check_health():
    """
    Comprehensive health check for Event Store Service
    Checks database connectivity, Kafka connectivity, and service state
    """
    settings = get_event_store_settings()
    health_status = {"status": "healthy", "checks": {}}
    
    try:
        # Check database connectivity
        try:
            conn = await asyncpg.connect(settings.database_url)
            await conn.fetchval("SELECT 1")
            await conn.close()
            health_status["checks"]["database"] = "healthy"
        except Exception as e:
            health_status["checks"]["database"] = f"unhealthy: {str(e)}"
            health_status["status"] = "unhealthy"
        
        # Check Kafka connectivity
        try:
            consumer = AIOKafkaConsumer(
                bootstrap_servers=settings.kafka_bootstrap_servers,
                group_id=f"{settings.kafka_group_id}-health-check",
                enable_auto_commit=False
            )
            await consumer.start()
            # Try to get metadata to verify connectivity
            await consumer.client.check_version()
            await consumer.stop()
            health_status["checks"]["kafka"] = "healthy"
        except Exception as e:
            health_status["checks"]["kafka"] = f"unhealthy: {str(e)}"
            health_status["status"] = "unhealthy"
        
        # Check event store tables exist
        try:
            conn = await asyncpg.connect(settings.database_url)
            event_count = await conn.fetchval("SELECT COUNT(*) FROM events.event_store LIMIT 1")
            snapshot_count = await conn.fetchval("SELECT COUNT(*) FROM events.aggregate_snapshots LIMIT 1")
            await conn.close()
            health_status["checks"]["event_store_tables"] = "healthy"
            health_status["checks"]["event_count"] = event_count
            health_status["checks"]["snapshot_count"] = snapshot_count
        except Exception as e:
            health_status["checks"]["event_store_tables"] = f"unhealthy: {str(e)}"
            health_status["status"] = "unhealthy"
        
        # Overall status
        if health_status["status"] == "healthy":
            print("Health check: HEALTHY")
            return True
        else:
            print(f"Health check: UNHEALTHY - {health_status}")
            return False
            
    except Exception as e:
        print(f"Health check failed: {str(e)}")
        return False


if __name__ == "__main__":
    result = asyncio.run(check_health())
    exit(0 if result else 1)
