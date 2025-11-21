# Command Pattern

## Overview

The **Command Pattern** encapsulates a request as an object, thereby allowing you to parameterize clients with different requests, queue or log requests, and support undoable operations. It turns method calls into standalone objects that contain all information about the request.

## Problem Statement

### Direct Method Calls Create Tight Coupling

Without the Command pattern, operations are tightly coupled to their execution:

```javascript
// ❌ ANTI-PATTERN: Direct method calls
class BankAccount {
  constructor(name) {
    this.name = name;
    this.balance = 0;
  }
  
  withdraw(amount) {
    this.balance -= amount;
  }
  
  deposit(amount) {
    this.balance += amount;
  }
}

// Problems:
const account = new BankAccount('Marcus');
account.withdraw(100);  // How do we undo this?
account.deposit(50);    // How do we log this?
// No history, no undo, operations are immediate and untrackable
```

**Problems:**
1. **No undo/redo**: Can't reverse operations
2. **No logging**: Can't track what happened
3. **No queuing**: Can't defer execution
4. **No validation**: Operations execute immediately
5. **No history**: Can't replay operations
6. **Tight coupling**: Caller must know receiver's interface

## Solution: Command Pattern

Encapsulate each operation as a Command object:

```javascript
// Request as object
const command = {
  operation: 'withdraw',
  account: 'Marcus',
  amount: 100
};

// Execute
execute(command);

// Undo
undo(command);

// Log
history.push(command);
```

### Pattern Structure

```
Client → creates → Command → execute() → Receiver
                   ↓
                 Invoker
                (stores,
                 queues,
                 executes)
```

**Participants:**

1. **Command**: Encapsulates the operation
2. **Receiver**: The object that performs the work (BankAccount)
3. **Invoker**: Stores and executes commands (Bank)
4. **Client**: Creates commands and associates with receivers

## Core Concepts

### 1. Command as Object

Transform method call into object:

```javascript
// Traditional
account.withdraw(100);

// Command Pattern
const command = new WithdrawCommand(account, 100);
command.execute();
```

### 2. Undo/Redo Support

Commands know how to reverse themselves:

```javascript
class WithdrawCommand {
  execute() {
    this.account.balance -= this.amount;
  }
  
  undo() {
    this.account.balance += this.amount;  // Reverse operation
  }
}
```

### 3. Command Queue

Commands can be queued and executed later:

```javascript
class Invoker {
  constructor() {
    this.commands = [];
  }
  
  addCommand(command) {
    this.commands.push(command);
  }
  
  executeAll() {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }
}
```

### 4. Command History

Track all executed commands:

```javascript
class CommandHistory {
  constructor() {
    this.history = [];
    this.position = -1;
  }
  
  execute(command) {
    command.execute();
    this.history.push(command);
    this.position++;
  }
  
  undo() {
    if (this.position >= 0) {
      this.history[this.position].undo();
      this.position--;
    }
  }
  
  redo() {
    if (this.position < this.history.length - 1) {
      this.position++;
      this.history[this.position].execute();
    }
  }
}
```

## Implementation Variants

### 1. Classical OOP Command (1-execute.js, 2-undo.js)

Traditional Gang of Four implementation with command classes:

```javascript
// Abstract Command
class AccountCommand {
  constructor(account, amount) {
    this.account = account;  // Receiver
    this.amount = amount;     // Parameters
  }
  
  execute() {
    throw new Error('Not implemented');
  }
  
  undo() {
    throw new Error('Not implemented');
  }
}

// Concrete Commands
class Withdraw extends AccountCommand {
  execute() {
    this.account.balance -= this.amount;
  }
  
  undo() {
    this.account.balance += this.amount;  // Reverse
  }
}

class Income extends AccountCommand {
  execute() {
    this.account.balance += this.amount;
  }
  
  undo() {
    this.account.balance -= this.amount;  // Reverse
  }
}
```

**Characteristics:**
- ✅ Clear separation: Each command is a class
- ✅ Type safety: Can check command type
- ✅ Polymorphism: All commands share interface
- ✅ Encapsulation: Command contains all needed data
- ❌ Verbose: Requires class per command type

### 2. Anemic Domain Model (3-anemic.js) - ANTI-PATTERN

Commands are just data, no behavior:

```javascript
// ❌ ANTI-PATTERN: Anemic command
class AccountCommand {
  constructor(operation, account, amount) {
    this.operation = operation;  // Just data
    this.account = account;
    this.amount = amount;
    // NO execute() or undo() methods!
  }
}

// Logic in Bank class
class Bank {
  operation(account, value) {
    // ...
    account.balance += amount;  // Direct manipulation
  }
}
```

