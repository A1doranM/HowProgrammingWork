#!/usr/bin/env node

const amqp = require("amqplib/callback_api");

const args = process.argv.slice(2);

// if (args.length === 0) {
//   console.log("Usage: rpc_client.js num");
//   process.exit(1);
// }

// As usual we start by establishing the connection, channel and
// declaring the queue.

// We might want to run more than one server process. In order to
// spread the load equally over multiple servers we need to set the
// prefetch setting on channel.

// We use Channel.consume to consume messages from the queue.
// Then we enter the callback function where we do the work and
// send the response back.

amqp.connect("amqp://localhost", function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertQueue("", {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      const correlationId = generateUuid();
      const num = 10; // Our fibonacci number, change if you want

      console.log(" [x] Requesting fib(%d)", num);

      channel.consume(q.queue, function(msg) {
        if (msg.properties.correlationId === correlationId) {
          console.log(" [.] Got %s", msg.content.toString());
          setTimeout(function() {
            connection.close();
            process.exit(0)
          }, 500);
        }
      }, {
        noAck: true
      });

      channel.sendToQueue("rpc_queue",
        Buffer.from(num.toString()),{
          correlationId: correlationId,
          replyTo: q.queue });
    });
  });
});

function generateUuid() {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}
