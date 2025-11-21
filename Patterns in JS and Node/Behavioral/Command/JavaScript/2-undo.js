'use strict';

/**
 * FILE PURPOSE: Command Pattern with Undo Support
 *
 * This file extends 1-execute.js by adding UNDO functionality.
 * This is one of the most powerful features of the Command pattern.
 *
 * NEW FEATURES vs 1-execute.js:
 * ✅ undo() method in command interface
 * ✅ undo() implementation in concrete commands
 * ✅ Bank.undo(count) to reverse multiple operations
 *
 * UNDO/REDO PATTERN:
 * Each command knows:
 * - How to execute (do the operation)
 * - How to undo (reverse the operation)
 *
 * This enables:
 * - Reverting mistakes
 * - Transaction rollback
 * - Time-travel debugging
 * - Implementing redo (execute after undo)
 *
 * REAL-WORLD EXAMPLES:
 * - Text editors (Ctrl+Z)
 * - Graphics programs (undo drawing)
 * - Database transactions (rollback)
 * - Version control (git revert)
 */

/**
 * Abstract Command with Undo Support
 *
 * Now defines TWO abstract methods:
 * - execute(): Perform the operation
 * - undo(): Reverse the operation
 *
 * PATTERN REQUIREMENT:
 * Every command must be REVERSIBLE.
 * If you can't undo an operation, it shouldn't be a command.
 *
 * INVARIANT:
 * For any command cmd:
 *   state1 → cmd.execute() → state2 → cmd.undo() → state1
 *   (executing then undoing should restore original state)
 */
class AccountCommand {
  /**
   * Initialize command (same as 1-execute.js)
   */
  constructor(account, amount) {
    this.account = account;  // Receiver
    this.amount = amount;     // Parameters
  }

  /**
   * Abstract execute method
   * Concrete commands must implement
   */
  execute() {
    throw new Error('Command.execute() is not implemented');
  }

  /**
   * Abstract undo method - NEW!
   *
   * Concrete commands must implement undo that reverses execute.
   *
   * UNDO CONTRACT:
   * - Must restore state to before execute() was called
   * - Should be idempotent (calling twice = calling once)
   * - Should only undo if execute() was successful
   *
   * IMPLEMENTATION STRATEGIES:
   * 1. Inverse operation (withdrawal → deposit)
   * 2. State snapshot (save state before, restore on undo)
   * 3. Compensation (more complex reversal logic)
   */
  undo() {
    throw new Error('Command.undo() is not implemented');
  }
}

/**
 * Concrete Command: Withdraw with Undo
 *
 * Implements both execute and undo methods.
 *
 * UNDO STRATEGY: Inverse Operation
 * - execute: balance -= amount
 * - undo: balance += amount (exact inverse)
 *
 * This is the simplest undo strategy - just do the opposite.
 */
class Withdraw extends AccountCommand {
  /**
   * Execute withdrawal
   *
   * STATE CHANGE:
   * balance: X → X - amount
   */
  execute() {
    this.account.balance -= this.amount;
  }

  /**
   * Undo withdrawal (reverse operation)
   *
   * REVERSAL:
   * Withdrawal subtracts, so undo adds back.
   *
   * STATE CHANGE:
   * balance: X - amount → X
   *
   * IMPORTANT:
   * This assumes execute() was called.
   * Better implementation would track execution state.
   *
   * Example:
   *   execute(): 1000 - 50 = 950
   *   undo():    950 + 50 = 1000  (restored)
   */
  undo() {
    this.account.balance += this.amount;
  }
}

/**
 * Concrete Command: Income with Undo
 *
 * UNDO STRATEGY: Inverse Operation
 * - execute: balance += amount
 * - undo: balance -= amount (exact inverse)
 *
 * SYMMETRY:
 * Notice the symmetry with Withdraw:
 * - Withdraw: execute(-) ↔ undo(+)
 * - Income:   execute(+) ↔ undo(-)
 *
 * They are inverses of each other!
 */
class Income extends AccountCommand {
  /**
   * Execute income
   *
   * STATE CHANGE:
   * balance: X → X + amount
   */
  execute() {
    this.account.balance += this.amount;
  }

  /**
   * Undo income (reverse operation)
   *
   * REVERSAL:
   * Income adds, so undo subtracts.
   *
   * STATE CHANGE:
   * balance: X + amount → X
   *
   * Example:
   *   execute(): 0 + 1000 = 1000
   *   undo():    1000 - 1000 = 0  (restored)
   */
  undo() {
    this.account.balance -= this.amount;
  }
}

