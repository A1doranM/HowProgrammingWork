'use strict';

const fs = require('fs');
const http = require('http');

const index = fs.readFileSync('./5-fetch.html');
const person = { name: 'Marcus' };
const data = JSON.stringify(person);

http.createServer((req, res) => {
  res.end(req.url === '/person' ? data : index);
}).listen(8000);
