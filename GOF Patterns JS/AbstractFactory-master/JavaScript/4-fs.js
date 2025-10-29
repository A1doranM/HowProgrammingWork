'use strict';

const fs = require('node:fs');
const readline = require('node:readline');

class FileLineCursor {
  constructor(fileStorage, query) {
    this.query = query;
    this.lines = readline
      .createInterface({
        input: fileStorage.fileStream,
        crlfDelay: Infinity,
      })
      [Symbol.asyncIterator]();
  }

  [Symbol.asyncIterator]() {
    const cursor = this;
    return {
      async next() {
        do {
          const { value, done } = await cursor.lines.next();
          if (done) return { done: true };
          cursor.current++;
          const data = JSON.parse(value);
          let condition = true;
          const { query } = cursor;
          for (const field in query) {
            condition = condition && data[field] === query[field];
          }
          if (condition) return { value: data, done: false };
        } while (true);
      },
    };
  }
}

class FileStorage {
  constructor(fileName) {
    this.fileName = fileName;
    this.fileStream = fs.createReadStream(fileName);
  }

  select(query) {
    return new FileLineCursor(this, query);
  }
}

const createDatabase = (...args) => new FileStorage(...args);
const createCursor = (...args) => new FileLineCursor(...args);

module.exports = { createDatabase, createCursor };
