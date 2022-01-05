"use strict";

const { Bank } = require("./bank.js");

class AccountQuery {
  constructor(account, operation) {
    this.account = account;
    this.operation = operation;
    this.rows = 0;
  }
}

// АПИ для чтения.
class BankRead {
  constructor(eventBus) {
    this.bank = new Bank(); // Экземпляр банка.
    this.commands = []; // История команд.
    this.queries = []; // История запросов.
    eventBus.on("command", command => { // Подписываемся на ивент вызова команды.
      this.commands.push(command);
      this.bank.execute(command); // Наша копия банка исполнит команду. Таким образов все команды которые исполняются
                                  // в АПИ для чтения будут вызываться и у нас. А значит мы будем хранить всю историю и состояния у себя.
                                  // создав несколько таких АПИ мы сможем распаралелить нагрузку на чтение, обращаясь к разным read API.
    });
  }

  select({ account, operation }) {
    const query = new AccountQuery(account, operation); // Создаем экземпляр запроса.
    this.queries.push(query); // Добавляем в историю.
    const result = [];
    for (const command of this.commands) { // Проходимся по всем командам.
      let condition = true;
      if (account) condition = command.account === account; // Если в запросе есть поле аккаунт то тогда проверям аккаунт равен, или нет.
      if (operation) condition = condition && command.operation === operation; // Проверяем есть ли операция.
      if (condition) result.push(command); // Добавляем команду в результат.
    }
    query.rows = result.length;
    console.dir(query);
    return result;
  }

  getAccount(name) {
    return this.bank.find(name);
  }
}

module.exports = { BankRead };
