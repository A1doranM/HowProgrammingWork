'use strict';

/**
 * FILE PURPOSE: Operations Registry with Undo Support
 *
 * This file combines the best of both worlds:
 * - Operations registry from 4-operations.js
 * - Undo support from 2-undo.js
 *
 * FEATURES:
 * ✅ Commands as data (serializable)
 * ✅ Operations as registry (centralized)
 * ✅ Execute AND undo in registry
 * ✅ Account lookup via registry
 *
 * PATTERN: Strategy Pattern + Command Pattern + Registry
 *
 * IMPROVEMENTS vs 4-operations.js:
 * ✅ Added undo() to each operation
 * ✅ Bank.undo() leverages operation registry
 * ✅ Helper method BankAccount.find()
 *
 * COMPARISON TO 2-undo.js:
 * Same functionality, different organization:
 * - 2-undo.js: OOP (command classes)
 * - 5-undo.js: Functional (registry)
 *
 * Both are valid - choose based on team preference and use case.
 */

/**
 * Command as Data (same as 4-operations.js)
 *
 * Plain data object representing an operation.
 * No methods - behavior is in OPERATIONS registry.
 */
class AccountCommand {
  constructor(operation, account, amount) {
    this.operation = operation;  // Operation type (string key)
    this.account = account;       // Account name (string key)
    this.amount = amount;          // Operation parameter
  }
}

/**
 * Receiver with Static Registry
 *
 * NEW: Static find() helper method
 * Provides clean API for account lookup.
 *
 * IMPROVEMENT:
 * Instead of: BankAccount.accounts.get(name)
 * Use: BankAccount.find(name)
 *
 * More semantic and easier to understand.
 */
class BankAccount {
  /**
   * Global account registry (same as 4-operations.js)
   */
  static accounts = new Map();

  /**
   * Create and register account
   */
  constructor(name) {
    this.name = name;
    this.balance = 0;
    BankAccount.accounts.set(name, this);
  }

  /**
   * Helper: Find account by name
   *
   * @param {string} name - Account name to lookup
   * @returns {BankAccount | undefined} - Account if found
   *
   * BENEFIT:
   * Cleaner than: BankAccount.accounts.get(name)
   * More intention-revealing: find() vs get()
   */
  static find(name) {
    return BankAccount.accounts.get(name);
  }
}

/**
 * Operations Registry with Execute AND Undo
 *
 * KEY CHANGE vs 4-operations.js:
 * Each operation is now an OBJECT with TWO functions:
 * - execute: Performs the operation
 * - undo: Reverses the operation
 *
 * STRUCTURE:
 * {
 *   withdraw: {
 *     execute: Function,
 *     undo: Function
 *   },
 *   income: {
 *     execute: Function,
 *     undo: Function
 *   }
 * }
 *
 * PATTERN: Strategy Objects
 * Each operation is a strategy with execute/undo methods.
 *
 * BENEFITS:
 * ✅ Grouped behavior (execute + undo together)
 * ✅ Symmetry (each operation has inverse)
 * ✅ Extensible (add new operations with both methods)
 * ✅ Consistent interface (all operations have same structure)
 */
