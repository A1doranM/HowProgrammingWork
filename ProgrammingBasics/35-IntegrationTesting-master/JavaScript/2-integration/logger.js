"use strict";

class Logger {
  static color(level) {
    return Logger.COLORS[level] || Logger.COLORS.info;
  }

  log(level, s) {
    const date = new Date().toISOString();
    const color = Logger.color(level);
    console.log(color + date + "\t" + s + "\x1b[0m");
  }

  warn(s) {
    this.log("warn", s);
  }

  error(s) {
    this.log("error", s);
  }

  info(s) {
    this.log("info", s);
  }
}

Logger.COLORS = {
  warn: "\x1b[1;33m",
  error: "\x1b[0;31m",
  info: "\x1b[1;37m",
};

module.exports = { Logger };
