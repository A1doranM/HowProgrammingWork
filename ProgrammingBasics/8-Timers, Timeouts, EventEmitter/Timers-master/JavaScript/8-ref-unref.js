"use strict";

const timer = setTimeout(() => {}, 10000);

console.dir(timer);

if (process.argv[2] === "--unref") timer.unref(); // Позволяет удалить ссылку на таймер, тоесть таймер запланируется
console.dir(timer);                               // но если никто не будет удерживать приложение то оно заверщится
                                                  // несмотря на незавершенные таймеры.

if (process.argv[3] === "--ref") timer.ref(); // Наоборот добавляет ссылку таймеру у которого вызвали unref делая из него
console.dir(timer);                           // нормальный таймер
