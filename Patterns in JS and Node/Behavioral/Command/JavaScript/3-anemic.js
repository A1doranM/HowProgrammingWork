'use strict';

/**
 * FILE PURPOSE: ⚠️ ANTI-PATTERN - Anemic Domain Model
 *
 * This file demonstrates a COMMON MISTAKE when implementing Command pattern:
 * Creating "commands" that are just DATA with NO BEHAVIOR.
 *
 * ⚠️ THIS IS NOT REAL COMMAND PATTERN! ⚠️
 *
 * WHAT'S WRONG HERE:
 * 1. AccountCommand has NO execute() method
 * 2. AccountCommand has NO undo() method
 * 3. Command is just a DTO (Data Transfer Object)
 * 4. Logic is in Bank class, not in command
 * 5. Cannot call command.execute() (no such method!)
 *
 * WHY THIS IS AN ANTI-PATTERN:
 * - Violates OOP principles (data without behavior)
 * - Loses Command pattern benefits
 * - Can't polymorphically execute commands
 * - Can't extend with new command types easily
 * - Breaks Single Responsibility (Bank does too much)
 *
 * THIS IS CALLED: "Anemic Domain Model"
 * - Martin Fowler's anti-pattern
 * - Objects that are just data holders
 * - No behavior, just getters/setters/properties
 *
 * COMPARISON TO PROPER PATTERN:
 * - 1-execute.js, 2-undo.js: Commands have execute() and undo() ✅
 * - 3-anemic.js (this): Commands are just data ❌
 *
 * WHY SHOW THIS?
 * To demonstrate common mistakes and how NOT to implement Command pattern.
 * Understanding anti-patterns helps avoid them in real code.
 */

/**
 * ⚠️ ANEMIC COMMAND - Anti-pattern
 *
 * This is NOT a proper Command - it's just a data structure.
 *
 * WHAT'S MISSING:
 * - No execute() method
 * - No undo() method
 * - No behavior at all
 *
 * WHAT IT IS:
 * Just a container for operation data:
 * {
 *   operation: 'withdraw' | 'income',
 *   account: string,
 *   amount: number
 * }
 *
 * WHY THIS ISN'T COMMAND PATTERN:
 *
 * Real Command Pattern:
 *   command.execute()  ✅ Command knows how to execute itself
 *
 * Anemic Model (this):
 *   bank.executeCommand(command)  ❌ External logic to execute
 *
 * The essence of Command pattern is lost when commands don't have behavior!
 */
class AccountCommand {
  /**
   * Create anemic command (just data)
   *
   * @param {string} operation - Operation type ('withdraw' or 'income')
   * @param {string} account - Account name (not even the account object!)
   * @param {number} amount - Operation amount
   *
   * PROBLEMS:
   * 1. Stores operation TYPE as string (not behavior)
   * 2. Stores account NAME (not reference to receiver)
   * 3. No methods to execute or undo
   *
   * THIS IS JUST A DTO (Data Transfer Object), NOT A COMMAND!
   */
  constructor(operation, account, amount) {
    this.operation = operation;  // String, not behavior!
    this.account = account;       // Name, not object reference!
    this.amount = amount;          // OK, but no way to use it
  }
  
  // ❌ NO execute() method!
  // ❌ NO undo() method!
  // ❌ NO behavior at all!
}

/**
 * Receiver: Bank Account
 *
 * Same as proper implementations.
 */
class BankAccount {
  constructor(name) {
    this.name = name;
    this.balance = 0;
  }
}

/**
 * ⚠️ GOD CLASS - Another Anti-pattern
 *
 * Bank class now does TOO MUCH:
 * 1. Creates commands
 * 2. Executes operations (should be in command)
 * 3. Manages command history
 * 4. Displays operations
 *
 * This violates Single Responsibility Principle.
 *
 * PROPER DESIGN:
 * - Command: Encapsulates operation logic
 * - Bank: Manages and invokes commands
 * - BankAccount: Receiver of operations
 *
 * ANEMIC DESIGN (this file):
 * - Command: Just data
 * - Bank: Does everything (God class)
 * - BankAccount: Receiver
 */
class Bank {
  constructor() {
    this.commands = [];
  }

  /**
   * Execute operation - ⚠️ WRONG APPROACH
   *
   * PROBLEMS:
   *
   * 1. Logic in wrong place:
   *    account.balance += amount  ← Should be in command!
   *
   * 2. Always adds (even for withdrawals):
   *    BUG: account.balance += amount
   *    This adds for both income AND withdraw!
   *    Withdrawals should subtract, but it adds!
   *
   * 3. Can't undo:
   *    No way to reverse the operation
   *
   * 4. Can't execute command polymorphically:
   *    command.execute() doesn't exist
   *
   * 5. Lost Command pattern benefits:
   *    - Can't queue commands for later
   *    - Can't redo operations
   *    - Command objects are useless (just data)
   *
   * @param {BankAccount} account - Account to operate on
   * @param {number} value - Amount (positive/negative)
   */
  operation(account, value) {
    const operation = value < 0 ? 'withdraw' : 'income';
    const amount = Math.abs(value);
    const { name } = account;
    
    // Create anemic command (just data, no behavior)
    const command = new AccountCommand(operation, name, amount);
    
    // Store command (for what? Can't execute or undo it!)
    this.commands.push(command);
    
    // ⚠️ BUG: Always ADDS, even for withdrawals!
    // Should be:
    //   if (value < 0) account.balance -= amount;
    //   else account.balance += amount;
    // Or better: command.execute() (if command had execute method)
    account.balance += amount;  // WRONG! Adds for withdrawals too!
  }

