'use strict';

/**
 * FILE PURPOSE: Command Pattern with Operations Registry + Validation
 *
 * This file introduces a hybrid approach between OOP and functional:
 * - Commands are still data (like 3-anemic.js)
 * - BUT operations have behavior in a registry (fixing the anti-pattern)
 * - PLUS validation before execution
 *
 * NEW FEATURES vs Previous Files:
 * ✅ Operations registry (centralized operation logic)
 * ✅ Validation (allowed() function)
 * ✅ Account registry (global account lookup)
 * ✅ Pre-execution checks (prevent invalid operations)
 *
 * PATTERN VARIANT: Registry-based Command
 * Instead of command classes with methods, we have:
 * - Command as data
 * - Operations as registry entries
 * - Validation as separate function
 *
 * WHY THIS APPROACH:
 * ✅ Centralized logic (all operations in one place)
 * ✅ Easy to add new operations (add to registry)
 * ✅ Commands are serializable (plain objects)
 * ✅ Validation separated from execution
 *
 * TRADE-OFFS:
 * ❌ Lost polymorphism (can't call command.execute())
 * ❌ Registry must be maintained
 * ❌ Not true OOP (but that's OK in JavaScript)
 */

/**
 * Command as Data Structure
 *
 * Still anemic (no methods) but now we have operations registry
 * to provide the behavior.
 *
 * IMPROVEMENT OVER 3-anemic.js:
 * While command itself has no behavior, OPERATIONS registry provides it.
 * This is a valid approach in JavaScript, combining:
 * - Data (commands)
 * - Behavior (operations registry)
 *
 * STRUCTURE:
 * {
 *   operation: string,  // Operation type
 *   account: string,    // Account name (key for lookup)
 *   amount: number      // Operation parameter
 * }
 */
class AccountCommand {
  constructor(operation, account, amount) {
    this.operation = operation;  // 'withdraw' | 'income'
    this.account = account;       // Account name (for registry lookup)
    this.amount = amount;          // Operation amount
  }
}

/**
 * Receiver with Global Registry
 *
 * NEW FEATURE: Static accounts Map
 * - Stores ALL accounts in application
 * - Allows command lookup by name
 * - Enables decoupling (commands store name, not reference)
 *
 * PATTERN: Registry Pattern
 * Central place to register and lookup accounts.
 *
 * WHY STATIC MAP:
 * - Global account registry
 * - Commands can reference accounts by name
 * - Accounts can be looked up by operations
 *
 * TRADE-OFF:
 * ✅ Decoupling: Commands don't hold account references
 * ❌ Global state: All accounts in one place
 */
class BankAccount {
  /**
   * Global account registry
   *
   * Maps account name → account object
   * Allows operations to find accounts by name
   */
  static accounts = new Map();

  /**
   * Create account and register globally
   *
   * @param {string} name - Account holder name (must be unique!)
   *
   * AUTO-REGISTRATION:
   * Every new account automatically registers itself.
   * This is convenient but creates global coupling.
   *
   * ALTERNATIVE:
   * External registration:
   *   const account = new BankAccount('Marcus');
   *   accountRegistry.register(account.name, account);
   */
  constructor(name) {
    this.name = name;
    this.balance = 0;
    BankAccount.accounts.set(name, this);  // Auto-register
  }
}

/**
 * Operations Registry - Core of this approach
 *
 * PATTERN: Strategy Pattern + Registry
 *
 * Instead of command classes (Withdraw, Income), we have:
 * - Function for each operation
 * - Organized in a registry object
 * - Looked up by operation name
 *
 * STRUCTURE:
 * {
 *   operationName: Function,
 *   ...
 * }
 *
 * BENEFITS:
 * ✅ All operations in one place (easy to see)
 * ✅ Easy to add new operations
 * ✅ Can add cross-cutting concerns (logging, validation)
 * ✅ Functional programming style
 *
 * COMPARISON:
 * OOP: new Withdraw(account, 100).execute()
 * Registry: OPERATIONS['withdraw'](command)
 */
