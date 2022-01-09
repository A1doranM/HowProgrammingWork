"use strict";

class ActorSystem {
  static register(actor) { // Актор который запустился внутри воркера может вызвав этот метод сохранить себя в переменной ActorSystem.actor
    ActorSystem.actor = actor; // Здесь будет зранится ссылка на класс.
  }

  static start(name, count = 1) { // Сообщение о старте воркера.
    process.send({ command: "start", name, count });
  }

  static stop(name) {
    process.send({ command: "stop", name });
  }

  static send(name, data) {
    process.send({ command: "message", name, data });
  }
}

ActorSystem.actor = null;
ActorSystem.instance = null; // Здесь будет хранится ссылка на инстанс.

process.on("SIGINT", () => {});

process.on("message", (message) => {
  const { command } = message;
  if (command === "start") {
    const { name } = message;
    require(`./actors/${name.toLowerCase()}.js`); // Находим нужного актора.
    const ActorClass = ActorSystem.actor; // Актор у себя вызвал метод register благодаря которому мы забираем ссылку на его класс.
    ActorSystem.instance = new ActorClass(); // И создаем его инстанс.
    return;
  }
  if (command === "stop") {
    const { instance } = ActorSystem; // Берем инстанс из текущего процесса (текущего актора)
    if (instance) instance.exit(); // и вызываем метод exit.
    process.exit(0);
    return;
  }
  if (command === "message") {
    const { instance } = ActorSystem; // Берем инстанс актора.
    if (instance) {
      const { data } = message; // Если он есть забираем сообщение
      const { name } = ActorSystem.actor; // имя,
      instance.message(data); // посылаем сообщение.
      process.send({ command: "ready", name, pid: process.pid }); // Уведомляем мастера о том что мы свободны,
                                                                          // отсылаем ему дополнительно pid потому что акторов с одинаковым именем может быть несколько.
    }
  }
});

module.exports = ActorSystem;