/**
 * Receiver: Bank Account
 *
 * Same as 1-execute.js - no changes needed.
 * Receiver is passive and doesn't know about undo.
 */
class BankAccount {
  constructor(name) {
    this.name = name;
    this.balance = 0;
  }
}

/**
 * Invoker: Bank with Undo Support
 *
 * Enhanced to support undoing operations.
 *
 * NEW FEATURE: undo(count) method
 * - Pops commands from history
 * - Calls undo() on each
 * - Reverses operations in LIFO order (stack)
 */
class Bank {
  constructor() {
    this.commands = [];  // Command history (also serves as undo stack)
  }

  /**
   * Execute operation (same as 1-execute.js)
   *
   * HISTORY MANAGEMENT:
   * Commands array serves dual purpose:
   * 1. Audit log (all operations)
   * 2. Undo stack (LIFO for undo)
   */
  operation(account, value) {
    const Command = value < 0 ? Withdraw : Income;
    const command = new Command(account, Math.abs(value));
    command.execute();
    this.commands.push(command);  // Add to undo stack
  }

  /**
   * Undo last N operations - NEW!
   *
   * Reverses operations in LIFO (Last-In-First-Out) order.
   * This makes sense because:
   * - Last operation should be undone first
   * - Like Ctrl+Z in text editors
   *
   * @param {number} count - Number of operations to undo
   *
   * UNDO PROCESS:
   *
   * 1. Pop command from history (LIFO)
   * 2. Call command.undo()
   * 3. Repeat count times
   *
   * EXAMPLE:
   * History: [Income(1000), Withdraw(50), Income(150)]
   * undo(2):
   *   1. Pop Income(150) → undo() → balance -= 150
   *   2. Pop Withdraw(50) → undo() → balance += 50
   *
   * Result: Last two operations reversed
   *
   * IMPORTANT NOTES:
   *
   * ⚠️ Commands are REMOVED from history (pop)
   *    - Can't redo after undo (no redo stack)
   *    - To support redo, need separate undo/redo stacks
   *
   * ⚠️ No validation
   *    - What if count > commands.length?
   *    - What if undo() fails?
   *    Better implementation would handle these cases
   *
   * REDO SUPPORT (not implemented):
   * To add redo, need:
   * - Don't pop from history, just track position
   * - Redo moves position forward and re-executes
   */
  undo(count) {
    for (let i = 0; i < count; i++) {
      const command = this.commands.pop();  // LIFO - last command first
      command.undo();                        // Reverse the operation
    }
    // Commands are removed from history
    // Can't redo without storing them separately
  }

  /**
   * Display operations (same as 1-execute.js with minor formatting change)
   */
  showOperations() {
    const output = [];
    for (const command of this.commands) {
      output.push({
        operation: command.constructor.name.toLowerCase(),  // lowercase for display
        account: command.account.name,
        amount: command.amount,
      });
    }
    console.table(output);
  }
}

// ===========================
// Usage Example with Undo
// ===========================

const bank = new Bank();

/**
 * Account 1 operations
 */
const account1 = new BankAccount('Marcus Aurelius');
bank.operation(account1, 1000);   // Balance: 0 → 1000 (Income)
bank.operation(account1, -50);    // Balance: 1000 → 950 (Withdraw)

/**
 * Account 2 operations
 */
const account2 = new BankAccount('Antoninus Pius');
bank.operation(account2, 500);    // Balance: 0 → 500 (Income)
bank.operation(account2, -100);   // Balance: 500 → 400 (Withdraw)
bank.operation(account2, 150);    // Balance: 400 → 550 (Income)

/**
 * State before undo:
 * account1.balance = 950
 * account2.balance = 550
 * commands.length = 5
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
 *                                                                     ↑
 *                                                               Last operation
 *
 * undo(2):
 *
 * 1. Pop Income(Antoninus, 150)
 *    undo(): account2.balance -= 150
 *    Balance: 550 - 150 = 400
 *
 * 2. Pop Withdraw(Antoninus, 100)
 *    undo(): account2.balance += 100
 *    Balance: 400 + 100 = 500
 *
 * RESULT:
 * - account2.balance restored to 500 (before last 2 operations)
 * - Only 3 commands remain in history
 * - Last 2 commands are gone (can't redo)
 */
bank.undo(2);

