"use strict";

// Backpressure -

const fs = require("node:fs");

// Специально устанавливаем размер количество объектов для чтения прилично больше того который можем записать
const readable = fs.createReadStream("./data.tmp", { highWaterMark: 12345 });
const writable = fs.createWriteStream("./copy.tmp", { highWaterMark: 5000 });

// Вызовем перегрузку стрима
readable.on("data", (chunk) => {
  console.log(`Write: ${chunk.length} bytes`);

  // The return value is true if the internal buffer is less than the
  // highWaterMark configured when the stream was created after admitting chunk.
  // If false is returned, further attempts to write data to the stream should
  // stop until the 'drain' event is emitted.

  // Если мы не можем успеть за одни раз записать данные то метод вернет false
  // и вызовет событие drain. В котором мы можем остановить чтение чтобы данные
  // не накапливались в очереди, и не занимали память, например если запись очень
  // медленная, а чтение быстрое при большом объеме данных мы можем забить ими всю
  // память.
  const canWrite = writable.write(chunk);
  if (!canWrite) {
    console.log("Pause reabable due to backpressure");
    readable.pause(); // в таком случае тормозим чтение.
  }
});

// If a call to stream.write(chunk) returns false, the 'drain' event will
// be emitted when it is appropriate to resume writing data to the stream.

// При прерывании записи и здесь мы должны решить когда стоит продолжить чтение данных
writable.on("drain", () => {
  console.log("Event drain: resume readable");
  readable.resume(); // Запускаем чтение.
});

readable.on("end", () => { // - если чтение закончилось закончить и запись
  writable.end();
});

writable.on("finish", () => {
  console.log("Done");
});
