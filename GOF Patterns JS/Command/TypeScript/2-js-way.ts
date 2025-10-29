type Account = {
  name: string;
  balance: number;
};

const accounts = new Map<string, Account>();

const addAccount = (name: string): Account => {
  const account: Account = { name, balance: 0 };
  accounts.set(name, account);
  return account;
};

type OperationType = 'withdraw' | 'income';

interface Command {
  operation: OperationType;
  account: string;
  amount: number;
}

interface Operation {
  execute: (command: Command) => void;
  undo: (command: Command) => void;
};

type Operations = Record<OperationType, Operation>;

const OPERATIONS: Operations = {
  withdraw: {
    execute: (command: Command): void => {
      const account = accounts.get(command.account);
      if (account) account.balance -= command.amount;
    },
    undo: (command: Command): void => {
      const account = accounts.get(command.account);
      if (account) account.balance += command.amount;
    },
  },
  income: {
    execute: (command: Command): void => {
      const account = accounts.get(command.account);
      if (account) account.balance += command.amount;
    },
    undo: (command: Command): void => {
      const account = accounts.get(command.account);
      if (account) account.balance -= command.amount;
    },
  },
};

class Bank {
  private commands: Array<Command> = [];

  operation(account: Account, value: number): void {
    const operation = value < 0 ? 'withdraw' : 'income';
    const { execute } = OPERATIONS[operation];
    const amount = Math.abs(value);
    const { name } = account;
    const command: Command = { operation, account: name, amount };
    this.commands.push(command);
    execute(command);
  }

  undo(count: number): void {
    for (let i = 0; i < count; i++) {
      const command = this.commands.pop();
      if (command) {
        const operation = command.operation as OperationType;
        const { undo } = OPERATIONS[operation];
        undo(command);
      }
    }
  }

  showOperations(): void {
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
