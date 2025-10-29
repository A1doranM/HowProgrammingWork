'use strict';

class SmartLightHTTP {
  constructor(name) {
    this.name = name;
  }

  turnOn() {
    console.log(`[HTTP] Sending 'Turn On Light' to ${this.name}`);
  }

  turnOff() {
    console.log(`[HTTP] Sending 'Turn Off Light' to ${this.name}`);
  }
}

class SmartLightMQTT {
  constructor(name) {
    this.name = name;
  }

  turnOn() {
    console.log(`[MQTT] Sending 'Turn On Light' to ${this.name}`);
  }

  turnOff() {
    console.log(`[MQTT] Sending 'Turn Off Light' to ${this.name}`);
  }
}

class SmartThermostatHTTP {
  constructor(name) {
    this.name = name;
  }

  setTemperature(temp) {
    const command = `Set Temperature to ${temp}°C`;
    console.log(`[HTTP] Sending '${command}' to ${this.name}`);
  }
}

class SmartThermostatMQTT {
  constructor(name) {
    this.name = name;
  }

  setTemperature(temp) {
    const command = `Set Temperature to ${temp}°C`;
    console.log(`[MQTT] Sending '${command}' to ${this.name}`);
  }
}

// Usage

const light = new SmartLightMQTT('LivingRoomLight');
// [MQTT] Sending 'Turn On Light' to LivingRoomLight
light.turnOn();

const thermostat = new SmartThermostatHTTP('BedroomThermostat');
// [HTTP] Sending 'Set Temperature to 22°C' to BedroomThermostat
thermostat.setTemperature(22);
