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
}

const OPERATIONS = {
  withdraw: (command) => {
    const account = BankAccount.accounts.get(command.account);
    account.balance -= command.amount;
  },
  income: (command) => {
    const account = BankAccount.accounts.get(command.account);
    account.balance += command.amount;
  },
  allowed: (command) => {
    if (command.operation === 'income') return true;
    const account = BankAccount.accounts.get(command.account);
    return account.balance >= command.amount;
  },
};

class Bank {
  constructor() {
    this.commands = [];
  }

  operation(account, value) {
    const operation = value < 0 ? 'withdraw' : 'income';
    const execute = OPERATIONS[operation];
    const amount = Math.abs(value);
    const { name } = account;
    const command = new AccountCommand(operation, name, amount);
    const check = OPERATIONS.allowed;
    const allowed = check(command);
    if (!allowed) {
      const target = BankAccount.accounts.get(command.account);
      const msg = [
        'Command is not allowed',
        'do ' + JSON.stringify(command),
        'on ' + JSON.stringify(target),
      ];
      throw new Error(msg.join('\n'));
    }
    this.commands.push(command);
    execute(command);
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
bank.operation(account2, -100); // -10000
bank.operation(account2, 150);
bank.showOperations();
console.table([account1, account2]);
