
# Chain of Responsibility Pattern

## Overview

The **Chain of Responsibility** pattern decouples the sender of a request from its receivers by giving multiple objects a chance to handle the request. Handlers are chained together, and each handler either processes the request or passes it to the next handler in the chain.

## Problem Statement

### Tight Coupling Between Request Sender and Handler

Without the pattern, you end up with tightly coupled conditional logic:

```javascript
// ❌ ANTI-PATTERN: Tight coupling with if-else chains
function processValue(value) {
  if (typeof value === 'number') {
    return value.toString();
  } else if (Array.isArray(value)) {
    return value.reduce((a, b) => a + b);
  } else if (value instanceof Set) {
    return [...value].reduce((a, b) => a + b);
  } else if (value instanceof Object) {
    // Handle object
  } else {
    throw new Error('Unsupported type');
  }
}
```

**Problems:**
1. **Adding new handlers** requires modifying this function (violates Open/Closed Principle)
2. **Order of checks** is hard-coded and inflexible
3. **Handlers can't be reused** in different combinations
4. **Testing** requires testing entire function for each case
5. **Difficult to maintain** as conditions grow

## Solution: Chain of Responsibility

Create a chain of handler objects where each handler:
1. Tries to process the request
2. If it can't handle it, passes to the next handler
3. Chain continues until a handler processes it or chain ends

### Pattern Structure

```
Request → Handler1 → Handler2 → Handler3 → ... → HandlerN
           |           |           |              |
           ↓           ↓           ↓              ↓
        Process?    Process?    Process?      Process?
        OR Pass     OR Pass     OR Pass       OR Throw Error
```

## Core Concepts

### 1. Handler Interface

Each handler must implement:
- **Process method**: Attempts to handle the request
- **Next reference**: Link to next handler in chain
- **Pass mechanism**: Way to forward request to next handler

```javascript
class Handler {
  constructor() {
    this.next = null;  // Reference to next handler
  }
  
  handle(request, next) {
    // Try to process
    if (canHandle(request)) {
      return process(request);
    }
    // Pass to next
    return next();
  }
}
```

### 2. Chain Builder

Manages the chain construction and request processing:

```javascript
class Chain {
  constructor() {
    this.first = null;  // Start of chain
    this.last = null;   // End of chain (for efficient adding)
  }
  
  add(handler) {
    if (!this.first) this.first = handler;
    else this.last.next = handler;
    this.last = handler;
    return this;  // Enable fluent API
  }
  
  process(request) {
    // Traverse chain until handled
    let current = this.first;
    while (current) {
      const result = current.handle(request);
      if (result !== undefined) return result;
      current = current.next;
    }
    throw new Error('No handler found');
  }
}
```

### 3. Request Flow

```
          ┌──────────────────────────────────────┐
          │         Sender.process(100)          │
          └─────────────────┬────────────────────┘
                            │
                            ▼
          ┌─────────────────────────────────────┐
          │  Handler1: NumberHandler            │
          │  - Check: typeof value === 'number' │
          │  - Match! Process and return        │
          └─────────────────────────────────────┘
          
          (Request handled, no further propagation)


          ┌──────────────────────────────────────┐
          │      Sender.process([1,2,3])         │
          └─────────────────┬────────────────────┘
                            │
                            ▼
          ┌─────────────────────────────────────┐
          │  Handler1: NumberHandler            │
          │  - Check: typeof value === 'number' │
          │  - No match, call next()            │
          └─────────────────┬───────────────────┘
                            │
                            ▼
          ┌─────────────────────────────────────┐
          │  Handler2: ArrayHandler             │
          │  - Check: Array.isArray(value)      │
          │  - Match! Process and return        │
          └─────────────────────────────────────┘
```

## Implementation Variants

### 1. Classical OOP Implementation (1-theory.js)

Traditional Gang of Four style with abstract base class:

```javascript
class AbstractHandler {
  constructor() {
    this.next = null;
  }
  
  method(value) {
    throw new Error('Method not implemented');
  }
}

class ConcreteHandler extends AbstractHandler {
  method(value, next) {
    if (canHandle(value)) {
      return process(value);
    }
    return next();  // Pass to next handler
  }
}
```

**Characteristics:**
- ✅ Clear abstraction hierarchy
- ✅ Type safety through inheritance
- ✅ Enforces handler contract
- ❌ More boilerplate code
- ❌ Less flexible (class-based)

### 2. Functional JavaScript Implementation (2-simple.js)

Simplified approach using functions:

