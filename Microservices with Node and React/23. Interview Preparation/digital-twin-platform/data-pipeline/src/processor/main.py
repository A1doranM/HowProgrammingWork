"""
Stream Processor Main Service
Real-time data processing with windowing, aggregation, and exactly-once semantics
"""
import asyncio
import json
import signal
import sys
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
import statistics

import structlog
import asyncpg
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from pydantic import ValidationError
import numpy as np

from src.shared.config import get_stream_processor_settings
from src.shared.models import SensorReading, SensorAggregate, EventMessage, PipelineMetrics

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


class StreamProcessor:
    """Real-time stream processor with windowing and aggregation"""
    
    def __init__(self):
        self.settings = get_stream_processor_settings()
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.producer: Optional[AIOKafkaProducer] = None
        self.db_pool: Optional[asyncpg.Pool] = None
        self.running = False
        self.start_time = datetime.utcnow()
        
        # Windowing state
        self.windows: Dict[str, Dict] = defaultdict(dict)  # machine_id -> sensor_type -> window_data
        self.window_lock = asyncio.Lock()
        
        # Exactly-once processing state
        self.processed_offsets: Set[str] = set()
        self.processing_lock = asyncio.Lock()
        
        # Metrics
        self.messages_processed = 0
        self.messages_failed = 0
        self.aggregates_created = 0
        self.database_writes = 0
        
    async def start(self):
        """Start the stream processor service"""
        logger.info("Starting Stream Processor", version=self.settings.version)
        
        try:
            # Initialize database connection pool
            await self._init_database()
            
            # Initialize Kafka consumer and producer
            await self._init_kafka()
            
            # Start processing tasks
            self.running = True
            await asyncio.gather(
                self._message_processing_loop(),
                self._window_processing_loop(),
                self._metrics_reporting_loop(),
                self._checkpoint_loop(),
                return_exceptions=True
            )
            
        except Exception as e:
            logger.error("Failed to start stream processor", error=str(e))
            await self.stop()
            raise
    
    async def stop(self):
        """Stop the stream processor service"""
        logger.info("Stopping Stream Processor")
        self.running = False
        
        try:
            # Process remaining windows
            await self._process_all_windows()
            
            # Close Kafka connections
            if self.consumer:
                await self.consumer.stop()
            if self.producer:
                await self.producer.stop()
                
            # Close database pool
            if self.db_pool:
                await self.db_pool.close()
                
        except Exception as e:
            logger.error("Error during shutdown", error=str(e))
        
        logger.info("Stream Processor stopped")
    
    async def _init_database(self):
        """Initialize PostgreSQL connection pool"""
        self.db_pool = await asyncpg.create_pool(
            self.settings.database_url,
            min_size=5,
            max_size=self.settings.database_pool_size,
            command_timeout=30,
            server_settings={
                'jit': 'off'  # Disable JIT for better predictability
            }
        )
        
        # Test connection
        async with self.db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        
        logger.info("Database connection pool initialized")
    
    async def _init_kafka(self):
        """Initialize Kafka consumer and producer"""
        # Consumer configuration
        consumer_config = self.settings.get_kafka_consumer_config()
        self.consumer = AIOKafkaConsumer(
            self.settings.kafka_sensor_readings_topic,
            **consumer_config,
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        
        # Producer configuration for publishing aggregates
        producer_config = self.settings.get_kafka_producer_config()
        self.producer = AIOKafkaProducer(
            **producer_config,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None
        )
        
        await self.consumer.start()
        await self.producer.start()
        
        logger.info("Kafka consumer and producer initialized")
    
    async def _message_processing_loop(self):
        """Main message processing loop with exactly-once semantics"""
        logger.info("Starting message processing loop")
        
        try:
            async for message in self.consumer:
                if not self.running:
                    break
                
                try:
                    # Create unique message identifier for exactly-once processing
                    message_id = f"{message.topic}:{message.partition}:{message.offset}"
                    
                    async with self.processing_lock:
                        if message_id in self.processed_offsets:
                            logger.debug("Message already processed, skipping", message_id=message_id)
                            continue
                        
                        # Process the message
                        success = await self._process_message(message)
                        
                        if success:
                            self.processed_offsets.add(message_id)
                            self.messages_processed += 1
                            
                            # Commit offset manually for exactly-once processing
                            await self.consumer.commit({
                                message.topic_partition: message.offset + 1
                            })
                        else:
                            self.messages_failed += 1
                            
                except Exception as e:
                    self.messages_failed += 1
                    logger.error(
                        "Error processing message",
                        topic=message.topic,
                        partition=message.partition,
                        offset=message.offset,
                        error=str(e)
                    )
                    
        except Exception as e:
            logger.error("Error in message processing loop", error=str(e))
    
    async def _process_message(self, message) -> bool:
        """Process individual sensor reading message"""
        try:
            # Parse sensor reading
            sensor_reading = SensorReading(**message.value)
            
            # Add to windowing state
            await self._add_to_window(sensor_reading)
            
            # Store raw reading in database
            await self._store_sensor_reading(sensor_reading)
            
            logger.debug(
                "Processed sensor reading",
                machine_id=sensor_reading.machine_id,
                sensor_type=sensor_reading.sensor_type,
                value=sensor_reading.value
            )
            
            return True
            
        except ValidationError as e:
            logger.error("Invalid sensor reading format", validation_errors=e.errors())
            return False
        except Exception as e:
            logger.error("Error processing sensor reading", error=str(e))
            return False
    
    async def _add_to_window(self, reading: SensorReading):
        """Add sensor reading to appropriate time window"""
        window_key = f"{reading.machine_id}:{reading.sensor_type}"
        
        async with self.window_lock:
            if window_key not in self.windows:
                self.windows[window_key] = {
                    'readings': deque(),
                    'machine_id': reading.machine_id,
                    'sensor_type': reading.sensor_type,
                    'window_start': None,
                    'window_end': None
                }
            
            window = self.windows[window_key]
            reading_time = reading.timestamp
            
            # Initialize window if empty
            if not window['readings']:
                window['window_start'] = reading_time
                window['window_end'] = reading_time + timedelta(seconds=self.settings.aggregation_window_seconds)
            
            # Check if reading fits in current window
            if reading_time <= window['window_end']:
                window['readings'].append(reading)
            else:
                # Process current window and create new one
                if window['readings']:
                    await self._process_window(window_key, window)
                
                # Start new window
                window['readings'].clear()
                window['readings'].append(reading)
                window['window_start'] = reading_time
                window['window_end'] = reading_time + timedelta(seconds=self.settings.aggregation_window_seconds)
    
    async def _window_processing_loop(self):
        """Periodically process time windows"""
        while self.running:
            try:
                await asyncio.sleep(self.settings.aggregation_window_seconds / 2)
                await self._process_expired_windows()
            except Exception as e:
                logger.error("Error in window processing loop", error=str(e))
    
    async def _process_expired_windows(self):
        """Process windows that have expired"""
        current_time = datetime.utcnow()
        expired_windows = []
        
        async with self.window_lock:
            for window_key, window in self.windows.items():
                if (window['window_end'] and 
                    current_time > window['window_end'] + timedelta(seconds=self.settings.max_aggregation_delay_seconds)):
                    expired_windows.append((window_key, window.copy()))
        
        # Process expired windows
        for window_key, window in expired_windows:
            if window['readings']:
                await self._process_window(window_key, window)
                
                # Clear processed window
                async with self.window_lock:
                    if window_key in self.windows:
                        self.windows[window_key]['readings'].clear()
    
    async def _process_window(self, window_key: str, window: Dict):
        """Process a complete time window and create aggregates"""
        try:
            readings = list(window['readings'])
            if not readings:
                return
            
            # Calculate aggregations
            values = [reading.value for reading in readings]
            qualities = [reading.quality for reading in readings]
            
            # Statistical calculations
            aggregate = SensorAggregate(
                machine_id=window['machine_id'],
                sensor_type=window['sensor_type'],
                window_start=window['window_start'],
                window_end=window['window_end'],
                window_duration_seconds=self.settings.aggregation_window_seconds,
                count_readings=len(readings),
                avg_value=statistics.mean(values) if values else None,
                min_value=min(values) if values else None,
                max_value=max(values) if values else None,
                stddev_value=statistics.stdev(values) if len(values) > 1 else 0.0,
                percentile_50=np.percentile(values, 50) if values else None,
                percentile_95=np.percentile(values, 95) if values else None,
                percentile_99=np.percentile(values, 99) if values else None,
                good_readings=sum(1 for q in qualities if q == 'good'),
                poor_readings=sum(1 for q in qualities if q == 'poor'),
                bad_readings=sum(1 for q in qualities if q == 'bad')
            )
            
            # Store aggregate in database
            await self._store_aggregate(aggregate)
            
            # Publish aggregate to Kafka
            await self._publish_aggregate(aggregate)
            
            self.aggregates_created += 1
            
            logger.info(
                "Processed window aggregate",
                machine_id=aggregate.machine_id,
                sensor_type=aggregate.sensor_type,
                readings_count=aggregate.count_readings,
                avg_value=aggregate.avg_value,
                window_start=aggregate.window_start.isoformat()
            )
            
        except Exception as e:
            logger.error("Error processing window", window_key=window_key, error=str(e))
    
    async def _store_sensor_reading(self, reading: SensorReading):
        """Store raw sensor reading in PostgreSQL"""
        async with self.db_pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO manufacturing.sensor_readings 
                (machine_id, sensor_type, value, unit, quality, timestamp_utc, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                """,
                reading.machine_id,
                reading.sensor_type.value,
                reading.value,
                reading.unit,
                reading.quality.value,
                reading.timestamp,
                json.dumps(reading.metadata) if reading.metadata else None
            )
        
        self.database_writes += 1
    
    async def _store_aggregate(self, aggregate: SensorAggregate):
        """Store sensor aggregate in PostgreSQL"""
        async with self.db_pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO analytics.sensor_aggregates 
                (machine_id, sensor_type, window_start, window_end, window_duration,
                 count_readings, avg_value, min_value, max_value, stddev_value,
                 percentile_50, percentile_95, percentile_99,
                 good_readings, poor_readings, bad_readings)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                """,
                aggregate.machine_id,
                aggregate.sensor_type.value,
                aggregate.window_start,
                aggregate.window_end,
                f"{aggregate.window_duration_seconds} seconds",
                aggregate.count_readings,
                aggregate.avg_value,
                aggregate.min_value,
                aggregate.max_value,
                aggregate.stddev_value,
                aggregate.percentile_50,
                aggregate.percentile_95,
                aggregate.percentile_99,
                aggregate.good_readings,
                aggregate.poor_readings,
                aggregate.bad_readings
            )
        
        self.database_writes += 1
    
    async def _publish_aggregate(self, aggregate: SensorAggregate):
        """Publish aggregate to Kafka for downstream processing"""
        try:
            await self.producer.send(
                topic=self.settings.kafka_aggregates_topic,
                key=f"{aggregate.machine_id}:{aggregate.sensor_type}",
                value=aggregate.dict()
            )
            
        except Exception as e:
            logger.error("Failed to publish aggregate to Kafka", error=str(e))
    
    async def _process_all_windows(self):
        """Process all remaining windows during shutdown"""
        logger.info("Processing remaining windows")
        
        async with self.window_lock:
            for window_key, window in list(self.windows.items()):
                if window['readings']:
                    await self._process_window(window_key, window)
    
    async def _checkpoint_loop(self):
        """Periodically create checkpoints for recovery"""
        while self.running:
            try:
                await asyncio.sleep(self.settings.processor_checkpoint_interval_seconds)
                await self._create_checkpoint()
            except Exception as e:
                logger.error("Error in checkpoint loop", error=str(e))
    
    async def _create_checkpoint(self):
        """Create processing checkpoint for recovery"""
        # In a production system, this would persist processing state
        # For now, we'll just clean up old processed offsets
        if len(self.processed_offsets) > 10000:
            # Keep only recent offsets
            self.processed_offsets = set(list(self.processed_offsets)[-5000:])
        
        logger.debug("Created processing checkpoint", 
                    processed_offsets_count=len(self.processed_offsets))
    
    async def _metrics_reporting_loop(self):
        """Periodically report processing metrics"""
        while self.running:
            try:
                await asyncio.sleep(self.settings.metrics_collection_interval_seconds)
                await self._report_metrics()
            except Exception as e:
                logger.error("Error in metrics reporting", error=str(e))
    
    async def _report_metrics(self):
        """Report processing metrics"""
        uptime = (datetime.utcnow() - self.start_time).total_seconds()
        
        metrics = PipelineMetrics(
            service_name=self.settings.service_name,
            pipeline_stage="stream_processing",
            messages_processed=self.messages_processed,
            messages_failed=self.messages_failed,
            throughput_per_second=self.messages_processed / max(uptime, 1),
            error_rate=self.messages_failed / max(self.messages_processed, 1),
            custom_metrics={
                'aggregates_created': self.aggregates_created,
                'database_writes': self.database_writes,
                'active_windows': len(self.windows),
                'uptime_seconds': uptime
            }
        )
        
        logger.info(
            "Stream processor metrics",
            messages_processed=self.messages_processed,
            messages_failed=self.messages_failed,
            aggregates_created=self.aggregates_created,
            database_writes=self.database_writes,
            active_windows=len(self.windows),
            error_rate=metrics.error_rate,
            uptime_seconds=uptime
        )


async def main():
    """Main entry point for the stream processor service"""
    processor = StreamProcessor()
    
    # Setup signal handlers for graceful shutdown
    def signal_handler():
        logger.info("Received shutdown signal")
        asyncio.create_task(processor.stop())
    
    # Register signal handlers
    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, lambda s, f: signal_handler())
    
    try:
        await processor.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error("Stream processor failed", error=str(e))
        sys.exit(1)
    finally:
        await processor.stop()


if __name__ == "__main__":
    asyncio.run(main())
