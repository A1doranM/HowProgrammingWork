'use strict';

/**
 * FILE PURPOSE: Basic Command Pattern - Execute Only
 *
 * This file demonstrates the fundamental Command pattern with:
 * - Abstract command class defining the interface
 * - Concrete commands encapsulating operations
 * - Invoker managing command execution and history
 * - NO UNDO functionality (see 2-undo.js for that)
 *
 * COMMAND PATTERN ROLES:
 *
 * 1. Command (AccountCommand) - Declares interface for executing operation
 * 2. ConcreteCommand (Withdraw, Income) - Implements execute() method
 * 3. Receiver (BankAccount) - Object that performs actual work
 * 4. Invoker (Bank) - Asks command to carry out request
 * 5. Client (Usage code) - Creates commands and sets receivers
 *
 * PATTERN BENEFITS DEMONSTRATED:
 * ✅ Encapsulation: Operations are objects, not just method calls
 * ✅ Logging: Can track all operations via commands array
 * ✅ Queuing: Could execute commands later if needed
 * ✅ History: Commands array maintains operation history
 *
 * NOT YET DEMONSTRATED:
 * ❌ Undo/Redo: No undo() method yet (see next file)
 * ❌ Validation: No pre-execution checks
 * ❌ Error handling: No rollback mechanism
 */

/**
 * Abstract Command Class
 *
 * Defines the interface that all concrete commands must implement.
 * In classical GoF pattern, this would be an interface or abstract class.
 *
 * PATTERN ROLE: Command (abstract)
 *
 * RESPONSIBILITIES:
 * 1. Store receiver (account) and operation parameters (amount)
 * 2. Define execute() interface
 * 3. Force subclasses to implement execute()
 *
 * KEY CONCEPT: Commands encapsulate THREE things:
 * - The receiver object (account)
 * - The operation to perform (withdraw/income)
 * - The parameters for the operation (amount)
 */
class AccountCommand {
  /**
   * Initialize command with receiver and parameters
   *
   * @param {BankAccount} account - The receiver (object to operate on)
   * @param {number} amount - Operation parameter
   *
   * ENCAPSULATION:
   * The command now contains EVERYTHING needed to execute the operation:
   * - Who: this.account (receiver)
   * - What: defined by subclass (withdraw/income)
   * - How much: this.amount (parameter)
   */
  constructor(account, amount) {
    this.account = account;  // Receiver: Object to operate on
    this.amount = amount;     // Parameters: Data needed for operation
  }

  /**
   * Abstract execute method
   *
   * Concrete commands must override this method.
   * Throwing error enforces implementation by subclasses.
   *
   * PATTERN PRINCIPLE:
   * All commands must have execute() method - this is the command interface.
   * The invoker calls cmd.execute() without knowing which concrete command it is.
   *
   * @throws {Error} If called on base class (not implemented by subclass)
   */
  execute() {
    throw new Error('Command is not implemented');
  }
}

/**
 * Concrete Command: Withdraw
 *
 * Encapsulates the "withdraw money from account" operation.
 *
 * PATTERN ROLE: ConcreteCommand
 *
 * RESPONSIBILITY:
 * - Implement execute() to perform the withdrawal
 * - Bind the operation (withdraw) to the receiver (account)
 *
 * KEY INSIGHT:
 * The command doesn't just store data - it knows HOW to execute.
 * This is what makes it "Command" pattern, not just a DTO.
 */
class Withdraw extends AccountCommand {
  /**
   * Execute withdrawal operation
   *
   * Performs the actual withdrawal by modifying receiver's state.
   *
   * EXECUTION:
   * 1. Access receiver (this.account)
   * 2. Perform operation (balance -= amount)
   * 3. No return value (void command)
   *
   * LIMITATION:
   * Once executed, cannot be undone (yet - see 2-undo.js)
   *
   * STATE CHANGE:
   * this.account.balance: X → X - this.amount
   */
  execute() {
    this.account.balance -= this.amount;
  }
}

/**
 * Concrete Command: Income
 *
 * Encapsulates the "add money to account" operation.
 *
 * PATTERN ROLE: ConcreteCommand
 *
 * SYMMETRY WITH WITHDRAW:
 * - Same interface (execute)
 * - Same parameters (account, amount)
 * - Opposite operation (add vs subtract)
 * - Could be undone by opposite operation
 */
