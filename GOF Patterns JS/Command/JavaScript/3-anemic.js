'use strict';

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
  }
}

class Bank {
  constructor() {
    this.commands = [];
  }

  operation(account, value) {
    const operation = value < 0 ? 'withdraw' : 'income';
    const amount = Math.abs(value);
    const { name } = account;
    const command = new AccountCommand(operation, name, amount);
    this.commands.push(command);
    account.balance += amount;
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
