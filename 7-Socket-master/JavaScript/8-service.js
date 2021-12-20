"use strict";

const dns = require("dns");

// Просмотреть что крутится на указанном порту по указанному адресу
dns.lookupService("192.30.253.113", 443, (err, host, service) => {
  if (err) throw err;
  console.log({ host, service });
});
