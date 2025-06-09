"""
MQTT IoT Device Simulator
Simulates realistic sensor data from manufacturing equipment for testing
"""
import asyncio
import json
import random
import signal
import sys
from datetime import datetime
from typing import Dict, List
import uuid

import structlog
from asyncio_mqtt import Client as MQTTClient, MqttError

from src.shared.config import get_settings
from src.shared.models import SensorReading, SensorType, DataQuality

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


class MachineSimulator:
    """Simulates a single manufacturing machine with multiple sensors"""
    
    def __init__(self, machine_id: str, machine_type: str = "CNC_MILL"):
        self.machine_id = machine_id
        self.machine_type = machine_type
        self.running = False
        
        # Machine state
        self.status = "running"
        self.power_consumption = 15.0  # kW base power
        self.operating_hours = 0.0
        
        # Sensor baselines and ranges
        self.sensor_config = {
            SensorType.temperature: {
                'baseline': 75.0,
                'variance': 5.0,
                'unit': 'celsius',
                'min_value': 60.0,
                'max_value': 95.0,
                'drift_rate': 0.01
            },
            SensorType.pressure: {
                'baseline': 150.0,
                'variance': 10.0,
                'unit': 'bar',
                'min_value': 100.0,
                'max_value': 200.0,
                'drift_rate': 0.005
            },
            SensorType.vibration: {
                'baseline': 2.5,
                'variance': 0.5,
                'unit': 'mm/s',
                'min_value': 1.0,
                'max_value': 8.0,
                'drift_rate': 0.02
            },
            SensorType.speed: {
                'baseline': 1500.0,
                'variance': 50.0,
                'unit': 'rpm',
                'min_value': 1000.0,
                'max_value': 2000.0,
                'drift_rate': 0.001
            },
            SensorType.power: {
                'baseline': 15.0,
                'variance': 2.0,
                'unit': 'kW',
                'min_value': 8.0,
                'max_value': 25.0,
                'drift_rate': 0.003
            }
        }
        
        # Current sensor values
        self.current_values = {
            sensor_type: config['baseline'] 
            for sensor_type, config in self.sensor_config.items()
        }
        
        # Quality degradation simulation
        self.quality_degradation = 0.0
        self.last_maintenance = datetime.utcnow()
        
    def simulate_sensor_reading(self, sensor_type: SensorType) -> Dict:
        """Generate realistic sensor reading with wear and environmental factors"""
        config = self.sensor_config[sensor_type]
        current_value = self.current_values[sensor_type]
        
        # Add random variance
        variance = random.gauss(0, config['variance'])
        
        # Add drift over time (wear simulation)
        drift = config['drift_rate'] * self.operating_hours * random.uniform(-1, 1)
        
        # Add correlation effects
        correlation_effect = self._calculate_correlation_effect(sensor_type)
        
        # Calculate new value
        new_value = current_value + variance + drift + correlation_effect
        
        # Apply constraints
        new_value = max(config['min_value'], min(config['max_value'], new_value))
        
        # Update current value with some smoothing
        self.current_values[sensor_type] = 0.8 * current_value + 0.2 * new_value
        
        # Determine data quality
        quality = self._determine_quality(sensor_type, new_value)
        
        return {
            'machine_id': self.machine_id,
            'sensor_type': sensor_type.value,
            'value': round(new_value, 2),
            'unit': config['unit'],
            'quality': quality.value,
            'timestamp': datetime.utcnow().isoformat(),
            'metadata': {
                'machine_type': self.machine_type,
                'operating_hours': round(self.operating_hours, 1),
                'quality_degradation': round(self.quality_degradation, 3)
            }
        }
    
    def _calculate_correlation_effect(self, sensor_type: SensorType) -> float:
        """Calculate effect of other sensors on this sensor (realistic correlations)"""
        effect = 0.0
        
        if sensor_type == SensorType.temperature:
            # Temperature increases with power and speed
            power_effect = (self.current_values[SensorType.power] - 15.0) * 0.3
            speed_effect = (self.current_values[SensorType.speed] - 1500.0) * 0.001
            effect = power_effect + speed_effect
            
        elif sensor_type == SensorType.vibration:
            # Vibration increases with speed and decreases with temperature (thermal expansion)
            speed_effect = (self.current_values[SensorType.speed] - 1500.0) * 0.0008
            temp_effect = (self.current_values[SensorType.temperature] - 75.0) * -0.01
            effect = speed_effect + temp_effect
            
        elif sensor_type == SensorType.power:
            # Power increases with speed and temperature
            speed_effect = (self.current_values[SensorType.speed] - 1500.0) * 0.005
            temp_effect = (self.current_values[SensorType.temperature] - 75.0) * 0.1
            effect = speed_effect + temp_effect
        
        return effect
    
    def _determine_quality(self, sensor_type: SensorType, value: float) -> DataQuality:
        """Determine data quality based on sensor value and machine condition"""
        config = self.sensor_config[sensor_type]
        
        # Check if value is within normal operating range
        normal_min = config['baseline'] - config['variance'] * 2
        normal_max = config['baseline'] + config['variance'] * 2
        
        # Quality degradation affects accuracy
        quality_factor = 1.0 - self.quality_degradation
        
        if value < config['min_value'] * 1.1 or value > config['max_value'] * 0.9:
            return DataQuality.bad
        elif value < normal_min or value > normal_max:
            return DataQuality.poor if quality_factor > 0.8 else DataQuality.bad
        elif quality_factor < 0.9:
            return DataQuality.poor if random.random() > 0.7 else DataQuality.good
        else:
            return DataQuality.good
    
    def update_machine_state(self, hours_elapsed: float):
        """Update machine state over time"""
        self.operating_hours += hours_elapsed
        
        # Gradual quality degradation
        self.quality_degradation += 0.001 * hours_elapsed
        self.quality_degradation = min(0.5, self.quality_degradation)  # Max 50% degradation
        
        # Periodic maintenance resets degradation
        if self.operating_hours % 100 == 0:  # Every 100 hours
            self.quality_degradation *= 0.1  # Maintenance reduces degradation
            logger.info("Maintenance performed", machine_id=self.machine_id)


