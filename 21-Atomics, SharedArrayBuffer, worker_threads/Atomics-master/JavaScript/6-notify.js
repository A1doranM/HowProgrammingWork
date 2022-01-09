"use strict";

const threads = require("worker_threads");
const { Worker } = threads;

// Atomics.notify(typedArray, index, count)

if (threads.isMainThread) {
  const buffer = new SharedArrayBuffer(40); // В мастер-процессе сделаем шаред буффер на 40 байтов.
  new Worker(__filename, { workerData: buffer }); // Передаем воркерам буффер.
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else { // Выполняется внутри треда.
  const { threadId, workerData } = threads;
  const array = new Int32Array(workerData);
  if (threadId === 1) { // Если тред первый.
    setTimeout(() => { // Отложим выполнение на 1 секунду.
      Atomics.store(array, 5, 100); // Сохраняем значение
      Atomics.notify(array, 5, 1); // и шлем нотификацию одному треду.
    }, 1000);
  } else { // Все остальные треды будут ждать.
    const res = Atomics.wait(array, 5, 0);
    console.dir({ res });
  }
}

// Но код на самом деле не работает так как 2 и 3 потоки ждут, а первый уведомляет только первый поток. В то время как второй и третий зависли в ожидании.
