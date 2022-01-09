"use strict";

const cluster = require("cluster");

if (cluster.isPrimary) {
  require("./master.js");
} else {
  require("./worker.js");
}
