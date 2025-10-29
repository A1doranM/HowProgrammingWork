'use strict';

const accounts = new Map();

const addAccount = (name) => {
  const account = { name, balance: 0 };
  accounts.set(name, account);
  return account;
};

const OPERATIONS = {
  withdraw: {
    execute: (command) => {
      const account = accounts.get(command.account);
      account.balance -= command.amount;
    },
    undo: (command) => {
      const account = accounts.get(command.account);
      account.balance += command.amount;
    },
  },
  income: {
    execute: (command) => {
      const account = accounts.get(command.account);
      account.balance += command.amount;
    },
    undo: (command) => {
      const account = accounts.get(command.account);
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
    const command = { operation, account: name, amount };
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
const account1 = addAccount('Marcus Aurelius');
bank.operation(account1, 1000);
bank.operation(account1, -50);
const account2 = addAccount('Antoninus Pius');
bank.operation(account2, 500);
bank.operation(account2, -100);
bank.operation(account2, 150);
bank.showOperations();
console.table([account1, account2]);
bank.undo(2);
bank.showOperations();
console.table([account1, account2]);
