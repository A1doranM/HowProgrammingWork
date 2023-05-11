#!/usr/bin/env node

const { Buffer } = require("node:buffer");
const amqp = require("amqplib/callback_api");

amqp.connect("amqp://localhost", function(error0, connection) {
  if (error0) {
    throw error0;
  }

  const CONSISTENT_HASH_EXCHANGE_TYPE = "x-consistent-hash";

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    const queues = ["q.messages1", "q.messages2"];

    channel.assertExchange("ex.hash", CONSISTENT_HASH_EXCHANGE_TYPE, {
      durable: true,
      internal: false,
      autoDelete: false
    })

    for (const q of queues) {
      channel.assertQueue(q, {
        durable: true
      });
      channel.bindQueue(q, "ex.hash", "1");
    }

    console.log(" [x] Publishing");

    for (let i = 0; i < 100000; i++) {
      const buf = Buffer.from(String(Math.random() * 100), "utf8");
      channel.publish("ex.hash", `${i}`, buf);
    }

    console.log(" [x] Published");
  });
});
