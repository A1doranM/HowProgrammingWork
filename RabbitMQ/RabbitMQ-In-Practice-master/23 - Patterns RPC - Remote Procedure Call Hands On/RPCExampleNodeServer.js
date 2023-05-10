#!/usr/bin/env node

const amqp = require("amqplib/callback_api");

function fibonacci(n) {
  if (n === 0 || n === 1)
    return n;
  else
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// As usual we start by establishing the connection, channel and
// declaring the queue.

// We might want to run more than one server process. In order to
// spread the load equally over multiple servers we need to set the
// prefetch setting on channel.

// We use Channel.consume to consume messages from the queue.
// Then we enter the callback function where we do the work and
// send the response back.

// Our code is still pretty simplistic and doesn't try to solve more complex (but important) problems, like:

// How should the client react if there are no servers running?
// Should a client have some kind of timeout for the RPC?
// If the server malfunctions and raises an exception, should it
// be forwarded to the client?
// Protecting against invalid incoming messages (eg checking bounds,
// type) before processing.

amqp.connect("amqp://localhost", function(error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    const queue = "rpc_queue";

    channel.assertQueue(queue, {
      durable: false
    });
    channel.prefetch(1);

    console.log(" [x] Awaiting RPC requests");

    channel.consume(queue, function reply(msg) {
      const n = parseInt(msg.content.toString());

      console.log(" [.] fib(%d)", n);

      const r = fibonacci(n);

      channel.sendToQueue(msg.properties.replyTo,
        Buffer.from(r.toString()), {
          correlationId: msg.properties.correlationId
        });

      channel.ack(msg);
    });
  });
});
