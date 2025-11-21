'use strict';

/**
 * FILE PURPOSE: JavaScript-Idiomatic Command Pattern
 *
 * This file demonstrates the most JavaScript-idiomatic implementation:
 * - NO command classes (just plain objects)
 * - NO receiver classes (just plain objects)
 * - Operations registry (same as 5-undo.js)
 * - Factory function for account creation
 * - Maximum simplicity with minimal boilerplate
 *
 * PHILOSOPHY: "JavaScript Way"
 * - Embrace plain objects over classes when possible
 * - Use functions over methods
 * - Prefer composition over inheritance
 * - Keep it simple and practical
 *
 * COMPARISON TO PREVIOUS FILES:
 *
 * 1-execute.js:  Classes everywhere (AccountCommand, Withdraw, Income, BankAccount)
 * 2-undo.js:     Same, with undo methods
 * 5-undo.js:     Operations registry + command class + account class
 * 6-js-way.js:   NO command class, NO account class, just objects!
 *
 * SAME FUNCTIONALITY:
 * - Execute operations ✅
 * - Undo operations ✅
 * - Command history ✅
 * - Operation logging ✅
 *
 * LESS CODE:
 * - No AccountCommand class
 * - No BankAccount class
 * - Just data and functions
 *
 * This is the "JavaScript way" - pragmatic and functional.
 */

/**
 * Global Account Registry
 *
 * Instead of BankAccount class with static Map,
 * just use a Map directly at module level.
 *
 * WHY NO CLASS?
 * In JavaScript, classes are just syntactic sugar.
 * For simple data structures, plain objects suffice.
 *
 * SIMPLIFICATION:
 * Before: BankAccount.accounts (static property on class)
 * Now:    accounts (module-level variable)
 *
 * SAME FUNCTIONALITY, LESS CODE!
 */
const accounts = new Map();

/**
 * Factory Function: Create Account
 *
 * Instead of class constructor, use factory function.
 *
 * FUNCTIONAL PATTERN:
 * - Function that creates and returns object
 * - No 'new' keyword needed
 * - No 'this' context issues
 * - More flexible than constructors
 *
 * @param {string} name - Account holder name
 * @returns {Object} - Account object { name, balance }
 *
 * OBJECT CREATION:
 * Instead of: new BankAccount('Marcus')
 * Use:        addAccount('Marcus')
 *
 * BENEFITS:
 * ✅ Clearer intent (addAccount vs new BankAccount)
 * ✅ Auto-registration (adds to registry)
 * ✅ Returns created object
 * ✅ No constructor complexity
 * ✅ Easy to add creation logic
 *
 * FUNCTIONAL CREATION PATTERN:
 * Factory functions are idiomatic in JavaScript.
 * Examples: React.createElement(), document.createElement()
 */
const addAccount = (name) => {
  // Create plain object (no class needed)
  const account = { name, balance: 0 };
  
  // Register in global map
  accounts.set(name, account);
  
  // Return created object
  return account;
};

/**
 * Operations Registry (same as 5-undo.js)
 *
 * This part is unchanged because it's already idiomatic JavaScript.
 * Functions in an object - doesn't get more JavaScript than this!
 *
 * STRUCTURE:
 * {
 *   operationName: {
 *     execute: (command) => void,
 *     undo: (command) => void
 *   }
 * }
 *
 * Each operation is a "strategy object" with execute/undo functions.
 */
const OPERATIONS = {
  /**
   * Withdraw operation
   *
   * Plain functions operating on plain objects.
   * No classes, no inheritance, just logic.
   */
  withdraw: {
    /**
     * Execute withdrawal
     *
     * @param {Object} command - {operation, account, amount}
     *
     * PURE FUNCTION characteristics:
     * - Deterministic (same input → same output)
     * - Side effect: Mutates account.balance (necessary side effect)
     */
    execute: (command) => {
      const account = accounts.get(command.account);
      account.balance -= command.amount;
    },
    
    /**
     * Undo withdrawal
     *
     * @param {Object} command - {operation, account, amount}
     *
     * INVERSE OPERATION:
     * Adds back what execute() subtracted
     */
    undo: (command) => {
      const account = accounts.get(command.account);
      account.balance += command.amount;
    },
  },
  
  /**
   * Income operation
   *
   * Same pattern as withdraw, opposite math
   */
  income: {
    /**
     * Execute income
     */
    execute: (command) => {
      const account = accounts.get(command.account);
      account.balance += command.amount;
    },
    
    /**
     * Undo income
     */
    undo: (command) => {
      const account = accounts.get(command.account);
      account.balance -= command.amount;
    },
  },
};

