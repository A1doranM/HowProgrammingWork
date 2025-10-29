abstract class AccountCommand {
  public account: BankAccount;
  public amount: number;
  public operation: string;

  constructor(account: BankAccount, amount: number, operation: string) {
    this.account = account;
    this.amount = amount;
    this.operation = operation;
  }

  abstract execute(): void;
  abstract undo(): void;
}

class Withdraw extends AccountCommand {
  constructor(account: BankAccount, amount: number) {
    super(account, amount, 'withdraw');
  }

  execute(): void {
    this.account.balance -= this.amount;
  }

  undo(): void {
    this.account.balance += this.amount;
  }
}

class Income extends AccountCommand {
  constructor(account: BankAccount, amount: number) {
    super(account, amount, 'income');
  }

  execute(): void {
    this.account.balance += this.amount;
  }

  undo(): void {
    this.account.balance -= this.amount;
  }
}

class BankAccount {
  public name: string;
  public balance: number;

  constructor(name: string) {
    this.name = name;
    this.balance = 0;
  }
}

class Bank {
  private commands: AccountCommand[] = [];

  operation(account: BankAccount, value: number): void {
    const Command = value < 0 ? Withdraw : Income;
    const command = new Command(account, Math.abs(value));
    command.execute();
    this.commands.push(command);
  }

  undo(count: number): void {
    for (let i = 0; i < count; i++) {
      const command = this.commands.pop();
      if (command) {
        command.undo();
      }
    }
  }

  showOperations(): void {
    const output = this.commands.map((command) => ({
      operation: command.operation,
      account: command.account.name,
      amount: command.amount,
    }));
    console.table(output);
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
