"use strict";

const cp = require("child_process");

const actors = new Map();

// Мастер хранит в себе все акторы и если какой-то актор присылает мастеру сообщение
// то мастер найдет актора которому оно предназначено и перешлет его ему.

class MasterSystem {
  static start(name, count = 1) {
    if (!actors.has(name)) { // Если нет актора с таким именем.
      const ready = []; // Создаем массив всех свободных акторов,
      const instances = []; // массив вообще всех акторов,
      const queue = []; // очередь задач
      actors.set(name, { ready, instances, queue }); //
    }
    const { ready, instances } = actors.get(name);
    for (let i = 0; i < count; i++) {
      const actor = cp.fork("./system.js"); // Форкаем процесс создавая нового актора.
      MasterSystem.subscribe(actor); // Подписываемся.
      ready.push(actor);
      instances.push(actor);
      actor.send({ command: "start", name }); // Отправляю процессу сообщение с командой старт и имя с которым ему надо будет взять актора из папки actors.
    }
  }

  static stop(name) { // Останавливаем всех акторов с заданным именем.
    const record = actors.get(name);
    if (record) {
      const { instances } = record;
      for (const actor of instances) {
        actor.send({ command: "stop" });
      }
    }
  }

  static send(name, data) {
    const record = actors.get(name);
    if (record) {
      const { ready, queue } = record;
      const actor = ready.shift(); // Забираем актора из списка свободных.
      if (!actor) { // Если такого нету.
        queue.push(data); // Добавляем сообщение в очередь.
        return;
      }
      actor.send({ command: "message", data }); // Иначе отсылаем сообщение.
    }
  }

  static subscribe(actor) {
    actor.on("message", (message) => {
      const { command, name } = message;
      if (command === "message") {
        const { data } = message;
        MasterSystem.send(name, data);
        return;
      }
      if (command === "start") {
        const { count } = message;
        MasterSystem.start(name, count);
        return;
      }
      if (command === "stop") {
        MasterSystem.stop(name);
        return;
      }
      if (command === "ready") { // Если актор присылает сообщение что он свободен
        const { pid } = message; // по идентификатору процесса находим актора.
        const record = actors.get(name); // Находим всех акторов с этим именем.
        if (record) {
          const { ready, instances, queue } = record;
          for (const actor of instances) {
            if (actor.pid === pid) ready.push(actor); // Находим актора с указанным пидом.
          }
          if (queue.length > 0) { // Если есть задачи на актора с этим именем
            const next = queue.shift();
            MasterSystem.send(name, next); // то топравляем задачу актору с таким именем.
          }
        }
      }
    });
  }
}

module.exports = MasterSystem;