const OPERATIONS = {
  /**
   * Withdraw Operation
   *
   * Object with execute and undo functions.
   * Notice the symmetry: execute subtracts, undo adds.
   */
  withdraw: {
    /**
     * Execute withdrawal
     *
     * @param {Object} command - Command data
     *
     * PROCESS:
     * 1. Find account by name
     * 2. Subtract amount from balance
     *
     * SAME LOGIC as Withdraw.execute() from 2-undo.js,
     * just as a function instead of a method.
     */
    execute: (command) => {
      const account = BankAccount.find(command.account);
      account.balance -= command.amount;
    },
    
    /**
     * Undo withdrawal (add money back)
     *
     * @param {Object} command - Command data
     *
     * REVERSAL:
     * Opposite of execute: adds instead of subtracts
     *
     * STATE CHANGE:
     * balance: X - amount → X (restored)
     */
    undo: (command) => {
      const account = BankAccount.find(command.account);
      account.balance += command.amount;  // Inverse operation
    },
  },
  
  /**
   * Income Operation
   *
   * Object with execute and undo functions.
   * Notice the symmetry: execute adds, undo subtracts.
   */
  income: {
    /**
     * Execute income
     *
     * @param {Object} command - Command data
     *
     * PROCESS:
     * 1. Find account by name
     * 2. Add amount to balance
     */
    execute: (command) => {
      const account = BankAccount.find(command.account);
      account.balance += command.amount;
    },
    
    /**
     * Undo income (subtract money back)
     *
     * @param {Object} command - Command data
     *
     * REVERSAL:
     * Opposite of execute: subtracts instead of adds
     *
     * STATE CHANGE:
     * balance: X + amount → X (restored)
     */
    undo: (command) => {
      const account = BankAccount.find(command.account);
      account.balance -= command.amount;  // Inverse operation
    },
  },
};

/**
 * Invoker: Bank with Registry-based Undo
 *
 * Uses operations registry for both execute and undo.
 *
 * EXECUTION FLOW:
 * 1. Create command (data)
 * 2. Lookup operation in registry
 * 3. Store command
 * 4. Execute via registry
 *
 * UNDO FLOW:
 * 1. Pop command from history
 * 2. Lookup operation in registry
 * 3. Call undo via registry
 */
class Bank {
  constructor() {
    this.commands = [];  // Command history / undo stack
  }

  /**
   * Execute operation via registry
   *
   * KEY TECHNIQUE: Destructuring from registry
   *   const { execute } = OPERATIONS[operation];
   *
   * This extracts the execute function from the operation object.
   * Then execute(command) calls it.
   *
   * EXECUTION FLOW:
   *
   * operation(account1, -100)
   *   → operation = 'withdraw'
   *   → { execute } = OPERATIONS.withdraw
   *   → execute = (command) => { ... }
   *   → command = { operation: 'withdraw', account: 'Marcus', amount: 100 }
   *   → execute(command) → account.balance -= 100
   *
   * @param {BankAccount} account - Account to operate on
   * @param {number} value - Amount (positive = income, negative = withdraw)
   */
  operation(account, value) {
    // Determine operation type
    const operation = value < 0 ? 'withdraw' : 'income';
    
    // Extract execute function from registry
    const { execute } = OPERATIONS[operation];
    
    // Prepare command data
    const amount = Math.abs(value);
    const { name } = account;
    const command = new AccountCommand(operation, name, amount);
    
    // Store command (for undo and history)
    this.commands.push(command);
    
    // Execute via registry
    execute(command);
  }

  /**
   * Undo operations via registry
   *
   * KEY TECHNIQUE: Dynamic undo lookup
   *   const { undo } = OPERATIONS[operation];
   *
   * Each command knows its operation type.
   * Registry provides corresponding undo function.
   *
   * @param {number} count - Number of operations to undo
   *
   * UNDO PROCESS:
   *
   * For undo(2) with history [cmd1, cmd2, cmd3]:
   *
   * 1. Pop cmd3
   *    operation = cmd3.operation (e.g., 'income')
   *    undo = OPERATIONS.income.undo
   *    undo(cmd3) → account.balance -= cmd3.amount
   *
   * 2. Pop cmd2
   *    operation = cmd2.operation (e.g., 'withdraw')
   *    undo = OPERATIONS.withdraw.undo
   *    undo(cmd2) → account.balance += cmd2.amount
   *
   * RESULT: Last 2 operations reversed in LIFO order
   *
   * PATTERN BENEFIT:
   * Don't need to know command type to undo it.
   * Command's operation field + registry provides undo function.
   */
  undo(count) {
    for (let i = 0; i < count; i++) {
      // Pop command from stack (LIFO)
      const command = this.commands.pop();
      
      // Get operation type from command
      const { operation } = command;
      
      // Lookup undo function in registry
      const { undo } = OPERATIONS[operation];
      
      // Execute undo
      undo(command);
    }
  }

