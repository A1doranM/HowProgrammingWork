"use strict";

// Импортируем библиотеку для работы с акторами.
const ActorSystem = require("../system");

// Актор в виде класса Рут.
ActorSystem.register(class Root {
  constructor() { // При старте выполняется конструктор.
    console.log("Start actor: Root");
    ActorSystem.start("Monitoring");
    ActorSystem.start("Renderer");
    ActorSystem.start("Mailer", 3); // Запускаем актора с именем, и указываем количество экземпляров.
                                                // Три штуки означает что в очереди на актора с именем мейлер будет три актора
                                                // когда приходит сообщение оно передается первому в очереди, после чего он из нее изымается
                                                // и когда освобождается то добавляется в ее конец.
  }

  async message() {}

  async exit() { // Событие на завершение.
    await ActorSystem.stop("Monitoring");
    await ActorSystem.stop("Renderer");
    await ActorSystem.stop("Mailer");
    console.log("Stop actor: Root");
  }
});
