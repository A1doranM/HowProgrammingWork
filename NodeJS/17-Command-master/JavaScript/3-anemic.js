"use strict";

// Более правильный вариант

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

  operation(account, amount) {
    const operation = amount < 0 ? "Withdraw" : "Income";
    const command = new AccountCommand( // В операцию сохраняем не ссылку на объект, а ее название.
      operation, account.name, Math.abs(amount)
    );
    this.commands.push(command); // Добавляем комманду в список.
    account.balance += amount;  // Изменяем баланс.
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