  /**
   * Display operations (same as before)
   */
  showOperations() {
    console.table(this.commands);
  }
}

// ===========================
// Usage: Execute and Undo
// ===========================

const bank = new Bank();

/**
 * Account 1 operations
 */
const account1 = new BankAccount('Marcus Aurelius');
bank.operation(account1, 1000);   // Income: 0 → 1000
bank.operation(account1, -50);    // Withdraw: 1000 → 950

/**
 * Account 2 operations
 */
const account2 = new BankAccount('Antoninus Pius');
bank.operation(account2, 500);    // Income: 0 → 500
bank.operation(account2, -100);   // Withdraw: 500 → 400
bank.operation(account2, 150);    // Income: 400 → 550

/**
 * Show state before undo
 *
 * Commands: 5 total
 * account1.balance = 950
 * account2.balance = 550
 */
bank.showOperations();
console.table([account1, account2]);

/**
 * Undo last 2 operations
 *
 * UNDO EXECUTION:
 *
 * Command stack: [Income(Marcus,1000), Withdraw(Marcus,50), Income(Antoninus,500),
 *                 Withdraw(Antoninus,100), Income(Antoninus,150)]
 *                                                                  ↑
 *                                                            Last operation
 *
 * undo(2):
 *
 * 1. Pop Income(Antoninus, 150)
 *    operation = 'income'
 *    undo = OPERATIONS.income.undo
 *    undo(command) → account2.balance -= 150
 *    Balance: 550 - 150 = 400
 *
 * 2. Pop Withdraw(Antoninus, 100)
 *    operation = 'withdraw'
 *    undo = OPERATIONS.withdraw.undo
 *    undo(command) → account2.balance += 100
 *    Balance: 400 + 100 = 500
 *
 * RESULT: account2 restored to state before last 2 operations
 */
bank.undo(2);

/**
 * Show state after undo
 *
 * Commands: 3 total (2 removed)
 * account1.balance = 950 (unchanged)
 * account2.balance = 500 (back to state after operation 3)
 */
bank.showOperations();
console.table([account1, account2]);

/**
 * REGISTRY-BASED UNDO PATTERN:
 *
 * KEY INSIGHT:
 * Operations registry provides BOTH execute and undo functions.
 * Commands are just data that references the operation.
 *
 * EXECUTION:
 * command = { operation: 'withdraw', ... }
 * OPERATIONS[command.operation].execute(command)
 *
 * UNDO:
 * OPERATIONS[command.operation].undo(command)
 *
 * BENEFITS:
 *
 * 1. CENTRALIZED:
 *    All operation logic in one place (OPERATIONS object)
 *
 * 2. CONSISTENT:
 *    Every operation has execute + undo
 *    Enforced by object structure
 *
 * 3. EXTENSIBLE:
 *    Add new operation:
 *      OPERATIONS.transfer = {
 *        execute: (cmd) => { ... },
 *        undo: (cmd) => { ... }
 *      };
 *
 * 4. SERIALIZABLE:
 *    Commands are plain objects
 *    Can be stored in database or sent over network
 *
 * 5. TESTABLE:
 *    Easy to test operations:
 *      const cmd = { operation: 'withdraw', account: 'Test', amount: 100 };
 *      OPERATIONS.withdraw.execute(cmd);
 *      expect(account.balance).toBe(900);
 *      OPERATIONS.withdraw.undo(cmd);
 *      expect(account.balance).toBe(1000);
 */

