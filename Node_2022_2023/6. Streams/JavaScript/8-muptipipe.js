"use strict";

const fs = require("node:fs");
const stream  = require("node:stream");

const text = "Hello World!\n";
const options = { encoding: "utf8" };
const readable = stream.Readable.from(text, options);
const writable = fs.createWriteStream("stdout.tmp");

readable.pipe(process.stdout); // Шлем данные из стрима на чтение в поток вывода данных
readable.pipe(process.stdout);
readable.pipe(writable); // и в стрим для записи.
