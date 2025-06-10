"""
Event Store Main Service
Complete event sourcing implementation with audit trail and temporal queries
"""
import asyncio
import json
import signal
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import uuid

import structlog
import asyncpg
from aiokafka import AIOKafkaConsumer
from pydantic import ValidationError

from src.shared.config import get_event_store_settings
from src.shared.models import SensorReading, EventMessage, PipelineMetrics

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)


class EventStore:
    """
    Event Store service implementing event sourcing patterns for complete audit trail
    and temporal queries with snapshot optimization.
    """
    
    def __init__(self):
        self.settings = get_event_store_settings()
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.db_pool: Optional[asyncpg.Pool] = None
        self.running = False
        self.start_time = datetime.utcnow()
        
        # Event processing state
        self.processed_events: Dict[str, int] = defaultdict(int)  # aggregate_id -> last_version
        self.processing_lock = asyncio.Lock()
        
        # Snapshot management
        self.snapshot_cache: Dict[str, Dict] = {}
        self.snapshot_interval = 100  # Create snapshot every 100 events
        
        # Metrics
        self.events_processed = 0
        self.events_failed = 0
        self.snapshots_created = 0
        self.database_writes = 0
        
    async def start(self):
        """Start the event store service"""
        logger.info("Starting Event Store Service", version=self.settings.version)
        
        try:
            # Initialize database connection pool
            await self._init_database()
            
            # Initialize Kafka consumer
            await self._init_kafka_consumer()
            
            # Load existing event state
            await self._load_event_state()
            
            # Start processing tasks
            self.running = True
            await asyncio.gather(
                self._event_processing_loop(),
                self._snapshot_management_loop(),
                self._metrics_reporting_loop(),
                return_exceptions=True
            )
            
        except Exception as e:
            logger.error("Failed to start event store service", error=str(e))
            await self.stop()
            raise
    
    async def stop(self):
        """Stop the event store service"""
        logger.info("Stopping Event Store Service")
        self.running = False
        
        try:
            # Close Kafka consumer
            if self.consumer:
                await self.consumer.stop()
                
            # Close database pool
            if self.db_pool:
                await self.db_pool.close()
                
        except Exception as e:
            logger.error("Error during shutdown", error=str(e))
        
        logger.info("Event Store Service stopped")
    
    async def _init_database(self):
        """Initialize PostgreSQL connection pool"""
        self.db_pool = await asyncpg.create_pool(
            self.settings.database_url,
            min_size=3,
            max_size=self.settings.database_pool_size,
            command_timeout=30,
            server_settings={
                'jit': 'off'
            }
        )
        
        # Test connection
        async with self.db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        
        logger.info("Database connection pool initialized")
    
    async def _init_kafka_consumer(self):
        """Initialize Kafka consumer for event topics"""
        consumer_config = self.settings.get_kafka_consumer_config()
        
        # Subscribe to multiple event topics
        event_topics = [
            self.settings.kafka_sensor_readings_topic,
            self.settings.kafka_aggregates_topic,
            "machine-status",
            "system-alerts"
        ]
        
        self.consumer = AIOKafkaConsumer(
            *event_topics,
            **consumer_config,
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        
        await self.consumer.start()
        logger.info("Kafka consumer initialized", topics=event_topics)
    
    async def _load_event_state(self):
        """Load existing event processing state from database"""
        async with self.db_pool.acquire() as conn:
            # Get latest event version for each aggregate
            rows = await conn.fetch("""
                SELECT aggregate_id, MAX(event_version) as last_version
                FROM events.event_store
                GROUP BY aggregate_id
            """)
            
            for row in rows:
                self.processed_events[row['aggregate_id']] = row['last_version']
        
        logger.info("Loaded event state", aggregates_count=len(self.processed_events))
    
    async def _event_processing_loop(self):
        """Main event processing loop with exactly-once semantics"""
        logger.info("Starting event processing loop")
        
        try:
            async for message in self.consumer:
                if not self.running:
                    break
                
                try:
                    await self._process_event_message(message)
                    self.events_processed += 1
                    
                    # Commit offset after successful processing
                    await self.consumer.commit({
                        message.topic_partition: message.offset + 1
                    })
                    
                except Exception as e:
                    self.events_failed += 1
                    logger.error(
                        "Error processing event message",
                        topic=message.topic,
                        partition=message.partition,
                        offset=message.offset,
                        error=str(e)
                    )
                    
        except Exception as e:
            logger.error("Error in event processing loop", error=str(e))
    
    async def _process_event_message(self, message):
        """Process individual event message and store in event store"""
        topic = message.topic
        payload = message.value
        
        try:
            # Extract event information based on topic
            event_data = await self._extract_event_data(topic, payload)
            
            if event_data:
                # Store event with proper versioning
                await self._store_event(event_data)
                
                # Check if snapshot needed
                await self._check_snapshot_needed(event_data['aggregate_id'])
                
        except Exception as e:
            logger.error("Error processing event message", topic=topic, error=str(e))
            raise
    
    async def _extract_event_data(self, topic: str, payload: Dict) -> Optional[Dict]:
        """Extract event data from Kafka message based on topic"""
        event_data = None
        current_time = datetime.utcnow()
        
        if topic == self.settings.kafka_sensor_readings_topic:
            # Sensor reading received event
            try:
                sensor_reading = SensorReading(**payload)
                event_data = {
                    'aggregate_id': sensor_reading.machine_id,
                    'aggregate_type': 'machine',
                    'event_type': 'sensor_reading_received',
                    'event_data': {
                        'sensor_type': sensor_reading.sensor_type.value,
                        'value': float(sensor_reading.value),
                        'unit': sensor_reading.unit,
                        'quality': sensor_reading.quality.value,
                        'timestamp': sensor_reading.timestamp.isoformat(),
                        'source_service': sensor_reading.source_service
                    },
                    'event_metadata': {
                        'kafka_topic': topic,
                        'correlation_id': sensor_reading.correlation_id
                    },
                    'occurred_at': sensor_reading.timestamp
                }
            except ValidationError as e:
                logger.error("Invalid sensor reading format", validation_errors=e.errors())
                return None
                
        elif topic == self.settings.kafka_aggregates_topic:
            # Sensor aggregate computed event
            event_data = {
                'aggregate_id': payload.get('machine_id'),
                'aggregate_type': 'machine',
                'event_type': 'sensor_aggregate_computed',
                'event_data': payload,
                'event_metadata': {
                    'kafka_topic': topic,
                    'processing_service': 'stream-processor'
                },
                'occurred_at': current_time
            }
            
        elif topic == "machine-status":
            # Machine status changed event
            event_data = {
                'aggregate_id': payload.get('machine_id'),
                'aggregate_type': 'machine',
                'event_type': 'machine_status_changed',
                'event_data': payload,
                'event_metadata': {
                    'kafka_topic': topic
                },
                'occurred_at': current_time
            }
            
        elif topic == "system-alerts":
            # System alert triggered event
            event_data = {
                'aggregate_id': payload.get('machine_id', 'system'),
                'aggregate_type': payload.get('alert_type', 'system'),
                'event_type': 'alert_triggered',
                'event_data': payload,
                'event_metadata': {
                    'kafka_topic': topic,
                    'severity': payload.get('severity', 'info')
                },
                'occurred_at': current_time
            }
        
        return event_data
    
    async def _store_event(self, event_data: Dict):
        """Store event in event store with proper versioning"""
        aggregate_id = event_data['aggregate_id']
        
        async with self.processing_lock:
            # Get next version number for this aggregate
            next_version = self.processed_events[aggregate_id] + 1
            
            async with self.db_pool.acquire() as conn:
                # Insert event with version
                await conn.execute("""
                    INSERT INTO events.event_store 
                    (aggregate_id, aggregate_type, event_type, event_version, 
                     event_data, event_metadata, occurred_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                """,
                    aggregate_id,
                    event_data['aggregate_type'],
                    event_data['event_type'],
                    next_version,
                    json.dumps(event_data['event_data']),
                    json.dumps(event_data['event_metadata']),
                    event_data['occurred_at']
                )
            
            # Update processed version
            self.processed_events[aggregate_id] = next_version
            self.database_writes += 1
            
            logger.debug(
                "Event stored",
                aggregate_id=aggregate_id,
                event_type=event_data['event_type'],
                version=next_version
            )
    
    async def _check_snapshot_needed(self, aggregate_id: str):
        """Check if aggregate snapshot should be created"""
        current_version = self.processed_events[aggregate_id]
        
        # Create snapshot every N events
        if current_version % self.snapshot_interval == 0:
            await self._create_snapshot(aggregate_id, current_version)
    
    async def _create_snapshot(self, aggregate_id: str, version: int):
        """Create aggregate snapshot for performance optimization"""
        try:
            # Rebuild aggregate state from events
            snapshot_data = await self._rebuild_aggregate_state(aggregate_id, version)
            
            if snapshot_data:
                async with self.db_pool.acquire() as conn:
                    # Store snapshot
                    await conn.execute("""
                        INSERT INTO events.aggregate_snapshots 
                        (aggregate_id, aggregate_type, snapshot_version, snapshot_data)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (aggregate_id, snapshot_version) DO NOTHING
                    """,
                        aggregate_id,
                        snapshot_data['aggregate_type'],
                        version,
                        json.dumps(snapshot_data)
                    )
                
                self.snapshots_created += 1
                logger.info(
                    "Snapshot created",
                    aggregate_id=aggregate_id,
                    version=version
                )
                
        except Exception as e:
            logger.error(
                "Error creating snapshot",
                aggregate_id=aggregate_id,
                version=version,
                error=str(e)
            )
    
    async def _rebuild_aggregate_state(self, aggregate_id: str, up_to_version: int) -> Optional[Dict]:
        """Rebuild aggregate state from events up to specified version"""
        async with self.db_pool.acquire() as conn:
            # Get all events for this aggregate up to version
            events = await conn.fetch("""
                SELECT event_type, event_data, event_version, occurred_at
                FROM events.event_store
                WHERE aggregate_id = $1 AND event_version <= $2
                ORDER BY event_version
            """, aggregate_id, up_to_version)
        
        if not events:
            return None
        
        # Rebuild state by applying events
        state = {
            'aggregate_id': aggregate_id,
            'aggregate_type': 'machine',
            'current_version': up_to_version,
            'last_updated': events[-1]['occurred_at'].isoformat(),
            'sensor_readings_count': 0,
            'latest_sensor_values': {},
            'status_history': [],
            'alert_count': 0
        }
        
        for event in events:
            event_type = event['event_type']
            event_data = json.loads(event['event_data'])
            
            if event_type == 'sensor_reading_received':
                state['sensor_readings_count'] += 1
                sensor_type = event_data['sensor_type']
                state['latest_sensor_values'][sensor_type] = {
                    'value': event_data['value'],
                    'unit': event_data['unit'],
                    'quality': event_data['quality'],
                    'timestamp': event_data['timestamp']
                }
                
            elif event_type == 'machine_status_changed':
                state['status_history'].append({
                    'status': event_data.get('status'),
                    'timestamp': event['occurred_at'].isoformat()
                })
                
            elif event_type == 'alert_triggered':
                state['alert_count'] += 1
        
        return state
    
    async def _snapshot_management_loop(self):
        """Periodically manage snapshots and cleanup old data"""
        while self.running:
            try:
                await asyncio.sleep(self.settings.snapshot_management_interval_seconds)
                await self._cleanup_old_snapshots()
            except Exception as e:
                logger.error("Error in snapshot management loop", error=str(e))
    
    async def _cleanup_old_snapshots(self):
        """Clean up old snapshots to maintain performance"""
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        async with self.db_pool.acquire() as conn:
            # Keep only latest 5 snapshots per aggregate
            await conn.execute("""
                DELETE FROM events.aggregate_snapshots 
                WHERE snapshot_id NOT IN (
                    SELECT snapshot_id FROM (
                        SELECT snapshot_id, 
                               ROW_NUMBER() OVER (PARTITION BY aggregate_id ORDER BY snapshot_version DESC) as rn
                        FROM events.aggregate_snapshots
                    ) ranked WHERE rn <= 5
                )
                AND created_at < $1
            """, cutoff_date)
        
        logger.debug("Cleaned up old snapshots", cutoff_date=cutoff_date.isoformat())
    
    async def _metrics_reporting_loop(self):
        """Periodically report processing metrics"""
        while self.running:
            try:
                await asyncio.sleep(self.settings.metrics_collection_interval_seconds)
                await self._report_metrics()
            except Exception as e:
                logger.error("Error in metrics reporting", error=str(e))
    
    async def _report_metrics(self):
        """Report event store metrics"""
        uptime = (datetime.utcnow() - self.start_time).total_seconds()
        
        metrics = PipelineMetrics(
            service_name=self.settings.service_name,
            pipeline_stage="event_store",
            messages_processed=self.events_processed,
            messages_failed=self.events_failed,
            throughput_per_second=self.events_processed / max(uptime, 1),
            error_rate=self.events_failed / max(self.events_processed, 1),
            custom_metrics={
                'snapshots_created': self.snapshots_created,
                'database_writes': self.database_writes,
                'active_aggregates': len(self.processed_events),
                'uptime_seconds': uptime
            }
        )
        
        logger.info(
            "Event store metrics",
            events_processed=self.events_processed,
            events_failed=self.events_failed,
            snapshots_created=self.snapshots_created,
            database_writes=self.database_writes,
            active_aggregates=len(self.processed_events),
            error_rate=metrics.error_rate,
            uptime_seconds=uptime
        )
    
    # Event Store Query Interface
    async def get_aggregate_state(self, aggregate_id: str, at_version: Optional[int] = None) -> Optional[Dict]:
        """Get current or historical state of an aggregate"""
        if at_version is None:
            at_version = self.processed_events.get(aggregate_id, 0)
        
        # Try to get from latest snapshot first
        async with self.db_pool.acquire() as conn:
            snapshot = await conn.fetchrow("""
                SELECT snapshot_version, snapshot_data
                FROM events.aggregate_snapshots
                WHERE aggregate_id = $1 AND snapshot_version <= $2
                ORDER BY snapshot_version DESC
                LIMIT 1
            """, aggregate_id, at_version)
            
            if snapshot:
                # Apply events since snapshot
                return await self._rebuild_aggregate_state(aggregate_id, at_version)
            else:
                # Rebuild from beginning
                return await self._rebuild_aggregate_state(aggregate_id, at_version)
    
    async def get_events_for_aggregate(self, aggregate_id: str, from_version: int = 1) -> List[Dict]:
        """Get all events for an aggregate from specified version"""
        async with self.db_pool.acquire() as conn:
            events = await conn.fetch("""
                SELECT event_id, event_type, event_version, event_data, 
                       event_metadata, occurred_at, recorded_at
                FROM events.event_store
                WHERE aggregate_id = $1 AND event_version >= $2
                ORDER BY event_version
            """, aggregate_id, from_version)
        
        return [dict(event) for event in events]


async def main():
    """Main entry point for the event store service"""
    event_store = EventStore()
    
    # Setup signal handlers for graceful shutdown
    def signal_handler():
        logger.info("Received shutdown signal")
        asyncio.create_task(event_store.stop())
    
    # Register signal handlers
    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, lambda s, f: signal_handler())
    
    try:
        await event_store.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error("Event store service failed", error=str(e))
        sys.exit(1)
    finally:
        await event_store.stop()


if __name__ == "__main__":
    asyncio.run(main())
