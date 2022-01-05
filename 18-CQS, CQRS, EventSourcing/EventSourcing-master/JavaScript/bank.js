"use strict";

// Пример почти как в предидущих лекциях но теперь мы компоненты разнесли по файлам
// как это делается на реальных проектах.

// Вся бизнесс логика сосредоточена в файле банк.
// Раньше у него была коллекция всех аккаунтов, что было не правильно.
class BankAccount {
  constructor(name) {
    this.name = name;
    this.balance = 0;
  }
}

// Список операций. Теперь во все комманды передается дополнительно инстанс банка к которому они относятся.
const operations = {
  Create: (command, bank) => {
    const account = bank.find(command.account);
    if (!account) bank.createAccount(command.account); // Берем инстанс банка и вызываем у него метод.
  },
  Withdraw: (command, bank) => {
    const account = bank.find(command.account);
    account.balance -= command.amount;
  },
  Income: (command, bank) => {
    const account = bank.find(command.account);
    account.balance += command.amount;
  },
};

class Bank {
  constructor() {
    this.accounts = new Map();
  }

  createAccount(name) {
    const account = new BankAccount(name);
    this.accounts.set(name, account);
  }

  find(name) {
    return this.accounts.get(name);
  }

  execute(command) {
    const operation = operations[command.operation];
    operation(command, this);
    console.dir(command);
  }
}

module.exports = { Bank };
