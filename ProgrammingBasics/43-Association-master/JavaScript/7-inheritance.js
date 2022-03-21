"use strict";

const { EventEmitter } = require("events");

class Channel extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.histry = [];
  }

  send(from, message) {
    this.histry.push({ from, message });
    this.emit("message", from, message);
  }
}

class Application extends EventEmitter {
  constructor() {
    super();
    this.channels = {};
  }

  createChannel(name) {
    const channel = new Channel(name);
    this.channels[name] = channel;
    this.emit("channel", name);
    return channel;
  }
}

// Usage

const chat = new Application("Chat");

chat.on("channel", (name) => {
  console.log(`Channel ${name} created`);
});

const hpw = chat.createChannel("HowProgrammingWorks");

hpw.on("message", (from, message) => {
  console.log(`${from}> ${message}`);
});

hpw.send("Marcus", "Hello there");
hpw.send("Mao", "Node.js macht frei!");
hpw.send("Marcus", "Fine");
