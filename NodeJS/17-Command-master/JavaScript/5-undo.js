"use strict";

// Все как в примере выше но с возможнотью отката операции.

class AccountCommand {
  constructor(operation, account, amount) {
    this.operation = operation;
    this.account = account;
    this.amount = amount;
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

const operations = {
  Withdraw: {
    execute: (command) => {
      const account = BankAccount.find(command.account);
      account.balance -= command.amount;
    },
    undo: (command) => {
      const account = BankAccount.find(command.account);
      account.balance += command.amount;
    },
  },
  Income: {
    execute: (command) => {
      const account = BankAccount.find(command.account);
      account.balance += command.amount;
    },
    undo: (command) => {
      const account = BankAccount.find(command.account);
      account.balance -= command.amount;
    },
  },
};

class Bank {
  constructor() {
    this.commands = [];
  }

  operation(account, amount) {
    const operation = amount < 0 ? "Withdraw" : "Income";
    const { execute } = operations[operation];
    const command = new AccountCommand(
      operation, account.name, Math.abs(amount)
    );
    this.commands.push(command);
    execute(command);
  }

  undo(count) {
    for (let i = 0; i < count; i++) {
      const command = this.commands.pop();
      const { operation } = command;
      const { undo } = operations[operation];
      undo(command);
    }
  }

  showOperations() {
    console.table(this.commands);
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
bank.showOperations();
console.table([account1, account2]);
bank.undo(2);
bank.showOperations();
console.table([account1, account2]);
