"use strict";

class Timer {
  constructor(interval, listener) {
    this.interval = interval;
    this.enabled = false;
    this.listener = listener;
    this.timer = null;
  }

  start() {
    if (this.enabled) return;
    this.enabled = true;
    this.timer = setInterval(this.listener, this.interval);
  }

  stop() {
    if (this.enabled) {
      clearTimeout(this.timer);
      this.enabled = false;
    }
  }
}

// Uasge

const timer = new Timer(1000, () => console.log("Timer event"));
timer.start();
setTimeout(() => timer.stop(), 5000);