**Why This Is Bad:**
- ❌ Violates OOP principles (data without behavior)
- ❌ No command interface (can't call execute())
- ❌ Logic scattered in Bank class
- ❌ Can't extend with new command types easily
- ❌ Hard to add undo (no undo() method)

### 3. Operation Registry (4-operations.js, 5-undo.js)

Commands as data + operation registry:

```javascript
// Command as plain data
const command = {
  operation: 'withdraw',
  account: 'Marcus',
  amount: 100
};

// Operations registry (strategy objects)
const OPERATIONS = {
  withdraw: {
    execute: (cmd) => { /* logic */ },
    undo: (cmd) => { /* reverse logic */ },
    validate: (cmd) => { /* check if allowed */ }
  },
  income: {
    execute: (cmd) => { /* logic */ },
    undo: (cmd) => { /* reverse logic */ }
  }
};

// Execution
OPERATIONS[command.operation].execute(command);
```

**Characteristics:**
- ✅ Centralized operation logic
- ✅ Easy to add new operations (just add to registry)
- ✅ Commands are lightweight (plain objects)
- ✅ Functional style (operations as functions)
- ❌ Less type safety
- ❌ Registry must be maintained

### 4. JavaScript-Idiomatic (6-js-way.js)

Fully functional approach with plain objects:

```javascript
// No command classes - just plain objects
const command = { operation, account, amount };

// Operations as object methods
const OPERATIONS = {
  withdraw: {
    execute: (cmd) => { /* ... */ },
    undo: (cmd) => { /* ... */ }
  }
};

// Simple registry access
const { execute, undo } = OPERATIONS[operation];
```

**Characteristics:**
- ✅ Minimal boilerplate
- ✅ Plain JavaScript objects
- ✅ Functional programming style
- ✅ Easy to serialize (commands are plain data)
- ✅ Memory efficient
- ✅ Idiomatic JavaScript

## Key Features

### 1. Encapsulation

Command encapsulates:
- **Operation** to perform
- **Receiver** to operate on
- **Parameters** for the operation
- **How to execute** the operation
- **How to undo** the operation

```javascript
const command = {
  operation: 'withdraw',  // What
  account: 'Marcus',      // Who (receiver)
  amount: 100,            // Parameters
  execute: () => { },     // How
  undo: () => { }         // Reverse
};
```

### 2. Parameterization

Same invoker, different commands:

```javascript
invoker.execute(withdrawCommand);
invoker.execute(depositCommand);
invoker.execute(transferCommand);
```

### 3. Queueing

Commands can be queued for later execution:

```javascript
const queue = [];
queue.push(command1);
queue.push(command2);

// Execute later
queue.forEach(cmd => cmd.execute());
```

### 4. Logging

Commands provide audit trail:

```javascript
const log = [];
function executeWithLogging(command) {
  log.push({
    timestamp: Date.now(),
    command: command.toString(),
  });
  command.execute();
}
```

### 5. Undo/Redo

Reverse operations:

```javascript
const history = [];
let position = -1;

function execute(command) {
  command.execute();
  history.push(command);
  position++;
}

function undo() {
  if (position >= 0) {
    history[position].undo();
    position--;
  }
}

function redo() {
  if (position < history.length - 1) {
    position++;
    history[position].execute();
  }
}
```

### 6. Macro Commands

Composite command that executes multiple commands:

```javascript
class MacroCommand {
  constructor() {
    this.commands = [];
  }
  
  add(command) {
    this.commands.push(command);
  }
  
  execute() {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }
  
  undo() {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

// Usage
const macro = new MacroCommand();
macro.add(new WithdrawCommand(account1, 100));
macro.add(new DepositCommand(account2, 100));
macro.execute();  // Transfer money
macro.undo();     // Reverse transfer
```

## Benefits

### 1. **Decoupling**
Invoker doesn't need to know receiver details:
```javascript
invoker.execute(command);  // Don't know what command does
```

### 2. **Extensibility**
Add new command types without changing invoker:
```javascript
// Add new command type
OPERATIONS.transfer = {
  execute: (cmd) => { /* transfer logic */ },
  undo: (cmd) => { /* reverse transfer */ }
};
```

### 3. **Undo/Redo**
Easy to implement reversible operations:
```javascript
command.execute();  // Do
command.undo();     // Undo
command.execute();  // Redo
```

### 4. **Logging & Audit**
Commands provide complete operation history:
```javascript
history.forEach(cmd => {
  console.log(`${cmd.operation} on ${cmd.account}: ${cmd.amount}`);
});
```

### 5. **Delayed Execution**
Commands can be created now, executed later:
```javascript
const commands = [cmd1, cmd2, cmd3];
setTimeout(() => {
  commands.forEach(cmd => cmd.execute());
}, 1000);
```

### 6. **Transaction Support**
Group commands into transactions:
```javascript
class Transaction {
  execute() {
    try {
      this.commands.forEach(cmd => cmd.execute());
    } catch (error) {
      this.rollback();
    }
  }
  
  rollback() {
    // Undo all executed commands in reverse
    for (let i = this.executed.length - 1; i >= 0; i--) {
      this.executed[i].undo();
    }
  }
}
```

## Real-World Use Cases

### 1. **Text Editor** (Undo/Redo)

```javascript
const editor = {
  commands: [],
  position: -1,
  
  execute(command) {
    command.execute();
    this.commands = this.commands.slice(0, this.position + 1);
    this.commands.push(command);
    this.position++;
  },
  
  undo() {
    if (this.position >= 0) {
      this.commands[this.position].undo();
      this.position--;
    }
  },
  
  redo() {
    if (this.position < this.commands.length - 1) {
      this.position++;
      this.commands[this.position].execute();
    }
  }
};

// Commands
const insertText = new InsertCommand(editor, 'Hello');
const deleteText = new DeleteCommand(editor, 5);
```

### 2. **Task Queue**

```javascript
class TaskQueue {
  constructor() {
    this.queue = [];
  }
  
  enqueue(command) {
    this.queue.push(command);
  }
  
  async processAll() {
    while (this.queue.length > 0) {
      const command = this.queue.shift();
      await command.execute();
    }
  }
}

// Usage
taskQueue.enqueue(new SendEmailCommand(email));
taskQueue.enqueue(new UpdateDatabaseCommand(data));
taskQueue.enqueue(new NotifyUsersCommand(users));
```

### 3. **Remote Procedure Call**

```javascript
// Client creates command
const command = {
  method: 'updateUser',
  params: { id: 123, name: 'Marcus' }
};

// Serialize and send to server
const serialized = JSON.stringify(command);
socket.send(serialized);

// Server deserializes and executes
const cmd = JSON.parse(serialized);
const result = await OPERATIONS[cmd.method](cmd.params);
```

### 4. **Transaction Script**

```javascript
class TransferCommand {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
  }
  
  execute() {
    this.from.balance -= this.amount;
    this.to.balance += this.amount;
  }
  
  undo() {
    this.from.balance += this.amount;
    this.to.balance -= this.amount;
  }
}
```

### 5. **Macro Recording**

```javascript
class MacroRecorder {
  constructor() {
    this.recording = false;
    this.macro = [];
  }
  
  startRecording() {
    this.recording = true;
    this.macro = [];
  }
  
  execute(command) {
    command.execute();
    if (this.recording) {
      this.macro.push(command);
    }
  }
  
  stopRecording() {
    this.recording = false;
    return new MacroCommand(this.macro);
  }
}
```

### 6. **Game Actions**

```javascript
// Turn-based game
class GameEngine {
  constructor() {
    this.actions = [];
  }
  
  performAction(action) {
    action.execute();
    this.actions.push(action);
  }
  
  replay() {
    this.actions.forEach(action => {
      action.execute();
    });
  }
  
  undoLastTurn() {
    const lastActions = this.getLastTurnActions();
    lastActions.reverse().forEach(action => {
      action.undo();
    });
  }
}
```

## Implementation Approaches

### Traditional OOP (1-execute.js, 2-undo.js)

```javascript
// Command hierarchy
class Command {
  execute() { }
  undo() { }
}

class ConcreteCommand extends Command {
  execute() { /* specific logic */ }
  undo() { /* reverse logic */ }
}

// Invoker
class Invoker {
  execute(command) {
    command.execute();
    this.history.push(command);
  }
}
```

**When to use:**
- Need strong typing
- Complex commands with state
- Inheritance beneficial
- Team prefers OOP

### Functional Registry (4-operations.js, 5-undo.js)

```javascript
// Command as data
const command = {
  operation: 'withdraw',
  account: 'Marcus',
  amount: 100
};

// Operations registry
const OPERATIONS = {
  withdraw: {
    execute: (cmd) => { /* logic */ },
    undo: (cmd) => { /* reverse */ }
  }
};

// Execution
OPERATIONS[command.operation].execute(command);
```

**When to use:**
- Many similar commands
- Commands are data-driven
- Need serialization
- Functional programming style

### Plain JavaScript (6-js-way.js)

```javascript
// No classes - just objects and functions
const accounts = new Map();

const OPERATIONS = {
  withdraw: {
    execute: (cmd) => {
      const acc = accounts.get(cmd.account);
      acc.balance -= cmd.amount;
    },
    undo: (cmd) => {
      const acc = accounts.get(cmd.account);
      acc.balance += cmd.amount;
    }
  }
};
```

**When to use:**
- Simplicity over formality
- Idiomatic JavaScript
- No need for classes
- Minimal overhead

## GRASP Principles Applied

### 1. **Information Expert**
Command has information to execute operation:
```javascript
class Command {
  constructor(receiver, params) {
    this.receiver = receiver;  // Has receiver
    this.params = params;       // Has parameters
  }
  
  execute() {
    // Has information to execute
    this.receiver.method(this.params);
  }
}
```

### 2. **Low Coupling**
Invoker doesn't know receiver:
```javascript
invoker.execute(command);  // Invoker doesn't know about receiver
```

### 3. **High Cohesion**
Each command has single, focused responsibility:
```javascript
class WithdrawCommand {
  // Only knows how to withdraw
}
```

### 4. **Indirection**
Command provides indirection between invoker and receiver:
```javascript
Invoker → Command → Receiver
(doesn't know receiver details)
```

### 5. **Polymorphism**
Different commands, same interface:
```javascript
commands.forEach(cmd => cmd.execute());  // Polymorphic
```

## Command Pattern vs Other Patterns

### Command vs Strategy

| Aspect | Command | Strategy |
|--------|---------|----------|
| **Purpose** | Encapsulate request | Encapsulate algorithm |
| **Execution** | Deferred, queued, logged | Immediate |
| **Undo** | Supports undo/redo | No undo |
| **History** | Maintains history | No history |
| **Use Case** | Actions, transactions | Algorithm selection |

### Command vs Memento

| Aspect | Command | Memento |
|--------|---------|---------|
| **Stores** | Operation details | State snapshot |
| **Undo** | Re-execute reverse | Restore state |
| **Size** | Small (operation) | Large (full state) |
| **Use Case** | Discrete actions | State restoration |

### Command vs Observer

| Aspect | Command | Observer |
|--------|---------|----------|
| **Direction** | Invoker → Command → Receiver | Subject → Observers |
| **Coupling** | Decouples request/receiver | Decouples subject/observers |
| **Execution** | Single receiver | Multiple observers |
| **Purpose** | Encapsulate request | Notify dependents |

## Best Practices

### 1. **Immutable Commands**

```javascript
class Command {
  constructor(receiver, params) {
    this.receiver = Object.freeze(receiver);
    this.params = Object.freeze(params);
  }
}
```

### 2. **Command Validation**

```javascript
class Command {
  validate() {
    // Check if command can be executed
    if (!this.canExecute()) {
      throw new Error('Command validation failed');
    }
  }
  
  execute() {
    this.validate();
    // Execute logic
  }
}
```

### 3. **Compensation vs Undo**

```javascript
// Undo: Reverse operation
class Withdraw {
  undo() {
    this.account.balance += this.amount;  // Simple reversal
  }
}

// Compensation: More complex reversal
class ComplexCommand {
  undo() {
    // Might need to compensate differently
    // Example: Refund with interest
    this.account.balance += this.amount * 1.1;
  }
}
```

### 4. **Error Handling**

```javascript
class Command {
  execute() {
    try {
      this.doExecute();
      this.executed = true;
    } catch (error) {
      this.error = error;
      throw error;
    }
  }
  
  undo() {
    if (!this.executed) {
      throw new Error('Cannot undo unexecuted command');
    }
    this.doUndo();
  }
}
```

### 5. **Command Lifecycle**

```javascript
class Command {
  constructor() {
    this.state = 'created';
  }
  
  execute() {
    if (this.state !== 'created' && this.state !== 'undone') {
      throw new Error('Invalid state for execute');
    }
    this.doExecute();
    this.state = 'executed';
  }
  
  undo() {
    if (this.state !== 'executed') {
      throw new Error('Invalid state for undo');
    }
    this.doUndo();
    this.state = 'undone';
  }
}
```

## Anti-Patterns to Avoid

### ❌ 1. Anemic Commands

```javascript
// BAD: Just data, no behavior
class Command {
  constructor(data) {
    this.data = data;  // Only data
  }
  // No execute(), no undo()
}
```

### ❌ 2. God Command

```javascript
// BAD: Command does everything
class SuperCommand {
  execute() {
    this.validateUser();
    this.checkPermissions();
    this.processPayment();
    this.updateDatabase();
    this.sendEmail();
    this.logOperation();
  }
}
```

### ❌ 3. Stateful Commands

```javascript
// BAD: Command holds mutable state
class Command {
  execute() {
    this.executionCount++;  // Mutable state
  }
}
// Commands should be stateless or immutable
```

### ❌ 4. Missing Undo

```javascript
// BAD: execute() but no undo()
class Command {
  execute() { /* ... */ }
  // How do we undo this?
}
```

### ❌ 5. Non-Idempotent Undo

```javascript
// BAD: Undo can't be called multiple times
class Command {
  undo() {
    this.account.balance += this.amount;
    // Calling undo() twice adds amount twice!
  }
}

// Good: Track execution state
class Command {
  undo() {
    if (!this.executed) return;
    this.account.balance += this.amount;
    this.executed = false;
  }
}
```

## When to Use

### ✅ Use Command Pattern When:

1. **Undo/Redo required** (text editors, graphics programs)
2. **Operation logging** needed (audit trails)
3. **Operation queuing** required (task queues, job schedulers)
4. **Operation history** needed (replay, debugging)
5. **Deferred execution** (schedule for later)
6. **Transaction support** (all-or-nothing operations)
7. **Macro recording** (combine multiple operations)
8. **Remote execution** (RPC, message queues)

### ❌ Don't Use Command Pattern When:

1. **Simple method calls** with no special requirements
2. **No undo/redo** needed
3. **No queuing** or logging required
4. **Performance critical** (command overhead matters)
5. **Stateless operations** (use functions directly)

## Testing Strategy

### 1. **Test Command Execution**

```javascript
test('WithdrawCommand executes correctly', () => {
  const account = new BankAccount('Test');
  account.balance = 1000;
  
  const cmd = new WithdrawCommand(account, 100);
  cmd.execute();
  
  expect(account.balance).toBe(900);
});
```

### 2. **Test Command Undo**

```javascript
test('WithdrawCommand undo reverses execution', () => {
  const account = new BankAccount('Test');
  account.balance = 1000;
  
  const cmd = new WithdrawCommand(account, 100);
  cmd.execute();
  expect(account.balance).toBe(900);
  
  cmd.undo();
  expect(account.balance).toBe(1000);  // Restored
});
```

### 3. **Test Command History**

```javascript
test('Invoker maintains command history', () => {
  const invoker = new Invoker();
  const cmd1 = new Command();
  const cmd2 = new Command();
  
  invoker.execute(cmd1);
  invoker.execute(cmd2);
  
  expect(invoker.history.length).toBe(2);
  expect(invoker.history[0]).toBe(cmd1);
  expect(invoker.history[1]).toBe(cmd2);
});
```

### 4. **Test Validation**

```javascript
test('Command validates before execution', () => {
  const account = new BankAccount('Test');
  account.balance = 50;
  
  const cmd = new WithdrawCommand(account, 100);
  expect(() => cmd.execute()).toThrow('Insufficient funds');
});
```

## Summary

The Command Pattern transforms operations into first-class objects, enabling powerful features like undo/redo, logging, queuing, and transactions. It's particularly valuable when you need to decouple the requester from the executor and maintain operation history.

### Key Takeaways:

1. **Operations as Objects**: Method calls become objects
2. **Encapsulation**: Command contains all operation data
3. **Decoupling**: Invoker independent of receiver
4. **Undo/Redo**: Commands know how to reverse themselves
5. **History**: Natural audit trail
6. **Queueing**: Commands can be stored and executed later
7. **Flexibility**: Easy to add new command types

### Pattern Evolution:

```
1-execute.js   → Basic execute() only
                 ↓
2-undo.js      → Add undo() support
                 ↓
3-anemic.js    → ⚠️ ANTI-PATTERN (data without behavior)
                 ↓
4-operations.js → Operation registry with validation
                 ↓
5-undo.js      → Operation registry with undo
                 ↓
6-js-way.js    → JavaScript-idiomatic (plain objects + functions)
```

### Implementation Choice:

- **Use OOP (1-2)**: Complex commands, strong typing, inheritance
- **Use Registry (4-5)**: Many similar commands, data-driven
- **Use Functional (6)**: Simplicity, idiomatic JavaScript, serialization

The Command Pattern is fundamental to many applications, from text editors (undo/redo) to task queues to transaction systems. Understanding it enables building robust, flexible systems with operation history and reversibility.