const OPERATIONS = {
  /**
   * Withdraw operation function
   *
   * Implements withdrawal logic (same as Withdraw.execute())
   *
   * @param {Object} command - Command data {operation, account, amount}
   *
   * PROCESS:
   * 1. Lookup account by name in global registry
   * 2. Subtract amount from balance
   *
   * NOTE: This is the BEHAVIOR that was missing in 3-anemic.js
   */
  withdraw: (command) => {
    const account = BankAccount.accounts.get(command.account);
    account.balance -= command.amount;
  },
  
  /**
   * Income operation function
   *
   * Implements income logic (same as Income.execute())
   *
   * @param {Object} command - Command data
   *
   * PROCESS:
   * 1. Lookup account by name
   * 2. Add amount to balance
   */
  income: (command) => {
    const account = BankAccount.accounts.get(command.account);
    account.balance += command.amount;
  },
  
  /**
   * Validation function - NEW!
   *
   * Checks if operation is allowed before execution.
   * This prevents invalid operations (overdrafts).
   *
   * @param {Object} command - Command to validate
   * @returns {boolean} - true if operation allowed
   *
   * VALIDATION RULES:
   * 1. Income always allowed (adding money)
   * 2. Withdraw only if sufficient balance
   *
   * BENEFITS:
   * - Prevents overdraft
   * - Pre-execution validation
   * - Business rule enforcement
   *
   * IMPROVEMENT NEEDED:
   * Could return validation result object:
   *   { valid: boolean, errors: string[] }
   */
  allowed: (command) => {
    // Income always allowed (adding money can't fail)
    if (command.operation === 'income') return true;
    
    // Withdraw requires sufficient balance
    const account = BankAccount.accounts.get(command.account);
    return account.balance >= command.amount;
  },
};

/**
 * Invoker: Bank with Validation
 *
 * Enhanced to validate commands before execution.
 *
 * NEW FEATURE: Pre-execution validation
 * - Checks if operation is allowed
 * - Throws error if not
 * - Prevents invalid state changes
 *
 * EXECUTION FLOW:
 * 1. Create command
 * 2. Validate command (NEW!)
 * 3. If valid, execute
 * 4. Store in history
 */
class Bank {
  constructor() {
    this.commands = [];
  }

  /**
   * Execute operation with validation
   *
   * EXECUTION FLOW:
   *
   * 1. DETERMINE OPERATION TYPE:
   *    operation = value < 0 ? 'withdraw' : 'income'
   *
   * 2. GET OPERATION FUNCTION:
   *    execute = OPERATIONS[operation]
   *
   * 3. CREATE COMMAND (data):
   *    command = { operation, account: name, amount }
   *
   * 4. VALIDATE (NEW!):
   *    allowed = OPERATIONS.allowed(command)
   *    if (!allowed) throw Error
   *
   * 5. STORE COMMAND:
   *    this.commands.push(command)
   *
   * 6. EXECUTE:
   *    execute(command)
   *
   * @param {BankAccount} account - Account to operate on
   * @param {number} value - Amount (positive/negative)
   * @throws {Error} - If operation not allowed
   *
   * KEY IMPROVEMENT:
   * Validation BEFORE execution prevents invalid state.
   * In 3-anemic.js, there was no validation at all.
   */
  operation(account, value) {
    // Determine operation type
    const operation = value < 0 ? 'withdraw' : 'income';
    
    // Get operation function from registry
    const execute = OPERATIONS[operation];
    
    // Extract parameters
    const amount = Math.abs(value);
    const { name } = account;
    
    // Create command (still just data, but now we have behavior)
    const command = new AccountCommand(operation, name, amount);
    
    // VALIDATE BEFORE EXECUTION - NEW!
    const check = OPERATIONS.allowed;
    const allowed = check(command);
    
    if (!allowed) {
      // Operation not allowed - throw detailed error
      const target = BankAccount.accounts.get(command.account);
      const msg = [
        'Command is not allowed',
        'do ' + JSON.stringify(command),
        'on ' + JSON.stringify(target),
      ];
      throw new Error(msg.join('\n'));
    }
    
    // Store command in history
    this.commands.push(command);
    
    // Execute operation via registry
    execute(command);
  }

  /**
   * Display operations (same as before)
   */
  showOperations() {
    console.table(this.commands);
  }
}

// ===========================
// Usage with Validation
// ===========================

const bank = new Bank();

/**
 * Account 1 operations
 * All succeed because sufficient balance
 */
const account1 = new BankAccount('Marcus Aurelius');
bank.operation(account1, 1000);   // Income: 0 → 1000 ✓
bank.operation(account1, -50);    // Withdraw: 1000 → 950 ✓ (allowed: 1000 >= 50)

/**
 * Account 2 operations
 */
const account2 = new BankAccount('Antoninus Pius');
bank.operation(account2, 500);    // Income: 0 → 500 ✓
bank.operation(account2, -100);   // Withdraw: 500 → 400 ✓ (allowed: 500 >= 100)
// Comment says -10000 but code uses -100 (probably intended to test validation)
bank.operation(account2, 150);    // Income: 400 → 550 ✓

/**
 * Display operations and final state
 *
 * All 5 operations succeed because:
 * - Incomes always allowed
 * - Withdrawals have sufficient balance
 */
bank.showOperations();
console.table([account1, account2]);