/**
 * Invoker: Bank
 *
 * Only class in this file (could also be plain object or factory function).
 * Kept as class because it has methods and state (commands array).
 *
 * MINIMAL CLASS:
 * - No complex inheritance
 * - Just manages command history
 * - Delegates to operations registry
 */
class Bank {
  constructor() {
    this.commands = [];  // Command history
  }

  /**
   * Execute operation
   *
   * KEY SIMPLIFICATION vs 5-undo.js:
   * Command is created as PLAIN OBJECT, not class instance!
   *
   * COMMAND CREATION:
   * Before (5-undo.js):
   *   const command = new AccountCommand(operation, name, amount);
   *
   * Now (this file):
   *   const command = { operation, account: name, amount };
   *
   * BENEFITS OF PLAIN OBJECT:
   * ✅ No class needed
   * ✅ Easily serializable: JSON.stringify(command)
   * ✅ Can send over network
   * ✅ Can store in database
   * ✅ Less memory overhead
   * ✅ Simpler to understand
   *
   * @param {Object} account - Account object (plain object, not class instance)
   * @param {number} value - Amount (positive/negative)
   */
  operation(account, value) {
    // Determine operation type
    const operation = value < 0 ? 'withdraw' : 'income';
    
    // Get execute function from registry
    const { execute } = OPERATIONS[operation];
    
    // Prepare parameters
    const amount = Math.abs(value);
    const { name } = account;
    
    // Create command as PLAIN OBJECT - KEY SIMPLIFICATION!
    const command = { operation, account: name, amount };
    
    // Store in history
    this.commands.push(command);
    
    // Execute via registry
    execute(command);
  }

