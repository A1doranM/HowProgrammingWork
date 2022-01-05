"use strict";

// Подгружаем общую зависимость. Но никаких общих структур данных мы между ридером и врайтером не шарим.
const { Bank } = require("./bank.js");

class AccountCommand {
  constructor(account, operation, amount = 0) {
    this.operation = operation;
    this.account = account;
    this.amount = amount;
  }
}

// АПИ для записи.
class BankWrite {
  constructor(eventBus) {
    this.bank = new Bank(); // У него есть ссылка на банк.
    this.commands = []; // История команд.
    this.eventBus = eventBus; // Ссылка на шину событий.
  }

  createAccount(account) {
    const operation = "Create"; // Операция всегда create.
    const command = new AccountCommand(account, operation);
    this.commands.push(command);
    this.eventBus.emit("command", command);
    this.bank.execute(command);
  }

  operation(account, amount) { // В зависимости от переданного числа выполняем начисление, или списание средств.
    const operation = amount < 0 ? "Withdraw" : "Income";
    const command = new AccountCommand(account, operation, Math.abs(amount)); // Мы не храним отрицательное число, вместо этого в отдельном поле (operation) хранится что за операция была произведена.
    this.commands.push(command);
    this.eventBus.emit("command", command);
    this.bank.execute(command); // Запускаем выполнение команды.
  }
}

module.exports = { BankWrite };
