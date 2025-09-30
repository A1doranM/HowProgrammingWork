"use strict";

// Command Query Responsibility Segregation - это когда мы CQS принцип поднимаем до модулей системы.
// Одна подсистема занимается записью, другая чтением.

// Паттерн команда - пишем три поля для изменения.
class AccountCommand {
  constructor(account, operation, amount) {
    this.operation = operation;
    this.account = account;
    this.amount = amount;
  }
}

// Паттерн QueryObject - пишем три поля для чтения.
class AccountQuery {
  constructor(account, operation) {
    this.account = account; // Аккаунт
    this.operation = operation; // операция
    this.rows = 0; // количество возвращенных строк
  }
}

class BankAccount {
  constructor(name) {
    this.name = name;
    this.balance = 0;
    BankAccount.collection.set(name, this);
  }

  static find(name) { // Метод для поиска в банке.
    return BankAccount.collection.get(name);
  }
}

BankAccount.collection = new Map();

const operations = { // Операции.
  Withdraw: (command) => {
    const account = BankAccount.find(command.account);
    account.balance -= command.amount;
  },
  Income: (command) => {
    const account = BankAccount.find(command.account);
    account.balance += command.amount;
  },
};

class Bank {
  constructor() {
    this.commands = []; // Коллекция команд.
    this.queries = []; // Коллекция запросов.
  }

  operation(account, amount) {
    const operation = amount < 0 ? "Withdraw" : "Income";
    const execute = operations[operation];
    const command = new AccountCommand(
      account.name, operation, Math.abs(amount)
    );
    this.commands.push(command);
    console.dir(command);
    execute(command);
  }

  select({ account, operation }) {
    const query = new AccountQuery(account, operation);
    this.queries.push(query);
    const result = [];
    for (const command of this.commands) {
      let condition = true;
      if (account) condition = command.account === account;
      if (operation) condition = condition && command.operation === operation;
      if (condition) result.push(command);
    }
    query.rows = result.length;
    console.dir(query);
    return result;
  }
}

// Usage

const bank = new Bank();
const account1 = new BankAccount("Marcus Aurelius");
bank.operation(account1, 1000);
bank.operation(account1, -50);
const account2 = new BankAccount("Antoninus Pius");
bank.operation(account2, 500);
bank.operation(account2, -100);
bank.operation(account2, 150);
console.table([account1, account2]);

const res1 = bank.select({ account: "Marcus Aurelius" }); // Выбираем все аккаунты по этому имени.
console.table(res1);

const res2 = bank.select({ account: "Antoninus Pius", operation: "Income" });
console.table(res2);

const res3 = bank.select({ operation: "Withdraw" }); // Выбираем все операции списания средств.
console.table(res3);

console.log("Query logs:");
console.table(bank.queries);
