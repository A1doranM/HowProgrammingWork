"use strict";

// Пример с рекурсивным Thenable классом.
// Здесь мы реализовали практически самый простой Promise.
const fs = require("fs");

class Thenable {
  constructor() {
    this.next = null;
  }

  then(onSuccess) { // Каждый раз когда кто-то вызывает then создается новый
    this.onSuccess = onSuccess;
    const next = new Thenable(); // Thenable и он уже возвращается из функции.
                                // так что в него можно будет засунуть новую асинхронную операцию
                                // и потом вызывать then у нее.
    this.next = next;
    return next;
  }

  resolve(value) {
    const onSuccess = this.onSuccess;
    if (onSuccess) {
      const next = onSuccess(value);
      if (next) {
        if (next.then) {
          next.then((value) => {
            this.next.resolve(value);
          });
        } else {
          this.next.resolve(next);
        }
      }
    }
  }
}

// Usage

const readFile = (filename) => {
  const thenable = new Thenable();
  fs.readFile(filename, "utf8", (err, data) => {
    if (err) throw err;
    thenable.resolve(data);
  });
  return thenable;
};

readFile("1-contract.js")
  .then((data) => {
    console.dir({ file1: data.length });
    return readFile("2-usage.js");
  })
  .then((data) => {
    console.dir({ file2: data.length });
    return readFile("3-class.js");
  })
  .then((data) => {
    console.dir({ file3: data.length });
    return "I will be printed by callback in the next then";
  })
  .then((data) => {
    console.dir({ text: data });
  })
  .then(() => {
    console.log("Will never printed");
  });