/**
 * VALIDATION IN ACTION:
 *
 * Try these operations to see validation:
 *
 * // This would fail:
 * // bank.operation(account1, -10000);
 * // Error: Command not allowed
 * //   do {"operation":"withdraw","account":"Marcus Aurelius","amount":10000}
 * //   on {"name":"Marcus Aurelius","balance":950}
 * // Because: 950 < 10000 (insufficient funds)
 *
 * // This would succeed:
 * // bank.operation(account1, 10000);
 * // Income operations always allowed
 */

/**
 * OPERATIONS REGISTRY PATTERN:
 *
 * STRUCTURE:
 * {
 *   operationName: operationFunction,
 *   ...
 *   specialOperation: validationOrHelperFunction
 * }
 *
 * BENEFITS:
 *
 * 1. CENTRALIZATION:
 *    All operation logic in one place
 *    Easy to see all operations
 *
 * 2. EXTENSIBILITY:
 *    Add new operation:
 *      OPERATIONS.transfer = (cmd) => { ... };
 *    No class creation needed
 *
 * 3. DYNAMIC OPERATIONS:
 *    Can add/remove operations at runtime
 *    OPERATIONS[dynamicName] = dynamicFunction;
 *
 * 4. CROSS-CUTTING CONCERNS:
 *    Easy to add logging, metrics:
 *      const original = OPERATIONS.withdraw;
 *      OPERATIONS.withdraw = (cmd) => {
 *        console.log('Withdrawing', cmd);
 *        return original(cmd);
 *      };
 *
 * 5. TESTING:
 *    Easy to mock operations:
 *      OPERATIONS.withdraw = mockWithdraw;
 */

/**
 * COMPARISON: OOP vs Registry
 *
 * OOP Approach (1-execute.js, 2-undo.js):
 *
 * class Withdraw extends Command {
 *   execute() { this.account.balance -= this.amount; }
 *   undo() { this.account.balance += this.amount; }
 * }
 *
 * Registry Approach (this file):
 *
 * const OPERATIONS = {
 *   withdraw: (cmd) => {
 *     const acc = accounts.get(cmd.account);
 *     acc.balance -= cmd.amount;
 *   }
 * };
 *
 * WHEN TO USE OOP:
 * ✅ Complex commands with state
 * ✅ Need inheritance/polymorphism
 * ✅ Type safety important
 * ✅ Team prefers OOP
 *
 * WHEN TO USE REGISTRY:
 * ✅ Simple operations
 * ✅ Many similar operations
 * ✅ Need dynamic operation loading
 * ✅ Functional programming style
 * ✅ Commands need serialization
 */

/**
 * VALIDATION PATTERN:
 *
 * This file demonstrates Command pattern with validation.
 *
 * VALIDATION APPROACHES:
 *
 * 1. Pre-execution (this file):
 *    if (!allowed(cmd)) throw Error;
 *    execute(cmd);
 *
 * 2. In execute (2-undo.js style):
 *    execute() {
 *      if (!this.canExecute()) throw Error;
 *      this.doExecute();
 *    }
 *
 * 3. Separate validator:
 *    validator.validate(cmd);
 *    execute(cmd);
 *
 * CHOOSE BASED ON:
 * - Where validation logic belongs
 * - How complex validation is
 * - Whether validation is shared across commands
 */

/**
 * IMPROVEMENTS IN THIS VERSION:
 *
 * vs 1-execute.js:
 * ✅ Added validation (prevents invalid operations)
 * ✅ Centralized operations (easier to maintain)
 *
 * vs 2-undo.js:
 * ❌ No undo support yet (see 5-undo.js for that)
 * ✅ Better validation
 *
 * vs 3-anemic.js:
 * ✅ Fixed the bug (proper operation execution)
 * ✅ Added validation
 * ✅ Centralized operations
 *
 * STILL MISSING:
 * ❌ No undo() in operations
 * ❌ Commands removed from history when needed
 * ❌ No redo support
 *
 * NEXT FILE (5-undo.js):
 * Combines operations registry WITH undo support
 */

/**
 * KEY TAKEAWAYS:
 *
 * 1. VALIDATION: Check before execute
 * 2. REGISTRY: Centralize operation logic
 * 3. GLOBAL LOOKUP: Account registry for name-based access
 * 4. HYBRID APPROACH: Data commands + function registry
 * 5. ERROR MESSAGES: Detailed error reporting
 *
 * PATTERN BENEFITS PRESERVED:
 * ✅ Encapsulation (operations encapsulated in registry)
 * ✅ History (commands stored)
 * ✅ Validation (business rules enforced)
 * ✅ Extensibility (add operations to registry)
 *
 * This demonstrates that Command pattern doesn't require OOP.
 * Functional approaches are equally valid in JavaScript!
 */
