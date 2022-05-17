"use strict";

const { EventEmitter } = require("events");
const eventBus = new EventEmitter();

// Правильный CQRS, коммуникация между модулями происходит только через события.

// Команда - умеет менять.
class AccountCommand {
  constructor(account, operation, amount) {
    this.operation = operation;
    this.account = account;
    this.amount = amount;
  }
}

// Запрос - умеет читать.
class AccountQuery {
  constructor(account, operation) {
    this.account = account;
    this.operation = operation;
    this.rows = 0;
  }
}

class BankAccount {
  constructor(name) {
    this.name = name;
    this.balance = 0;
    BankAccount.collection.set(name, this);
  }

  static find(name) {
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

class BankWrite {
  constructor() {
    this.commands = []; // История команд.
  }

  operation(account, amount) {
    const operation = amount < 0 ? "Withdraw" : "Income";
    const execute = operations[operation];
    const command = new AccountCommand(
      account.name, operation, Math.abs(amount)
    );
    this.commands.push(command); // Добавляем команду в историю.
    eventBus.emit("command", command); // Генерируем событие.
    console.dir(command);
    execute(command);
  }
}

// Теперь мы можем создавать один банковский модуль на запись, и сколько угодно на чтение.
class BankRead {
  constructor() {
    this.commands = [];
    this.queries = []; // История запросов которой нету у BankWrite.
    eventBus.on("command", (command) => { // Подписываемся на шину и когда приходят команды сохраняем их себе.
      this.commands.push(command);
    });
  }

  select({ account, operation }) { // Выбирает все команды по заданным кретериям.
    const query = new AccountQuery(account, operation);
    this.queries.push(query);
    const result = [];
    for (const command of this.commands) {
      let condition = true;
      if (account) condition = command.account === account; // Если подошел аккаунт
      if (operation) condition = condition && command.operation === operation; // подошло название операции
      if (condition) result.push(command); // добавляем эту команду в результирующий массив.
    }
    query.rows = result.length;
    console.dir(query);
    return result;
  }
}

// Usage

const writeApi = new BankWrite(); // Один апи для записи.
// Создаем три разных АПИ для чтения.
// Можно разбить их по кластерам и таким образом распаралелить.
// Но здесь тоже не совсем все правильно так как у нас в банке есть статическая коллекция которая хранит все аккаунты.
// По правильному, в каждом запущенном read API модуле должна быть своя коллекция банк аккаунтов.
// А в модуле на запись мы должны сделать специальный месседж который будет отвечать за создание аккаунта.
// Создать команду которая будет отвечать за создание аккаунта.
// Тогда в ивент мы будем передавать два типа ивентов, создание аккаунта, и его изменение.
// Тоесть писать мы будем что-то вроде writeApi.createAccount();
// И тогда при запуске операций мы должны передавать дополнительно имя аккаунта.
// В общем суть, все вызовы которые что-то создают должны идти через write API и транслироваться через события, при этом
// все операции записываются в историю и у них хранится их таймстамп, для того чтобы можно было восстановить их порядок.
// А все вызовы которые что-то читают через read API.
// У операций надо
const readApi1 = new BankRead();
const readApi2 = new BankRead();
const readApi3 = new BankRead();

const account1 = new BankAccount("Marcus Aurelius");
writeApi.operation(account1, 1000);
writeApi.operation(account1, -50);
const account2 = new BankAccount("Antoninus Pius");
writeApi.operation(account2, 500);
writeApi.operation(account2, -100);
writeApi.operation(account2, 150);
console.table([account1, account2]);

const res1 = readApi1.select({ account: "Marcus Aurelius" });
console.table(res1);

const res2 = readApi2
  .select({ account: "Antoninus Pius", operation: "Income" });
console.table(res2);

const res3 = readApi3.select({ operation: "Withdraw" });
console.table(res3);

console.table(readApi3.queries);
