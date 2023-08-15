"use strict";

// Пример с кастомной буферизацией для стрима.

const stream  = require("node:stream");

const ENTER = 13; // Код клавиши ентер

const createBufferedStream = () => {
  const buffers = []; // Наш буфер.
  const writable = new stream.Writable({
    write(chunk, encoding, next) {
      buffers.push(chunk); // При чтении сохраняем данные в буфер.
      next();
    },
    final(done) {
      const result = Buffer.concat(buffers); // В конце соединяем все буферы в один.
      this.emit("result", result);
      done();
    }
  });
  return writable;
};

const lines = createBufferedStream();

lines.on("result", (result) => {
  console.log({ result });
});

process.stdin.setRawMode(true);

// The writable.uncork() method flushes all data buffered since cork was called.
// When using writable.cork() and writable.uncork() to manage the buffering
// of writes to a stream, it is recommended that calls to writable.uncork()
// be deferred using process.nextTick(). Doing so allows batching of
// all writable.write() calls that occur within a given Node.js event loop
// phase.

//  stream.cork();
//  stream.write('some ');
//  stream.write('data ');
//  process.nextTick(() => stream.uncork());

// If the writable.cork() method is called multiple times on a stream, the
// same number of calls to writable.uncork() must be called to flush the
// buffered data.

//  stream.cork();
//  stream.write('some ');
//  stream.cork();
//  stream.write('data ');
//  process.nextTick(() => {
//    stream.uncork();
//    // The data will not be flushed until uncork() is called a second time.
//    stream.uncork();
//  });

// The writable.cork() method forces all written data to be buffered in memory.
// The buffered data will be flushed when either the uncork or end methods are
// called. The primary intent of writable.cork() is to accommodate a situation
// in which several small chunks are written to the stream in rapid succession.
// Instead of immediately forwarding them to the underlying destination,
// writable.cork()buffers all the chunks until writable.uncork() is called,
// which will pass them all to writable._writev(), if present. This prevents
// a head-of-line blocking situation where data is being buffered while
// waiting for the first small chunk to be processed. However, use of
// writable.cork() without implementingwritable._writev() may have an adverse
// effect on throughput.

process.stdin.on("data", (data) => {
  const key = data[0];

  // Буферизируем данные до тех пор пока не нажали Ентер
  if (key === ENTER) {
    lines.write(data); // записываем данные
    if (lines.writableCorked === 1) lines.uncork(); // говорим стриму очистить буфер
    lines.end(); // прекращаем запись
    process.exit(0); // и выходим.
  } else {
    if (lines.writableCorked === 0) lines.cork(); // начинаем писать в один буфер
    lines.write(data); // все входные данные.
  }
  process.stdout.write(data);
});
