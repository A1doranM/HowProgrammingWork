"use strict";

const { EventEmitter } = require("events");

class Channel {
  constructor(application, name) {
    this.application = application;
    this.name = name;
    this.histry = [];
  }

  send(from, message) {
    this.histry.push({ from, message });
    this.application.events.emit("message", this.name, from, message);
  }
}

class Application {
  constructor() {
    this.events = new EventEmitter();
    this.channels = {};
  }

  createChannel(name) {
    const channel = new Channel(this, name);
    this.channels[name] = channel;
    this.events.emit("channel", name);
    return channel;
  }
}

// Usage

const chat = new Application("Chat");

chat.events.on("channel", (name) => {
  console.log(`Channel ${name} created`);
});

chat.events.on("message", (channel, from, message) => {
  console.log(`${from}@${channel}> ${message}`);
});

const hpw = chat.createChannel("HowProgrammingWorks");

hpw.send("Marcus", "Hello there");
hpw.send("Mao", "Node.js macht frei!");
hpw.send("Marcus", "Fine");
