"use strict";

const { Observable } = require("rxjs");
const operators = require("rxjs/operators");
const { map, filter, take, reduce } = operators;
const { debounceTime, throttleTime } = operators;

process.stdin.setRawMode(true);

// Keyboard stream

const keyboard = new Observable((subscriber) => {
  process.stdin.on("data", (data) => {
    subscriber.next(data);
  });
});

keyboard.subscribe((data) => {
  console.log("---");
  console.dir({ keyboard: data });
});

// Cursors

const arrows = {
  65: "🡅",
  66: "🡇",
  67: "🡆",
  68: "🡄",
};

const cursors = keyboard.pipe(
  filter((buf) => (buf[0] === 27) && (buf[1] === 91)),
  map((buf) => buf[2]),
  map((key) => arrows[key]),
  //throttleTime(1000),
  debounceTime(2000),
);

cursors.subscribe((cursor) => {
  console.dir({ cursor });
});

// Keypress

const keypress = keyboard.pipe(map((buf) => buf[0]));

keypress.subscribe((key) => {
  console.dir({ keypress: key });
});

// Take first 5 chars

const take5 = keypress.pipe(
  take(5),
  map((key) => String.fromCharCode(key)),
  reduce((acc, char) => acc + char)
);

take5.subscribe((s) => {
  console.dir({ take5: s });
});

// Exit / Ctrl+C

keypress
  .pipe(filter((x) => x === 3))
  .subscribe(process.exit.bind(null, 0));