/**
 * State after undo:
 * account1.balance = 950 (unchanged)
 * account2.balance = 500 (undone 2 operations: -150, +100)
 * commands.length = 3 (2 commands removed)
 */
bank.showOperations();
console.table([account1, account2]);

/**
 * UNDO DEMONSTRATION:
 *
 * BEFORE UNDO:
 * ┌─────────┬───────────┬──────────────────────┬────────┐
 * │ (index) │ operation │       account        │ amount │
 * ├─────────┼───────────┼──────────────────────┼────────┤
 * │    0    │ 'income'  │ 'Marcus Aurelius'   │  1000  │
 * │    1    │ 'withdraw'│ 'Marcus Aurelius'   │   50   │
 * │    2    │ 'income'  │ 'Antoninus Pius'    │  500   │
 * │    3    │ 'withdraw'│ 'Antoninus Pius'    │  100   │
 * │    4    │ 'income'  │ 'Antoninus Pius'    │  150   │ ← Undone
 * └─────────┴───────────┴──────────────────────┴────────┘  ← Undone
 *
 * Balances: Marcus=950, Antoninus=550
 *
 * AFTER undo(2):
 * ┌─────────┬───────────┬──────────────────────┬────────┐
 * │ (index) │ operation │       account        │ amount │
 * ├─────────┼───────────┼──────────────────────┼────────┤
 * │    0    │ 'income'  │ 'Marcus Aurelius'   │  1000  │
 * │    1    │ 'withdraw'│ 'Marcus Aurelius'   │   50   │
 * │    2    │ 'income'  │ 'Antoninus Pius'    │  500   │
 * └─────────┴───────────┴──────────────────────┴────────┘
 *
 * Balances: Marcus=950, Antoninus=500
 *
 * Notice: Last 2 operations removed and effects reversed
 */

/**
 * KEY IMPROVEMENTS OVER 1-execute.js:
 *
 * 1. REVERSIBILITY:
 *    ✅ Can undo operations (wasn't possible before)
 *
 * 2. UNDO STACK:
 *    ✅ Commands array serves as undo stack
 *
 * 3. BATCH UNDO:
 *    ✅ Can undo multiple operations at once
 *
 * 4. SYMMETRIC OPERATIONS:
 *    ✅ Each operation has its inverse
 *
 * LIMITATIONS OF THIS VERSION:
 *
 * ❌ No redo: Undone commands are lost
 * ❌ No validation: Can undo past zero balance
 * ❌ No error handling: What if undo fails?
 * ❌ No undo limits: Could undo to invalid state
 *
 * IMPROVED UNDO/REDO (not shown here):
 *
 * class BankWithRedo {
 *   constructor() {
 *     this.history = [];
 *     this.position = -1;  // Current position in history
 *   }
 *
 *   execute(command) {
 *     command.execute();
 *     // Remove any commands after current position
 *     this.history = this.history.slice(0, this.position + 1);
 *     this.history.push(command);
 *     this.position++;
 *   }
 *
 *   undo() {
 *     if (this.position >= 0) {
 *       this.history[this.position].undo();
 *       this.position--;  // Move back, don't remove
 *     }
 *   }
 *
 *   redo() {
 *     if (this.position < this.history.length - 1) {
 *       this.position++;
 *       this.history[this.position].execute();
 *     }
 *   }
 * }
 */

/**
 * UNDO STRATEGIES:
 *
 * 1. INVERSE OPERATION (used here):
 *    - Withdrawal: undo by adding
 *    - Income: undo by subtracting
 *    - Pros: Simple, memory efficient
 *    - Cons: Only works for reversible operations
 *
 * 2. STATE SNAPSHOT:
 *    - Save state before execute
 *    - Restore state on undo
 *    - Pros: Works for any operation
 *    - Cons: Memory intensive
 *
 * 3. COMPENSATION:
 *    - Create new command that compensates
 *    - Example: refund = new Income(account, amount)
 *    - Pros: Maintains operation log
 *    - Cons: More complex logic
 *
 * 4. MEMENTO PATTERN:
 *    - Save complete object state
 *    - Restore on undo
 *    - Pros: Complete state restoration
 *    - Cons: Very memory intensive
 */

/**
 * NEXT FILES:
 *
 * 3-anemic.js:      ⚠️ Anti-pattern (commands without behavior)
 * 4-operations.js:  Operation registry + validation
 * 5-undo.js:        Registry approach with undo
 * 6-js-way.js:      JavaScript-idiomatic implementation
 */
