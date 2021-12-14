"use strict";

const cluster = require("cluster");

if (cluster.isMaster) {
  require("./master.js");
} else {
  require("./worker.js");
}
