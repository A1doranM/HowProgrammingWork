"use strict";

// Пример посложнее с банковским аккаунтом.
// Все методы здесь это либо методы чтения, либо методы записи, но не то и то одновременно.
class BankAccount {
  constructor(name) {
    this.name = name;
    this.balance = 0;
  }

  getBalance() {
    return this.balance;
  }

  available(amount) {
    return this.balance >= amount;
  }

  withdraw(amount) {
    this.balance -= amount;
  }

  income(amount) {
    this.balance += amount;
  }
}

class Bank {
  constructor() {
    this.accounts = new Map();
  }

  // Позволяет перевести сумму из одного аккаунта в другой.
  transfer(from, to, amount) {
    const source = this.accounts.get(from);
    const destination = this.accounts.get(to);
    if (!source || !destination) return false;
    if (!source.available(amount)) return false;
    source.withdraw(amount);
    destination.income(amount);
    return true;
  }

  total() {
    let sum = 0;
    for (const account of this.accounts.values()) {
      const balance = account.getBalance();
      sum += balance;
    }
    return sum;
  }

  openAccount(name, amount = 0) {
    if (this.accounts.get(name)) return false;
    const account = new BankAccount(name);
    this.accounts.set(name, account);
    if (amount) account.income(amount);
    return true;
  }
}

// Usage

const bank = new Bank();
bank.openAccount("Marcus Aurelius");
bank.openAccount("Antoninus Pius", 1000);
const total1 = bank.total();
console.log("Total before transfer:", total1);
bank.transfer("Antoninus Pius", "Marcus Aurelius", 50);
const total2 = bank.total();
console.log("Total after transfer:", total2);
