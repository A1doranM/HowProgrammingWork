# Mediator Pattern

## Overview

The **Mediator Pattern** defines an object that coordinates communication between a set of objects. Instead of objects referring to each other directly, they communicate through the mediator, reducing coupling.

## Problem: Many-to-Many Communication Complexity

Without a mediator, objects must know about and reference many other objects:

```javascript
// ❌ WITHOUT MEDIATOR: Tightly coupled
class Employee {
  constructor(manager, logger, auth) {
    this.manager = manager;    // Direct reference
    this.logger = logger;      // Direct reference  
    this.auth = auth;          // Direct reference
  }
  
  sendMessage(msg) {
    if (this.auth.check(this.id)) {
      this.logger.log('Sending: ' + msg);
      this.manager.receive(msg);  // Direct call
    }
  }
}

// Problems:
// - Employee knows 3 other objects
// - Adding new component requires changing Employee
// - Complex web of dependencies
// - Hard to test in isolation
```

## Solution: Centralized Coordination

Mediator coordinates all interactions:

```javascript
// ✅ WITH MEDIATOR: Loose coupling
class Employee {
  constructor(mediator) {
    this.mediator = mediator;  // Only knows mediator
  }
  
  sendMessage(msg) {
    this.mediator.send(msg, this);  // Mediator handles routing
  }
}

class Mediator {
  constructor() {
    this.auth = new Auth();
    this.logger = new Logger();
    this.employees = [];
  }
  
  send(msg, sender) {
    if (this.auth.check(sender.id)) {
      this.logger.log('Message: ' + msg);
      this.employees.forEach(emp => {
        if (emp !== sender) emp.notify(msg);
      });
    }
  }
}
```

## Pattern Structure

```
Colleague A ──┐
              │
Colleague B ──┼──→ Mediator ──→ Coordinates
              │                  - Auth
Colleague C ──┘                  - Logger
                                 - Business logic
```

**Key Roles:**
- **Mediator**: Coordinates communication, knows all colleagues
- **Colleagues**: Communicate via mediator, don't know each other

## Real-World Analogy

**Air Traffic Control Tower (Mediator)**
- Planes (colleagues) don't communicate directly
- All communication goes through tower
- Tower coordinates to prevent collisions
- Planes only know tower, not each other

## Implementation Variants

### 1. Classical GoF (1-theory.js, 2-simple.js)

Traditional pattern with Colleague/Mediator hierarchy.

**Communication Flow:**
```
Employee.send('Hi')
  ↓
Mediator.send('Hi', employee)
  ↓
Determine target (manager)
  ↓
Manager.notify('Hi')
```

### 2. Service Coordinator (3-auth.js, 4-js-way.js)

Mediator coordinates multiple services (Auth, Logger).

**Mediator as Facade:**
- Simplifies interaction with Auth and Logger
- Implements business logic (authentication flow)
- Colleagues don't access services directly

### 3. Collaborative Editor (5-collaborative.js, 6-js-way.js)

Real-world example: Multiple users editing same document.

**Coordination:**
- User makes edit
- Mediator applies to document
- Mediator broadcasts to other users
- Users see synchronized content

### 4. EventEmitter-Based (6-js-way.js)

Modern approach using EventEmitter as mediator.

**Pattern:**
- Mediator extends EventEmitter
- Colleagues emit events to mediator
- Mediator coordinates and broadcasts
- Decoupled via event system

## Key Benefits

### 1. Reduced Coupling

**Without Mediator:**
```
Employee → Manager
Employee → Logger
Employee → Auth
Manager → Employee
Manager → Logger
```
6 direct dependencies!

**With Mediator:**
```
Employee → Mediator
Manager → Mediator
Mediator → Logger
Mediator → Auth
```
4 dependencies, no peer coupling!

### 2. Centralized Control

All coordination logic in one place:

```javascript
class Mediator {
  send(msg, sender) {
    // All routing logic here
    // Easy to modify, debug, test
  }
}
```

### 3. Easier Maintenance

Add new colleague without changing existing ones:

```javascript
class NewColleague {
  constructor(mediator) {
    this.mediator = mediator;  // Same pattern
  }
}
// Existing colleagues unchanged!
```

## When to Use

### ✅ Use Mediator When:

1. **Many-to-many** communication between objects
2. **Complex interactions** between components
3. **Reusable components** that shouldn't be coupled
4. **Centralized control** logic beneficial
5. **UI components** coordinating (dialogs, forms)
6. **Chat systems** (mediator routes messages)
7. **Workflow coordination** (orchestrates steps)

### ❌ Don't Use When:

1. **Simple interactions** (direct calls simpler)
2. **One-to-one** communication (no coordination needed)
3. **Mediator becomes God object** (too complex)
4. **Performance critical** (extra indirection)

## Mediator vs Other Patterns

### vs Observer/EventEmitter

| Mediator | Observer |
|----------|----------|
| Centralized coordination | Decentralized notification |
| Mediator knows all colleagues | Subject doesn't know observers |
| Two-way communication | One-way notification |
| Complex routing logic | Simple broadcast |

### vs Facade

| Mediator | Facade |
|----------|--------|
| Coordinates communication | Simplifies interface |
| Colleagues know mediator | Subsystem doesn't know facade |
| Two-way interaction | One-way calls |
| Behavioral pattern | Structural pattern |

## Pattern Evolution (Files)

```
1-theory.js       → Classical GoF (abstract classes)
2-simple.js       → Simplified (no abstract base)
3-auth.js         → Practical (Auth + Logger coordination)
4-js-way.js       → Functional (Auth as IIFE module)
5-collaborative.js → Real-world (collaborative editing)
6-js-way.js       → ✅ Modern (EventEmitter-based)
```

## Summary

Mediator pattern provides centralized coordination for complex interactions. It's particularly useful when many objects need to communicate but shouldn't know about each other.

**Key Concepts:**
- Central coordinator (mediator)
- Loose colleague coupling
- Simplified communication
- Reusable components

**Modern Approach:**
Use EventEmitter as mediator for event-driven coordination.

The pattern trades direct coupling for mediator coupling - colleagues only depend on mediator, not each other.