class Income extends AccountCommand {
  /**
   * Execute income operation
   *
   * Adds money to the account balance.
   *
   * STATE CHANGE:
   * this.account.balance: X → X + this.amount
   */
  execute() {
    this.account.balance += this.amount;
  }
}

/**
 * Receiver: Bank Account
 *
 * The object that actually has the state being modified.
 * Commands operate ON this object.
 *
 * PATTERN ROLE: Receiver (or Target)
 *
 * RESPONSIBILITY:
 * - Maintain account state (name, balance)
 * - Provide data for commands to operate on
 *
 * NOTE:
 * The receiver is PASSIVE in Command pattern.
 * It doesn't know about commands - commands know about it.
 *
 * This is different from Active Record where the object
 * would have save(), delete() methods.
 */
class BankAccount {
  /**
   * Create a bank account with zero balance
   *
   * @param {string} name - Account holder name
   *
   * INITIAL STATE:
   * - name: provided
   * - balance: 0 (starting balance)
   */
  constructor(name) {
    this.name = name;
    this.balance = 0;
  }
}

/**
 * Invoker: Bank
 *
 * Manages command creation, execution, and history.
 * This is the "Invoker" in Command pattern terminology.
 *
 * PATTERN ROLE: Invoker
 *
 * RESPONSIBILITIES:
 * 1. Create appropriate commands based on request
 * 2. Execute commands
 * 3. Maintain command history
 * 4. Provide command log/display
 *
 * KEY CONCEPT:
 * The invoker doesn't know HOW commands execute.
 * It just calls cmd.execute() polymorphically.
 *
 * BENEFITS:
 * - Can add logging without changing commands
 * - Can add validation before execution
 * - Can queue commands for later execution
 * - Can replay command history
 */
class Bank {
  /**
   * Initialize bank with empty command history
   *
   * commands array serves as:
   * - Operation log (audit trail)
   * - Command history (for potential undo)
   * - Execution queue (could delay execution)
   */
  constructor() {
    this.commands = [];  // History of all executed commands
  }

  /**
   * Execute a banking operation
   *
   * This method demonstrates the Command pattern's key benefit:
   * The complex logic of "which command to create" is isolated here.
   * Once created, command execution is simple: cmd.execute()
   *
   * @param {BankAccount} account - Account to operate on
   * @param {number} value - Amount (positive = income, negative = withdraw)
   *
   * COMMAND PATTERN IN ACTION:
   *
   * 1. DETERMINE COMMAND TYPE:
   *    - Negative value → Withdraw command
   *    - Positive value → Income command
   *
   * 2. CREATE COMMAND:
   *    - new Command(receiver, parameters)
   *    - Command encapsulates operation
   *
   * 3. EXECUTE COMMAND:
   *    - command.execute()
   *    - Polymorphic call (don't know which command type)
   *
   * 4. STORE COMMAND:
   *    - this.commands.push(command)
   *    - Maintains history for logging/auditing
   *
   * EXECUTION FLOW:
   * operation(account, -100)
   *   → Command = Withdraw (negative value)
   *   → command = new Withdraw(account, 100)
   *   → command.execute() → account.balance -= 100
   *   → commands.push(command) → history updated
   */
  operation(account, value) {
    // Select command type based on value sign
    const Command = value < 0 ? Withdraw : Income;
    
    // Create command with receiver and parameters
    // Use Math.abs() because both commands expect positive amounts
    const command = new Command(account, Math.abs(value));
    
    // Execute command immediately
    command.execute();
    
    // Store in history (enables logging, auditing)
    // LIMITATION: Can't undo because execute() already modified state
    // FIX: Store BEFORE execute, or add undo() (see 2-undo.js)
    this.commands.push(command);
  }

