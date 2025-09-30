"use strict";

const threads = require("worker_threads");
const { Worker } = threads;

const getInheritance = (instance, parents = []) => {
  const parent = Object.getPrototypeOf(instance); // Берем прототип от нашего текущего инстанса.
  if (!parent) return parents; // Если есть родитель
  parents.push(parent.constructor.name); // добавляем его конструктор в массив чтобы собрать всех родителей воркера.
  return getInheritance(parent, parents);
};

// Проверяем в каком потоке мы находимся.
if (threads.isMainThread) { // Если главный поток.
  console.dir({ master: threads });
  const workerData = { text: "Data from Master to Worker" };
  const worker = new Worker(__filename, { workerData }); // Запускаем нового воркера. И передаем ему данные.
  worker.on("message", (...args) => { // Воркер является наследником EventEmitter и поэтому мы можем подписываться на события.
    console.log({ args });
  });
  worker.on("error", (err) => {
    console.log(err.stack);
  });
  worker.on("exit", (code) => {
    console.dir({ code });
  });
  console.dir(getInheritance(worker));
} else { // Будет исполняться в воркере.
  console.dir({ worker: threads });
  threads.parentPort.postMessage("Hello there!"); // Отправляем сообщения воркерам.
  setTimeout(() => {
    const data = { text: "Message from Worker to Master" };
    threads.parentPort.postMessage(data);
  }, 1000);
}
