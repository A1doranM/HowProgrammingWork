'use strict';

class AccountCommand {
  constructor(operation, account, amount) {
    this.operation = operation;
    this.account = account;
    this.amount = amount;
  }
}

class BankAccount {
  static accounts = new Map();

  constructor(name) {
    this.name = name;
    this.balance = 0;
    BankAccount.accounts.set(name, this);
  }

  static find(name) {
    return BankAccount.accounts.get(name);
  }
}

const OPERATIONS = {
  withdraw: {
    execute: (command) => {
      const account = BankAccount.find(command.account);
      account.balance -= command.amount;
    },
    undo: (command) => {
      const account = BankAccount.find(command.account);
      account.balance += command.amount;
    },
  },
  income: {
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

  operation(account, value) {
    const operation = value < 0 ? 'withdraw' : 'income';
    const { execute } = OPERATIONS[operation];
    const amount = Math.abs(value);
    const { name } = account;
    const command = new AccountCommand(operation, name, amount);
    this.commands.push(command);
    execute(command);
  }

  undo(count) {
    for (let i = 0; i < count; i++) {
      const command = this.commands.pop();
      const { operation } = command;
      const { undo } = OPERATIONS[operation];
      undo(command);
    }
  }

  showOperations() {
    console.table(this.commands);
  }
}

// Usage

const bank = new Bank();
const account1 = new BankAccount('Marcus Aurelius');
bank.operation(account1, 1000);
bank.operation(account1, -50);
const account2 = new BankAccount('Antoninus Pius');
bank.operation(account2, 500);
bank.operation(account2, -100);
bank.operation(account2, 150);
bank.showOperations();
console.table([account1, account2]);
bank.undo(2);
bank.showOperations();
console.table([account1, account2]);
