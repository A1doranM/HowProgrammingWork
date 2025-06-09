"""
MQTT-Kafka Bridge Main Service
Forwards MQTT sensor data to Kafka topics for reliable stream processing
"""
import asyncio
import json
import signal
import sys
from datetime import datetime
from typing import Dict, Any, Optional

import structlog
from aiokafka import AIOKafkaProducer
from asyncio_mqtt import Client as MQTTClient, MqttError
from pydantic import ValidationError

from src.shared.config import get_mqtt_bridge_settings
from src.shared.models import SensorReading, MQTTMessage, KafkaMessage, PipelineMetrics

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


class MQTTKafkaBridge:
    """MQTT to Kafka bridge service for reliable message forwarding"""
    
    def __init__(self):
        self.settings = get_mqtt_bridge_settings()
        self.mqtt_client: Optional[MQTTClient] = None
        self.kafka_producer: Optional[AIOKafkaProducer] = None
        self.running = False
        self.start_time = datetime.utcnow()
        
        # Metrics tracking
        self.messages_received = 0
        self.messages_forwarded = 0
        self.messages_failed = 0
        self.last_message_time = None
        
        # Message buffer for batch processing
        self.message_buffer: Dict[str, list] = {}
        self.buffer_lock = asyncio.Lock()
        
    async def start(self):
        """Start the MQTT-Kafka bridge service"""
        logger.info("Starting MQTT-Kafka Bridge", version=self.settings.version)
        
        try:
            # Initialize Kafka producer
            await self._init_kafka_producer()
            
            # Initialize MQTT client
            await self._init_mqtt_client()
            
            # Start background tasks
            self.running = True
            await asyncio.gather(
                self._mqtt_message_loop(),
                self._buffer_flush_loop(),
                self._metrics_reporting_loop(),
                return_exceptions=True
            )
            
        except Exception as e:
            logger.error("Failed to start bridge service", error=str(e))
            await self.stop()
            raise
    
    async def stop(self):
        """Stop the MQTT-Kafka bridge service"""
        logger.info("Stopping MQTT-Kafka Bridge")
        self.running = False
        
        try:
            # Flush remaining messages
            await self._flush_message_buffer()
            
            # Close MQTT client
            if self.mqtt_client:
                await self.mqtt_client.disconnect()
                
            # Close Kafka producer
            if self.kafka_producer:
                await self.kafka_producer.stop()
                
        except Exception as e:
            logger.error("Error during shutdown", error=str(e))
        
        logger.info("MQTT-Kafka Bridge stopped")
    
    async def _init_kafka_producer(self):
        """Initialize Kafka producer with optimized settings"""
        producer_config = self.settings.get_kafka_producer_config()
        
        self.kafka_producer = AIOKafkaProducer(
            **producer_config,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
        )
        
        await self.kafka_producer.start()
        logger.info("Kafka producer initialized", bootstrap_servers=self.settings.kafka_bootstrap_servers)
    
    async def _init_mqtt_client(self):
        """Initialize MQTT client and subscribe to topics"""
        client_id = f"{self.settings.mqtt_client_id_prefix}bridge_{id(self)}"
        
        self.mqtt_client = MQTTClient(
            hostname=self.settings.mqtt_broker_host,
            port=self.settings.mqtt_broker_port,
            client_id=client_id,
            keepalive=self.settings.mqtt_keepalive,
            clean_session=self.settings.mqtt_clean_session
        )
        
        await self.mqtt_client.connect()
        
        # Subscribe to all sensor topics using wildcard
        for mqtt_topic in self.settings.mqtt_to_kafka_topic_mapping.keys():
            await self.mqtt_client.subscribe(mqtt_topic, qos=self.settings.mqtt_qos)
            logger.info("Subscribed to MQTT topic", topic=mqtt_topic)
        
        logger.info("MQTT client initialized", broker=f"{self.settings.mqtt_broker_host}:{self.settings.mqtt_broker_port}")
    
    async def _mqtt_message_loop(self):
        """Main loop for processing MQTT messages"""
        logger.info("Starting MQTT message processing loop")
        
        try:
            async with self.mqtt_client.messages() as messages:
                async for message in messages:
                    if not self.running:
                        break
                    
                    try:
                        await self._process_mqtt_message(message)
                        self.messages_received += 1
                        self.last_message_time = datetime.utcnow()
                        
                    except Exception as e:
                        self.messages_failed += 1
                        logger.error(
                            "Error processing MQTT message",
                            topic=message.topic.value,
                            error=str(e),
                            payload_preview=str(message.payload.decode())[:100]
                        )
                        
        except MqttError as e:
            logger.error("MQTT connection error", error=str(e))
            if self.running:
                # Attempt reconnection
                await asyncio.sleep(5)
                await self._init_mqtt_client()
        except Exception as e:
            logger.error("Unexpected error in MQTT loop", error=str(e))
    
    async def _process_mqtt_message(self, message):
        """Process individual MQTT message and forward to Kafka"""
        topic = message.topic.value
        payload = message.payload.decode()
        
        try:
            # Parse the MQTT message payload
            payload_data = json.loads(payload)
            
            # Determine target Kafka topic
            kafka_topic = self._get_kafka_topic(topic)
            if not kafka_topic:
                logger.warning("No Kafka topic mapping found", mqtt_topic=topic)
                return
            
            # Extract machine_id from topic (assuming format: manufacturing/{machine_id}/{sensor_type})
            topic_parts = topic.split('/')
            if len(topic_parts) >= 3 and topic_parts[0] == 'manufacturing':
                machine_id = topic_parts[1]
                sensor_type = topic_parts[2]
                
                # Validate and enrich sensor reading
                if kafka_topic == "sensor-readings":
                    sensor_reading = await self._process_sensor_reading(
                        payload_data, machine_id, sensor_type, topic
                    )
                    if sensor_reading:
                        await self._buffer_message(kafka_topic, machine_id, sensor_reading.dict())
                else:
                    # Handle other message types (machine status, alerts, etc.)
                    await self._buffer_message(kafka_topic, machine_id, payload_data)
            else:
                # Handle messages without machine_id (e.g., global alerts)
                await self._buffer_message(kafka_topic, None, payload_data)
                
        except json.JSONDecodeError as e:
            logger.error("Invalid JSON in MQTT payload", topic=topic, error=str(e))
        except Exception as e:
            logger.error("Error processing MQTT message", topic=topic, error=str(e))
    
    async def _process_sensor_reading(
        self, 
        payload_data: Dict[str, Any], 
        machine_id: str, 
        sensor_type: str,
        topic: str
    ) -> Optional[SensorReading]:
        """Process and validate sensor reading data"""
        try:
            # Ensure required fields are present
            if 'value' not in payload_data:
                logger.error("Missing 'value' field in sensor reading", topic=topic)
                return None
            
            # Build sensor reading with defaults
            sensor_data = {
                'machine_id': machine_id,
                'sensor_type': sensor_type,
                'value': payload_data['value'],
                'unit': payload_data.get('unit', 'unknown'),
                'timestamp': payload_data.get('timestamp', datetime.utcnow().isoformat()),
                'quality': payload_data.get('quality', 'good'),
                'metadata': payload_data.get('metadata'),
                'source_service': 'mqtt-kafka-bridge',
                'correlation_id': payload_data.get('correlation_id')
            }
            
            # Validate using Pydantic model
            sensor_reading = SensorReading(**sensor_data)
            
            logger.debug(
                "Processed sensor reading",
                machine_id=machine_id,
                sensor_type=sensor_type,
                value=sensor_reading.value
            )
            
            return sensor_reading
            
        except ValidationError as e:
            logger.error(
                "Invalid sensor reading data",
                topic=topic,
                validation_errors=e.errors()
            )
            return None
        except Exception as e:
            logger.error(
                "Error processing sensor reading",
                topic=topic,
                error=str(e)
            )
            return None
    
    def _get_kafka_topic(self, mqtt_topic: str) -> Optional[str]:
        """Map MQTT topic to Kafka topic using wildcard matching"""
        for pattern, kafka_topic in self.settings.mqtt_to_kafka_topic_mapping.items():
            # Simple wildcard matching (+ matches single level)
            pattern_parts = pattern.split('/')
            topic_parts = mqtt_topic.split('/')
            
            if len(pattern_parts) == len(topic_parts):
                match = True
                for i, (pattern_part, topic_part) in enumerate(zip(pattern_parts, topic_parts)):
                    if pattern_part != '+' and pattern_part != topic_part:
                        match = False
                        break
                
                if match:
                    return kafka_topic
        
        return None
    
    async def _buffer_message(self, kafka_topic: str, key: Optional[str], message: Dict[str, Any]):
        """Buffer message for batch processing"""
        async with self.buffer_lock:
            if kafka_topic not in self.message_buffer:
                self.message_buffer[kafka_topic] = []
            
            kafka_message = {
                'key': key,
                'value': message,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            self.message_buffer[kafka_topic].append(kafka_message)
            
            # Flush if buffer is full
            if len(self.message_buffer[kafka_topic]) >= self.settings.bridge_buffer_size:
                await self._flush_topic_buffer(kafka_topic)
    
    async def _buffer_flush_loop(self):
        """Periodically flush message buffers"""
        while self.running:
            try:
                await asyncio.sleep(self.settings.bridge_flush_interval_seconds)
                await self._flush_message_buffer()
            except Exception as e:
                logger.error("Error in buffer flush loop", error=str(e))
    
    async def _flush_message_buffer(self):
        """Flush all buffered messages to Kafka"""
        async with self.buffer_lock:
            for kafka_topic in list(self.message_buffer.keys()):
                await self._flush_topic_buffer(kafka_topic)
    
    async def _flush_topic_buffer(self, kafka_topic: str):
        """Flush messages for a specific Kafka topic"""
        if kafka_topic not in self.message_buffer or not self.message_buffer[kafka_topic]:
            return
        
        messages = self.message_buffer[kafka_topic].copy()
        self.message_buffer[kafka_topic].clear()
        
        try:
            # Send messages to Kafka
            for message in messages:
                await self.kafka_producer.send(
                    topic=kafka_topic,
                    key=message['key'],
                    value=message['value']
                )
            
            self.messages_forwarded += len(messages)
            
            logger.debug(
                "Flushed messages to Kafka",
                topic=kafka_topic,
                count=len(messages)
            )
            
        except Exception as e:
            self.messages_failed += len(messages)
            logger.error(
                "Failed to send messages to Kafka",
                topic=kafka_topic,
                count=len(messages),
                error=str(e)
            )
            
            # Re-add messages to buffer for retry
            self.message_buffer[kafka_topic].extend(messages)
    
    async def _metrics_reporting_loop(self):
        """Periodically report metrics"""
        while self.running:
            try:
                await asyncio.sleep(self.settings.metrics_collection_interval_seconds)
                await self._report_metrics()
            except Exception as e:
                logger.error("Error in metrics reporting", error=str(e))
    
    async def _report_metrics(self):
        """Report service metrics"""
        uptime = (datetime.utcnow() - self.start_time).total_seconds()
        
        metrics = PipelineMetrics(
            service_name=self.settings.service_name,
            pipeline_stage="mqtt_bridge",
            messages_processed=self.messages_received,
            messages_failed=self.messages_failed,
            throughput_per_second=self.messages_forwarded / max(uptime, 1),
            error_rate=self.messages_failed / max(self.messages_received, 1),
            custom_metrics={
                'messages_forwarded': self.messages_forwarded,
                'buffer_size': sum(len(buffer) for buffer in self.message_buffer.values()),
                'uptime_seconds': uptime
            }
        )
        
        logger.info(
            "Bridge metrics",
            messages_received=self.messages_received,
            messages_forwarded=self.messages_forwarded,
            messages_failed=self.messages_failed,
            error_rate=metrics.error_rate,
            uptime_seconds=uptime
        )


async def main():
    """Main entry point for the MQTT-Kafka bridge service"""
    bridge = MQTTKafkaBridge()
    
    # Setup signal handlers for graceful shutdown
    def signal_handler():
        logger.info("Received shutdown signal")
        asyncio.create_task(bridge.stop())
    
    # Register signal handlers
    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, lambda s, f: signal_handler())
    
    try:
        await bridge.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error("Bridge service failed", error=str(e))
        sys.exit(1)
    finally:
        await bridge.stop()


if __name__ == "__main__":
    asyncio.run(main())