/**
 * COMPARING APPROACHES:
 *
 * OOP (2-undo.js):
 *
 *   class Withdraw extends Command {
 *     execute() { this.account.balance -= this.amount; }
 *     undo() { this.account.balance += this.amount; }
 *   }
 *
 *   const cmd = new Withdraw(account, 100);
 *   cmd.execute();
 *   cmd.undo();
 *
 * Registry (this file):
 *
 *   const OPERATIONS = {
 *     withdraw: {
 *       execute: (cmd) => { account.balance -= cmd.amount; },
 *       undo: (cmd) => { account.balance += cmd.amount; }
 *     }
 *   };
 *
 *   const cmd = { operation: 'withdraw', account: 'Marcus', amount: 100 };
 *   OPERATIONS[cmd.operation].execute(cmd);
 *   OPERATIONS[cmd.operation].undo(cmd);
 *
 * SAME FUNCTIONALITY, DIFFERENT STYLE!
 */

/**
 * WHEN TO USE REGISTRY APPROACH:
 *
 * ✅ Need command serialization (save to DB, send over network)
 * ✅ Operations are data-driven (loaded from config)
 * ✅ Many similar operations (CRUD operations)
 * ✅ Functional programming preference
 * ✅ Dynamic operation loading (plugins)
 * ✅ Commands as events (event sourcing)
 *
 * WHEN TO USE OOP APPROACH:
 *
 * ✅ Complex commands with state
 * ✅ Need inheritance hierarchy
 * ✅ Type safety important (TypeScript)
 * ✅ Traditional OOP team
 * ✅ Commands have complex lifecycle
 */

/**
 * ADVANCED REGISTRY PATTERNS:
 *
 * 1. VALIDATION IN REGISTRY:
 */
/*
const OPERATIONS = {
  withdraw: {
    validate: (cmd) => {
      const acc = BankAccount.find(cmd.account);
      return acc.balance >= cmd.amount;
    },
    execute: (cmd) => { ... },
    undo: (cmd) => { ... }
  }
};
*/

/**
 * 2. COMPENSATION (instead of undo):
 */
/*
const OPERATIONS = {
  withdraw: {
    execute: (cmd) => { ... },
    compensate: (cmd) => {
      // Create compensating command
      return { operation: 'income', account: cmd.account, amount: cmd.amount };
    }
  }
};
*/

/**
 * 3. ASYNC OPERATIONS:
 */
/*
const OPERATIONS = {
  withdraw: {
    execute: async (cmd) => {
      await database.update(cmd.account, -cmd.amount);
    },
    undo: async (cmd) => {
      await database.update(cmd.account, +cmd.amount);
    }
  }
};
*/

/**
 * 4. OPERATION METADATA:
 */
/*
const OPERATIONS = {
  withdraw: {
    execute: (cmd) => { ... },
    undo: (cmd) => { ... },
    description: 'Withdraw money from account',
    requiredPermissions: ['WITHDRAW'],
    auditLevel: 'HIGH'
  }
};
*/

/**
 * KEY TAKEAWAYS:
 *
 * 1. REGISTRY PATTERN: Centralize operations in object
 * 2. STRATEGY OBJECTS: Each operation has execute + undo
 * 3. DATA COMMANDS: Commands are plain objects
 * 4. DYNAMIC DISPATCH: OPERATIONS[cmd.operation].execute(cmd)
 * 5. EXTENSIBLE: Easy to add new operations
 * 6. SERIALIZABLE: Commands can be saved/transmitted
 * 7. FUNCTIONAL: Stateless functions, no classes needed
 *
 * COMPARISON TO NEXT FILE:
 * 6-js-way.js will show the most JavaScript-idiomatic version,
 * further simplifying this approach.
 *
 * PATTERN EVOLUTION:
 * 1-execute.js:   OOP commands with execute()
 * 2-undo.js:      OOP commands with execute() + undo()
 * 3-anemic.js:    ⚠️ Anti-pattern (no behavior)
 * 4-operations.js: Registry + validation
 * 5-undo.js:      Registry + execute + undo
 * 6-js-way.js:    Fully functional JavaScript approach
 */