class IoTSimulator:
    """IoT device simulator managing multiple machines"""
    
    def __init__(self):
        self.settings = get_settings()
        self.mqtt_client: MQTTClient = None
        self.machines: List[MachineSimulator] = []
        self.running = False
        self.messages_sent = 0
        self.start_time = datetime.utcnow()
        
    async def start(self):
        """Start the IoT simulator"""
        logger.info("Starting IoT Simulator", machines=len(self.settings.simulator_machines))
        
        try:
            # Initialize MQTT client
            await self._init_mqtt_client()
            
            # Create machine simulators
            self._create_machine_simulators()
            
            # Start simulation tasks
            self.running = True
            await asyncio.gather(
                self._sensor_data_loop(),
                self._machine_state_loop(),
                self._status_reporting_loop(),
                return_exceptions=True
            )
            
        except Exception as e:
            logger.error("Failed to start IoT simulator", error=str(e))
            await self.stop()
            raise
    
    async def stop(self):
        """Stop the IoT simulator"""
        logger.info("Stopping IoT Simulator")
        self.running = False
        
        try:
            if self.mqtt_client:
                await self.mqtt_client.disconnect()
        except Exception as e:
            logger.error("Error during shutdown", error=str(e))
        
        logger.info("IoT Simulator stopped")
    
    async def _init_mqtt_client(self):
        """Initialize MQTT client connection"""
        client_id = f"{self.settings.mqtt_client_id_prefix}simulator_{uuid.uuid4().hex[:8]}"
        
        self.mqtt_client = MQTTClient(
            hostname=self.settings.mqtt_broker_host,
            port=self.settings.mqtt_broker_port,
            client_id=client_id,
            keepalive=self.settings.mqtt_keepalive,
            clean_session=self.settings.mqtt_clean_session
        )
        
        await self.mqtt_client.connect()
        logger.info("MQTT client connected", broker=f"{self.settings.mqtt_broker_host}:{self.settings.mqtt_broker_port}")
    
    def _create_machine_simulators(self):
        """Create machine simulators for configured machines"""
        machine_types = ["CNC_MILL", "CNC_LATHE", "3D_PRINTER", "INJECTION_MOLDING"]
        
        for machine_id in self.settings.simulator_machines:
            machine_type = random.choice(machine_types)
            machine = MachineSimulator(machine_id, machine_type)
            self.machines.append(machine)
            
            logger.info("Created machine simulator", 
                       machine_id=machine_id, 
                       machine_type=machine_type)
    
    async def _sensor_data_loop(self):
        """Main loop for publishing sensor data"""
        logger.info("Starting sensor data publishing loop")
        
        while self.running:
            try:
                tasks = []
                
                # Generate sensor readings for all machines
                for machine in self.machines:
                    for sensor_type in SensorType:
                        if sensor_type in machine.sensor_config:
                            task = self._publish_sensor_reading(machine, sensor_type)
                            tasks.append(task)
                
                # Publish all readings concurrently
                await asyncio.gather(*tasks, return_exceptions=True)
                
                # Wait for next interval
                await asyncio.sleep(self.settings.simulator_publish_interval_seconds)
                
            except Exception as e:
                logger.error("Error in sensor data loop", error=str(e))
                await asyncio.sleep(1)
    
    async def _publish_sensor_reading(self, machine: MachineSimulator, sensor_type: SensorType):
        """Publish individual sensor reading to MQTT"""
        try:
            # Generate sensor reading
            reading_data = machine.simulate_sensor_reading(sensor_type)
            
            # Create MQTT topic
            topic = self.settings.get_mqtt_topic(machine.machine_id, sensor_type.value)
            
            # Publish to MQTT
            await self.mqtt_client.publish(
                topic,
                json.dumps(reading_data),
                qos=self.settings.mqtt_qos,
                retain=self.settings.mqtt_retain
            )
            
            self.messages_sent += 1
            
            logger.debug("Published sensor reading",
                        machine_id=machine.machine_id,
                        sensor_type=sensor_type.value,
                        value=reading_data['value'],
                        topic=topic)
            
        except Exception as e:
            logger.error("Failed to publish sensor reading",
                        machine_id=machine.machine_id,
                        sensor_type=sensor_type.value,
                        error=str(e))
    
    async def _machine_state_loop(self):
        """Update machine states periodically"""
        while self.running:
            try:
                # Update each machine's state
                for machine in self.machines:
                    machine.update_machine_state(0.1)  # 0.1 hours elapsed
                
                # Wait 6 minutes (0.1 hours in simulation time)
                await asyncio.sleep(360)
                
            except Exception as e:
                logger.error("Error in machine state loop", error=str(e))
                await asyncio.sleep(60)
    
    async def _status_reporting_loop(self):
        """Report simulator status periodically"""
        while self.running:
            try:
                await asyncio.sleep(30)  # Report every 30 seconds
                
                uptime = (datetime.utcnow() - self.start_time).total_seconds()
                messages_per_second = self.messages_sent / max(uptime, 1)
                
                logger.info("Simulator status",
                           messages_sent=self.messages_sent,
                           messages_per_second=round(messages_per_second, 2),
                           uptime_seconds=round(uptime),
                           active_machines=len(self.machines))
                
                # Publish status to MQTT
                status_data = {
                    "simulator_id": "iot-simulator",
                    "status": "running",
                    "messages_sent": self.messages_sent,
                    "messages_per_second": round(messages_per_second, 2),
                    "uptime_seconds": round(uptime),
                    "active_machines": len(self.machines),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await self.mqtt_client.publish(
                    "manufacturing/simulator/status",
                    json.dumps(status_data),
                    qos=1
                )
                
            except Exception as e:
                logger.error("Error in status reporting loop", error=str(e))


async def main():
    """Main entry point for the IoT simulator"""
    simulator = IoTSimulator()
    
    # Setup signal handlers for graceful shutdown
    def signal_handler():
        logger.info("Received shutdown signal")
        asyncio.create_task(simulator.stop())
    
    # Register signal handlers
    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, lambda s, f: signal_handler())
    
    try:
        await simulator.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error("IoT simulator failed", error=str(e))
        sys.exit(1)
    finally:
        await simulator.stop()


if __name__ == "__main__":
    asyncio.run(main())
