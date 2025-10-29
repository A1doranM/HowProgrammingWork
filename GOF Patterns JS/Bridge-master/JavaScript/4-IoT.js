'use strict';

// Abstract class or Interface

class CommunicationProtocol {
  sendCommand(device, command) {
    console.log({ device, command });
    throw new Error('sendCommand() must be implemented');
  }
}

// Multiple implementations

class MQTTProtocol extends CommunicationProtocol {
  sendCommand(device, command) {
    console.log(`[MQTT] Sending '${command}' to ${device}`);
  }
}

class HTTPProtocol extends CommunicationProtocol {
  sendCommand(device, command) {
    console.log(`[HTTP] Sending '${command}' to ${device}`);
  }
}

// Abstract Usage

class IoTDevice {
  constructor(name, protocol) {
    this.name = name;
    this.protocol = protocol;
  }

  operate(command) {
    this.protocol.sendCommand(this.name, command);
  }
}

// Implementations

class SmartLight extends IoTDevice {
  turnOn() {
    this.operate('Turn On Light');
  }

  turnOff() {
    this.operate('Turn Off Light');
  }
}

class SmartThermostat extends IoTDevice {
  setTemperature(temp) {
    this.operate(`Set Temperature to ${temp}°C`);
  }
}

// Usage

const mqtt = new MQTTProtocol();
const light = new SmartLight('LivingRoomLight', mqtt);
// [MQTT] Sending 'Turn On Light' to LivingRoomLight
light.turnOn();

const http = new HTTPProtocol();
const thermostat = new SmartThermostat('BedroomThermostat', http);
// [HTTP] Sending 'Set Temperature to 22°C' to BedroomThermostat
thermostat.setTemperature(22);
