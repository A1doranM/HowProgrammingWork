'use strict';

const http = require('http');
const https = require('https');

const fetch = url => new Promise((resolve, reject) => {
  const protocol = url.startsWith('https') ? https : http;
  protocol.get(url, res => {
    if (res.statusCode !== 200) {
      const { statusCode, statusMessage } = res;
      reject(new Error(`Status Code: ${statusCode} ${statusMessage}`));
    }
    res.setEncoding('utf8');
    const buffer = [];
    res.on('data', chunk => buffer.push(chunk));
    res.on('end', () => resolve(buffer.join()));
  });
});

// Usage

fetch('http://ietf.org/')
  .then(body => console.log(body))
  .catch(err => console.error(err));