  /**
   * Display operations
   *
   * At least this works because commands store the data.
   * But this is just logging - could use any data structure for this.
   */
  showOperations() {
    console.table(this.commands);
  }
}

// ===========================
// Usage - Shows the Problems
// ===========================

const bank = new Bank();
const account1 = new BankAccount('Marcus Aurelius');

/**
 * These operations will have WRONG results due to the bug!
 *
 * INTENDED:
 * +1000 → balance = 1000
 * -50   → balance = 950
 *
 * ACTUAL (due to bug):
 * +1000 → balance = 1000  ✓ Correct (accidentally)
 * -50   → balance = 1050  ✗ WRONG! (should be 950)
 *
 * The withdrawal ADDS instead of subtracting!
 */
bank.operation(account1, 1000);   // Intended: +1000, Actual: +1000 ✓
bank.operation(account1, -50);    // Intended: -50, Actual: +50 ✗ BUG!

const account2 = new BankAccount('Antoninus Pius');
bank.operation(account2, 500);    // Intended: +500, Actual: +500 ✓
bank.operation(account2, -100);   // Intended: -100, Actual: +100 ✗ BUG!
bank.operation(account2, 150);    // Intended: +150, Actual: +150 ✓

bank.showOperations();
console.table([account1, account2]);

/**
 * EXPECTED BALANCES:
 * account1: 1000 - 50 = 950
 * account2: 500 - 100 + 150 = 550
 *
 * ACTUAL BALANCES (with bugs):
 * account1: 1000 + 50 = 1050  ✗ WRONG!
 * account2: 500 + 100 + 150 = 750  ✗ WRONG!
 *
 * This demonstrates why anemic domain model is dangerous!
 */

/**
 * WHY THIS ANTI-PATTERN IS TEMPTING:
 *
 * 1. SIMPLICITY:
 *    - Seems simpler (no execute/undo methods)
 *    - Just store data, process later
 *
 * 2. SERIALIZATION:
 *    - Easy to serialize (just plain data)
 *    - Can send over network
 *
 * 3. SEPARATION:
 *    - Logic separated from data
 *    - "Easier" to understand (wrong!)
 *
 * BUT THESE ARE FALSE BENEFITS:
 *
 * ❌ Not simpler - logic must go somewhere (God class)
 * ❌ Serialization possible with proper commands too
 * ❌ Separation causes scattered logic (harder to maintain)
 */

/**
 * HOW TO FIX THIS:
 *
 * 1. Add execute() method to AccountCommand
 * 2. Move logic from Bank to commands
 * 3. Store account reference, not account name
 * 4. Add undo() for reversibility
 *
 * See 1-execute.js and 2-undo.js for proper implementations!
 */

/**
 * PROPER COMMAND (from 2-undo.js):
 *
 * class Withdraw extends AccountCommand {
 *   execute() {
 *     this.account.balance -= this.amount;  // Logic IN command
 *   }
 *
 *   undo() {
 *     this.account.balance += this.amount;  // Reversible
 *   }
 * }
 *
 * class Bank {
 *   operation(account, value) {
 *     const Command = value < 0 ? Withdraw : Income;
 *     const command = new Command(account, Math.abs(value));
 *     command.execute();  // Polymorphic execution
 *     this.commands.push(command);
 *   }
 * }
 */

/**
 * ANEMIC vs RICH DOMAIN MODEL:
 *
 * Anemic (this file):
 *   - Commands are data structures
 *   - Logic in service layer (Bank)
 *   - Hard to extend
 *   - Procedural style
 *
 * Rich (1-execute.js, 2-undo.js):
 *   - Commands are objects with behavior
 *   - Logic in commands (where it belongs)
 *   - Easy to extend (add new command classes)
 *   - Object-oriented style
 */

/**
 * KEY LESSONS:
 *
 * 1. ❌ DON'T create commands without execute()
 * 2. ❌ DON'T put command logic in invoker
 * 3. ❌ DON'T use strings for operation types
 * 4. ✅ DO encapsulate behavior in commands
 * 5. ✅ DO make commands self-contained
 * 6. ✅ DO follow OOP principles
 *
 * BOTTOM LINE:
 * If your "command" doesn't have execute(), it's not a command!
 * It's just data, and you've missed the point of the pattern.
 *
 * This anti-pattern is common in codebases that claim to use
 * Command pattern but actually just have DTOs with separate service logic.
 */