```javascript
class Handler {
  constructor(fn) {
    this.fn = fn;      // Handler function
    this.next = null;
  }
}

// Usage
chain.add((value, next) => {
  if (canHandle(value)) return process(value);
  return next();
});
```

**Characteristics:**
- ✅ More idiomatic JavaScript
- ✅ Less boilerplate
- ✅ Easier to create ad-hoc handlers
- ✅ Functions are first-class citizens
- ❌ No type enforcement

### 3. Type-Based Dispatch (3-adder.js)

Handlers check type/instanceof for matching:

```javascript
class TypeHandler {
  constructor(type, processor) {
    this.type = type;        // Type to match
    this.processor = processor;
    this.next = null;
  }
}

// Usage
chain.add(new TypeHandler(Array, (arr) => arr.reduce(sum)))
     .add(new TypeHandler(Set, (set) => [...set].reduce(sum)));
```

**Characteristics:**
- ✅ Explicit type checking
- ✅ Works well with polymorphic data
- ✅ Clear handler selection criteria
- ❌ Limited to type-based decisions

### 4. Middleware Pattern (4-server.js)

HTTP server middleware chain (Express.js style):

```javascript
class Server {
  constructor() {
    this.handlers = [];
  }
  
  use(handler) {
    this.handlers.push(handler);
    return this;
  }
  
  async handle(req, res) {
    for (const handler of this.handlers) {
      await handler(req, res);
    }
  }
}
```

**Characteristics:**
- ✅ Real-world application pattern
- ✅ Used in Express, Koa, Redux
- ✅ Can modify request/response
- ✅ Supports async operations

## Key Features

### 1. Dynamic Chain Construction

Chain can be built at runtime:

```javascript
const chain = new Chain();

if (needsValidation) {
  chain.add(validator);
}

if (needsAuthentication) {
  chain.add(authenticator);
}

chain.add(processor);
```

### 2. Flexible Handler Order

Same handlers, different orders produce different behavior:

```javascript
// Strict validation first
const strictChain = new Chain()
  .add(strictValidator)
  .add(normalizer)
  .add(processor);

// Normalize before validation
const lenientChain = new Chain()
  .add(normalizer)
  .add(strictValidator)
  .add(processor);
```

### 3. Early Exit

Chain stops when handler processes request:

```javascript
handler1 -> handler2 (✓ processed) -> [handler3 never called]
```

### 4. Pass-Through Capability

Handlers can modify request and pass it along:

```javascript
class Logger extends Handler {
  handle(req, next) {
    console.log('Processing:', req);
    return next();  // Pass modified req to next
  }
}
```

## Benefits

### 1. **Decoupling**
Sender doesn't know which handler will process the request:
```javascript
sender.process(value);  // Don't care who handles it
```

### 2. **Flexibility**
Easy to add/remove/reorder handlers:
```javascript
chain.add(newHandler);  // Add without changing existing code
```

### 3. **Single Responsibility**
Each handler does one thing:
```javascript
class NumberHandler {
  // Only handles numbers, nothing else
}
```

### 4. **Open/Closed Principle**
Open for extension (add handlers), closed for modification:
```javascript
// Add new handler without modifying Chain class
chain.add(new CustomHandler());
```

### 5. **Reusability**
Handlers can be used in different chains:
```javascript
const handler = new ValidationHandler();
chain1.add(handler);
chain2.add(handler);
```

## Real-World Use Cases

### 1. **HTTP Middleware** (Express.js, Koa.js)

```javascript
app.use(logger);           // Log all requests
app.use(authentication);   // Check if authenticated
app.use(authorization);    // Check permissions
app.use(rateLimit);        // Rate limiting
app.use(handler);          // Actual request handler
```

### 2. **Event Handling** (DOM events)

```javascript
element
  ├── captureHandler1
  ├── captureHandler2
  └── bubbleHandler
```

### 3. **Validation Pipeline**

```javascript
const validation = new Chain()
  .add(requiredFieldsValidator)
  .add(typeValidator)
  .add(rangeValidator)
  .add(businessRuleValidator);

validation.process(formData);
```

### 4. **Logging Levels**

```javascript
const logger = new Chain()
  .add(new LogHandler('DEBUG', debugLogger))
  .add(new LogHandler('INFO', infoLogger))
  .add(new LogHandler('ERROR', errorLogger));

logger.log({ level: 'ERROR', message: 'Something failed' });
```

### 5. **Command Processing**

```javascript
const commandChain = new Chain()
