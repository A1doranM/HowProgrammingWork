'use strict';

class SmartLight {
  constructor(name) {
    this.name = name;
  }

  turnOnMQTT() {
    console.log(`[MQTT] Sending 'Turn On Light' to ${this.name}`);
  }

  turnOnHTTP() {
    console.log(`[HTTP] Sending 'Turn On Light' to ${this.name}`);
  }

  turnOffMQTT() {
    console.log(`[MQTT] Sending 'Turn Off Light' to ${this.name}`);
  }

  turnOffHTTP() {
    console.log(`[HTTP] Sending 'Turn Off Light' to ${this.name}`);
  }
}

class SmartThermostat {
  constructor(name) {
    this.name = name;
  }

  setTemperatureMQTT(temp) {
    const command = `Set Temperature to ${temp}°C`;
    console.log(`[MQTT] Sending '${command}' to ${this.name}`);
  }

  setTemperatureHTTP(temp) {
    const command = `Set Temperature to ${temp}°C`;
    console.log(`[HTTP] Sending '${command}' to ${this.name}`);
  }
}

// Usage

const light = new SmartLight('LivingRoomLight');
// [MQTT] Sending 'Turn On Light' to LivingRoomLight
light.turnOnMQTT();

const thermostat = new SmartThermostat('BedroomThermostat');
// [HTTP] Sending 'Set Temperature to 22°C' to BedroomThermostat
thermostat.setTemperatureHTTP(22);
