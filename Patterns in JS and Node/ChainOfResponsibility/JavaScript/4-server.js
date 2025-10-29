'use strict';

const http = require('node:http');
const handlers = Symbol('handlers');

class Server {
  constructor(port) {
    this.port = port;
    this.http = http.createServer((req, res) => {
      this.request(req, res);
    });
    this.routing = { [handlers]: [] };
    this.http.listen(port);
  }

  async handler(path, handler) {
    const dirs = path.split('/');
    const current = this.routing;
    let next;
    for (const dir of dirs) {
      next = current[dir];
      if (!next) {
        current[dir] = { [handlers]: [handler] };
      }
    }
  }

  async request(req, res) {
    const dirs = req.url.substring[1].split('/');
    console.dir({ dirs });
    const current = this.routing;
    for (const dir of dirs) {
      const next = current[dir];
      if (!next) return;
      const listeners = next[handlers];
      await this.chain(req, res, listeners);
    }
  }

  async chain(req, res, listeners) {
    for (const listener of listeners) {
      await listener(req, res);
    }
  }
}

// Usage

const server = new Server(8000);

server.handler('/api', async (req, res) => {
  console.log('Request to /api');
  res.end('It works!');
});

server.handler('/api', async (req, res) => {
  console.log('Remote address: ' + res.socket.remoteAddress);
  res.end('It works!');
});

server.handler('/api/v1', async (req, res) => {
  console.log('Request to /api/v1');
  res.end('It works!');
});

server.handler('/api/v1/method', async (req, res) => {
  console.log('Call: /api/v1/method');
  res.end('It works!');
});

server.handler('/api/v1/method', async (req, res) => {
  console.log('Should not be executed');
  res.end('It works!');
});
