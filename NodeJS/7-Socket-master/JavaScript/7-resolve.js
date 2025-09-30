"use strict";

const dns = require("dns"); // Позволяет получить информацию о хосте, хострмастере и т.д.

// Можно подставлять просто хостнейм вместо IP
dns.resolve("how.programming.works", (err, data) => {
  if (err) {
    if (err.code === "ECONNREFUSED") {
      console.log("No internet connection");
    } else {
      console.log("Web is dead");
    }
  }
  console.log({ data });
});

dns.resolveAny("google.com", (err, data) => {
  if (err) throw err;
  console.log({ data });
});