  /**
   * Display all executed operations
   *
   * Demonstrates one benefit of Command pattern: operation history.
   * Commands are objects, so we can inspect them after execution.
   *
   * OUTPUT FORMAT:
   * ┌─────────┬───────────┬──────────────────┬────────┐
   * │ (index) │ operation │     account      │ amount │
   * ├─────────┼───────────┼──────────────────┼────────┤
   * │    0    │ 'Income'  │ 'Marcus Aurelius'│  1000  │
   * │    1    │ 'Withdraw'│ 'Marcus Aurelius'│   50   │
   * └─────────┴───────────┴──────────────────┴────────┘
   *
   * BENEFITS:
   * - Audit trail: See all operations performed
   * - Debugging: Understand state changes
   * - Analysis: Business intelligence on operations
   * - Replay: Could re-execute commands if needed
   */
  showOperations() {
    const output = [];
    // Transform commands into display format
    for (const command of this.commands) {
      output.push({
        operation: command.constructor.name,  // Withdraw or Income
        account: command.account.name,         // Account name
        amount: command.amount,                // Amount
      });
    }
    console.table(output);
  }
}

// ===========================
// Usage Examples
// ===========================

/**
 * Create invoker (Bank)
 *
 * The bank is the "Invoker" - it manages commands
 */
const bank = new Bank();

/**
 * Create receivers (BankAccounts)
 *
 * Accounts are "Receivers" - they are operated on by commands
 */
const account1 = new BankAccount('Marcus Aurelius');

/**
 * Execute operations via Bank (Invoker)
 *
 * TRADITIONAL APPROACH (without pattern):
 *   account1.deposit(1000);
 *   account1.withdraw(50);
 *
 * COMMAND PATTERN APPROACH:
 *   bank.operation(account1, 1000);   → Creates Income command
 *   bank.operation(account1, -50);    → Creates Withdraw command
 *
 * DIFFERENCE:
 * - Traditional: Direct method calls, no history
 * - Command: Operations as objects, history maintained
 */
bank.operation(account1, 1000);   // +1000 → Balance: 1000
bank.operation(account1, -50);    // -50   → Balance: 950

/**
 * Create another account and perform operations
 */
const account2 = new BankAccount('Antoninus Pius');
bank.operation(account2, 500);    // +500  → Balance: 500
bank.operation(account2, -100);   // -100  → Balance: 400
bank.operation(account2, 150);    // +150  → Balance: 550

/**
 * Display operation history
 *
 * Shows all 5 commands that were executed:
 * 1. Income(Marcus, 1000)
 * 2. Withdraw(Marcus, 50)
 * 3. Income(Antoninus, 500)
 * 4. Withdraw(Antoninus, 100)
 * 5. Income(Antoninus, 150)
 */
bank.showOperations();

/**
 * Display final account states
 *
 * account1: { name: 'Marcus Aurelius', balance: 950 }
 * account2: { name: 'Antoninus Pius', balance: 550 }
 */
console.table([account1, account2]);

/**
 * WHAT THIS FILE DEMONSTRATES:
 *
 * 1. ENCAPSULATION:
 *    Operations (withdraw, income) are encapsulated as objects
 *
 * 2. DECOUPLING:
 *    Bank (invoker) doesn't know how commands execute
 *    BankAccount (receiver) doesn't know about commands
 *
 * 3. POLYMORPHISM:
 *    bank.operation() works with any AccountCommand
 *    Same execute() interface for all commands
 *
 * 4. HISTORY:
 *    All operations logged in commands array
 *    Can be displayed, analyzed, or replayed
 *
 * 5. SINGLE RESPONSIBILITY:
 *    - Command: Encapsulates operation
 *    - BankAccount: Maintains state
 *    - Bank: Manages commands
 *
 * LIMITATIONS OF THIS VERSION:
 *
 * ❌ No undo: Can't reverse operations
 * ❌ No validation: Withdrawals can overdraft
 * ❌ Immediate execution: Can't queue for later
 * ❌ No error handling: Exceptions not caught
 *
 * NEXT FILE (2-undo.js):
 * Adds undo() method to commands for reversible operations
 */

/**
 * PATTERN EVOLUTION PREVIEW:
 *
 * 1-execute.js (this):  Basic execute()
 * 2-undo.js:           + undo() method
 * 3-anemic.js:         ⚠️ Anti-pattern (no behavior)
 * 4-operations.js:     + validation, operation registry
 * 5-undo.js:           Registry + undo support
 * 6-js-way.js:         Functional, JavaScript-idiomatic
 */
