'use strict';

/**
 * FILE PURPOSE: Classical Mediator Pattern (GoF Implementation)
 *
 * Demonstrates Mediator pattern with abstract base classes.
 * Employee and Manager communicate through Messenger mediator.
 *
 * COMMUNICATION FLOW:
 * Employee.send('Ping') → Messenger.send() → Manager.notify('Ping')
 * Manager.send('Pong') → Messenger.send() → Employee.notify('Pong')
 *
 * KEY PATTERN ELEMENTS:
 * - Abstract Colleague (knows mediator, has send/notify interface)
 * - Abstract Mediator (defines send interface)
 * - Concrete Colleagues (Employee, Manager)
 * - Concrete Mediator (Messenger - routes messages)
 */

// ========================================
// Abstract Base Classes
// ========================================

/**
 * Colleague Base Class
 *
 * Colleagues communicate through mediator, not directly.
 * Each colleague knows its mediator, mediator knows all colleagues.
 */
class Colleague {
  constructor(mediator) {
    // Prevent abstract class instantiation
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === Colleague) {
      throw new Error('Abstract class should not be instanciated');
    }
    this.mediator = mediator;  // Reference to mediator
  }

  /**
   * Send message via mediator
   * Delegates to mediator.send() which handles routing
   */
  send(message) {
    this.mediator.send(message, this);  // Pass self as sender
  }

  /**
   * Receive notification from mediator
   * Abstract method - must be implemented by subclasses
   */
  notify(message) {
    const entity = this.constructor.name;
    const s = JSON.stringify({ notify: message });
    throw new Error(`Method "notify" is not implemented for ${entity}: ${s}`);
  }
}

/**
 * Mediator Base Class
 *
 * Defines interface for routing messages between colleagues.
 */
class Mediator {
  /**
   * Route message from sender to appropriate receiver(s)
   * Abstract method - concrete mediators implement routing logic
   */
  send(message, sender) {
    const entity = this.constructor.name;
    const s = JSON.stringify({ send: { message, sender } });
    throw new Error(`Method "send" is not implemented for ${entity}: ${s}`);
  }
}

// ========================================
// Concrete Colleagues
// ========================================

/**
 * Employee Colleague
 *
 * Registers itself with mediator on construction.
 * Communicates with Manager through Messenger mediator.
 */
class Employee extends Colleague {
  constructor(mediator) {
    super(mediator);
    mediator.employee = this;  // Register with mediator
  }

  /**
   * Handle incoming message from mediator
   */
  notify(message) {
    const entity = this.constructor.name;
    console.log(`${entity} gets message: ${message}`);
  }
}

/**
 * Manager Colleague
 *
 * Registers itself with mediator on construction.
 * Communicates with Employee through Messenger mediator.
 */
class Manager extends Colleague {
  constructor(mediator) {
    super(mediator);
    mediator.manager = this;  // Register with mediator
  }

  /**
   * Handle incoming message from mediator
   */
  notify(message) {
    const entity = this.constructor.name;
    console.log(`${entity} gets message: ${message}`);
  }
}

// ========================================
// Concrete Mediator
// ========================================

/**
 * Messenger Mediator
 *
 * Routes messages between Employee and Manager.
 * Knows both colleagues and implements routing logic.
 *
 * ROUTING STRATEGY:
 * - If sender is Manager → route to Employee
 * - If sender is Employee → route to Manager
 *
 * This implements the coordination logic that would otherwise
 * be scattered across Employee and Manager classes.
 */
class Messenger extends Mediator {
  constructor() {
    super();
    this.employee = null;  // Will be set by Employee constructor
    this.manager = null;   // Will be set by Manager constructor
  }

  /**
   * Route message to appropriate colleague
   *
   * ROUTING LOGIC:
   * Determines target based on sender identity.
   * Calls target.notify() to deliver message.
   */
  send(message, sender) {
    const { employee, manager } = this;
    const target = sender === manager ? employee : manager;  // Route to other party
    target.notify(message);  // Deliver message
  }
}

// ========================================
// Usage Example
// ========================================

/**
 * Setup: Create mediator and colleagues
 *
 * INITIALIZATION FLOW:
 * 1. Create Messenger mediator
 * 2. Create Employee (registers itself with mediator)
 * 3. Create Manager (registers itself with mediator)
 * 4. Mediator now knows both colleagues
 */
const mediator = new Messenger();
const employee = new Employee(mediator);  // Registers: mediator.employee = this
const manager = new Manager(mediator);    // Registers: mediator.manager = this
console.dir(mediator);  // Shows: { employee: Employee, manager: Manager }

/**
 * Communication via mediator
 *
 * EXECUTION: employee.send('Ping')
 * 1. Employee.send() calls mediator.send('Ping', employee)
 * 2. Messenger.send() determines target (Manager)
 * 3. Calls Manager.notify('Ping')
 * → Output: "Manager gets message: Ping"
 */
employee.send('Ping');

/**
 * EXECUTION: manager.send('Pong')
 * 1. Manager.send() calls mediator.send('Pong', manager)
 * 2. Messenger.send() determines target (Employee)
 * 3. Calls Employee.notify('Pong')
 * → Output: "Employee gets message: Pong"
 */
manager.send('Pong');

/**
 * PATTERN DEMONSTRATION:
 *
 * - Employee doesn't know Manager exists
 * - Manager doesn't know Employee exists
 * - Both only know Mediator
 * - Mediator coordinates all communication
 * - Adding new colleague type only requires changing Mediator
 *
 * NEXT FILE (2-simple.js): Removes abstract classes for simplicity
 */