  /**
   * Undo operations (same as 5-undo.js)
   *
   * @param {number} count - Number of operations to undo
   */
  undo(count) {
    for (let i = 0; i < count; i++) {
      const command = this.commands.pop();
      const { operation } = command;
      const { undo } = OPERATIONS[operation];
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
// Usage: The JavaScript Way
// ===========================

const bank = new Bank();

/**
 * Create accounts using factory function (not 'new' keyword)
 *
 * COMPARISON:
 *
 * Traditional OOP:
 *   const account1 = new BankAccount('Marcus Aurelius');
 *
 * JavaScript Way:
 *   const account1 = addAccount('Marcus Aurelius');
 *
 * RESULT IS THE SAME:
 * account1 = { name: 'Marcus Aurelius', balance: 0 }
 *
 * But factory function is more idiomatic and flexible.
 */
const account1 = addAccount('Marcus Aurelius');
bank.operation(account1, 1000);   // Income: 0 → 1000
bank.operation(account1, -50);    // Withdraw: 1000 → 950

const account2 = addAccount('Antoninus Pius');
bank.operation(account2, 500);    // Income: 0 → 500
bank.operation(account2, -100);   // Withdraw: 500 → 400
bank.operation(account2, 150);    // Income: 400 → 550

/**
 * Show operations and balances
 */
bank.showOperations();
console.table([account1, account2]);

/**
 * Undo last 2 operations (same behavior as all previous files)
 */
bank.undo(2);

/**
 * Show state after undo
 */
bank.showOperations();
console.table([account1, account2]);

/**
 * WHAT MAKES THIS "JAVASCRIPT WAY":
 *
 * 1. PLAIN OBJECTS:
 *    - Accounts are { name, balance }
 *    - Commands are { operation, account, amount }
 *    - No unnecessary classes
 *
 * 2. FACTORY FUNCTIONS:
 *    - addAccount() instead of new BankAccount()
 *    - More flexible, no 'this' issues
 *
 * 3. FUNCTIONAL STYLE:
 *    - Operations are pure functions
 *    - Stateless (except necessary mutations)
 *
 * 4. SIMPLE DATA:
 *    - Everything is JSON-serializable
 *    - Easy to persist, transmit, debug
 *
 * 5. MODULE PATTERN:
 *    - Registry at module level
 *    - Encapsulation via closures (if needed)
 *
 * 6. MINIMAL SYNTAX:
 *    - Less code than OOP version
 *    - Easier to read and maintain
 */

/**
 * SERIALIZATION EXAMPLE:
 *
 * Because commands are plain objects, they're easily serializable:
 */
/*
const command = { operation: 'withdraw', account: 'Marcus', amount: 100 };

// Serialize
const json = JSON.stringify(command);
// '{"operation":"withdraw","account":"Marcus","amount":100}'

// Send over network
socket.send(json);

// Receive and deserialize
const received = JSON.parse(json);

// Execute received command
OPERATIONS[received.operation].execute(received);
*/

/**
 * EVENT SOURCING EXAMPLE:
 *
 * This approach is perfect for event sourcing:
 */
/*
// Save all commands to database
async function saveCommand(command) {
  await db.insert('events', command);
}

// Replay from database
async function replayHistory(accountName) {
  const events = await db.query('events', { account: accountName });
  const account = addAccount(accountName);
  
  for (const event of events) {
    OPERATIONS[event.operation].execute(event);
  }
  
  return account;
}
*/

/**
 * COMPARISON TABLE:
 *
 * ┌─────────────────┬──────────┬──────────┬───────────┬───────────┐
 * │     Feature     │ 1-2.js   │ 3.js     │ 5.js      │ 6.js      │
 * ├─────────────────┼──────────┼──────────┼───────────┼───────────┤
 * │ Command Class   │ Yes      │ Yes      │ Yes       │ NO        │
 * │ Account Class   │ Yes      │ Yes      │ Yes       │ NO        │
 * │ Execute         │ Method   │ Missing  │ Registry  │ Registry  │
 * │ Undo            │ Method   │ Missing  │ Registry  │ Registry  │
 * │ Validation      │ No       │ No       │ No        │ No        │
 * │ Serializable    │ No       │ Yes      │ Partial   │ YES       │
 * │ Boilerplate     │ High     │ Medium   │ Medium    │ LOW       │
 * │ Functional      │ No       │ No       │ Partial   │ YES       │
 * └─────────────────┴──────────┴──────────┴───────────┴───────────┘
 */

/**
 * WHEN TO USE THIS APPROACH:
 *
 * ✅ Simple domain objects (accounts, todos, etc.)
 * ✅ Need command serialization (event sourcing, persistence)
 * ✅ Prefer functional programming
 * ✅ Want minimal boilerplate
 * ✅ Rapid prototyping
 * ✅ Microservices (commands as messages)
 * ✅ Real-time systems (commands as events)
 *
 * WHEN TO USE OOP APPROACH (1-2.js):
 *
 * ✅ Complex commands with internal state
 * ✅ Need type safety (TypeScript)
 * ✅ Team prefers OOP
 * ✅ Commands have complex lifecycle
 * ✅ Need inheritance hierarchy
 */

/**
 * REAL-WORLD APPLICATIONS:
 *
 * 1. CQRS (Command Query Responsibility Segregation):
 */
/*
const COMMANDS = {
  createUser: {
    execute: async (cmd) => {
      await db.users.insert(cmd.data);
      await eventBus.publish('UserCreated', cmd.data);
    }
  },
  updateUser: {
    execute: async (cmd) => {
      await db.users.update(cmd.id, cmd.data);
    }
  }
};
*/

/**
 * 2. EVENT SOURCING:
 */
/*
// Store commands as events
async function handleCommand(command) {
  await eventStore.append(command);  // Persist command
  await OPERATIONS[command.operation].execute(command);
}

// Rebuild state from events
async function rebuildState(entityId) {
  const events = await eventStore.getEvents(entityId);
  const state = createInitialState();
  
  for (const event of events) {
    OPERATIONS[event.operation].execute(event);
  }
  
  return state;
}
*/

/**
 * 3. TASK QUEUE:
 */
/*
const taskQueue = {
  tasks: [],
  
  enqueue(command) {
    this.tasks.push(command);
  },
  
  async process() {
    while (this.tasks.length) {
      const cmd = this.tasks.shift();
      await OPERATIONS[cmd.operation].execute(cmd);
    }
  }
};
*/

/**
 * 4. DISTRIBUTED SYSTEMS:
 */
/*
// Client creates command
const command = {
  operation: 'withdraw',
  account: 'user123',
  amount: 100,
  timestamp: Date.now(),
  requestId: uuid()
};

// Serialize and send
await messageQueue.send(JSON.stringify(command));

// Server receives and processes
messageQueue.subscribe(async (message) => {
  const command = JSON.parse(message);
  await OPERATIONS[command.operation].execute(command);
});
*/

/**
 * KEY ADVANTAGES OF JAVASCRIPT WAY:
 *
 * 1. SERIALIZATION:
 *    JSON.stringify({ operation, account, amount })
 *    Works out of the box!
 *
 * 2. PERSISTENCE:
 *    await db.insert(command)
 *    No ORM mapping needed!
 *
 * 3. NETWORK:
 *    socket.send(JSON.stringify(command))
 *    Direct transmission!
 *
 * 4. DEBUGGING:
 *    console.log(command)
 *    Clear, readable output!
 *
 * 5. TESTING:
 *    const command = { ... };
 *    No 'new', no setup, just data!
 */

/**
 * PATTERN EVOLUTION COMPLETE:
 *
 * 1-execute.js:     Classical OOP → Execute only
 *                   ↓
 * 2-undo.js:        Classical OOP → Execute + Undo
 *                   ↓
 * 3-anemic.js:      ⚠️ Anti-pattern → Data without behavior
 *                   ↓
 * 4-operations.js:  Hybrid → Registry + validation
 *                   ↓
 * 5-undo.js:        Hybrid → Registry + execute + undo
 *                   ↓
 * 6-js-way.js:      ✅ JavaScript-idiomatic → Plain objects + registry
 *
 * FINAL FORM: Minimal, functional, practical
 */

/**
 * PHILOSOPHICAL NOTE:
 *
 * Command Pattern is often taught with heavy OOP:
 * - Abstract command classes
 * - Concrete command subclasses
 * - Complex class hierarchies
 *
 * But in JavaScript, we can achieve the SAME BENEFITS with:
 * - Plain objects (commands)
 * - Functions (operations)
 * - Registries (operation lookup)
 *
 * This is not "cheating" or "not real Command pattern".
 * It's adapting the pattern to the language's strengths.
 *
 * COMMAND PATTERN ESSENCE:
 * 1. Encapsulate request as object ✅ (plain object)
 * 2. Parameterize operations ✅ (operation field)
 * 3. Queue operations ✅ (commands array)
 * 4. Undo operations ✅ (undo function)
 * 5. Log operations ✅ (history)
 *
 * ALL ACHIEVED WITHOUT CLASSES!
 *
 * Remember: Patterns are about intent, not implementation.
 * Different languages have different idiomatic implementations.
 * This is the JavaScript way.
 */

/**
 * FINAL RECOMMENDATIONS:
 *
 * For JavaScript projects:
 *
 * 1. SIMPLE CASES:
 *    Use this approach (6-js-way.js)
 *    Plain objects + registry
 *
 * 2. COMPLEX CASES:
 *    Use OOP approach (2-undo.js)
 *    Classes with execute/undo methods
 *
 * 3. TYPESCRIPT PROJECTS:
 *    Use OOP with interfaces
 *    Type safety worth the verbosity
 *
 * 4. EVENT SOURCING:
 *    Use this approach (6-js-way.js)
 *    Perfect for event storage
 *
 * 5. MICROSERVICES:
 *    Use this approach (6-js-way.js)
 *    Commands as messages
 *
 * Choose the right tool for the job!
 */
