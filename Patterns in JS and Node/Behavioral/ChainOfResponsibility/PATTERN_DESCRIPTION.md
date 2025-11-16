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
  .add(new UndoHandler())
  .add(new RedoHandler())
  .add(new SaveHandler())
  .add(new ExecuteHandler());

commandChain.process(command);
```

### 6. **Payment Processing**

```javascript
const paymentChain = new Chain()
  .add(new CreditCardHandler())
  .add(new PayPalHandler())
  .add(new CryptoHandler())
  .add(new BankTransferHandler());

paymentChain.process(paymentRequest);
```

## Pattern Variations

### 1. Pure Chain (Pass to Next)

Each handler explicitly passes to next:

```javascript
handler1(req, next) {
  if (!canHandle(req)) return next();
  return process(req);
}
```

**Used when:** Handler decides whether to handle

### 2. Pipeline (All Execute)

All handlers execute in sequence:

```javascript
for (const handler of handlers) {
  req = handler(req);  // Each transforms request
}
```

**Used when:** All handlers should process (transformations)

### 3. Responsibility with Default

Chain has default handler if none match:

```javascript
chain
  .add(handler1)
  .add(handler2)
  .setDefault(defaultHandler);  // Fallback
```

**Used when:** Always need a response

### 4. Interruptible Chain

Handlers can stop chain:

```javascript
handler(req, next) {
  if (shouldStop(req)) return { stop: true };
  return next();
}
```

**Used when:** Some conditions should halt processing

## GRASP Principles Applied

### 1. **Low Coupling**
Handlers don't know about each other or the chain structure:
```javascript
class Handler {
  // No knowledge of other handlers or chain
  handle(req, next) { /* ... */ }
}
```

### 2. **High Cohesion**
Each handler has one focused responsibility:
```javascript
class AuthenticationHandler {
  // Only handles authentication, nothing else
}
```

### 3. **Polymorphism**
Multiple handler types with same interface:
```javascript
interface Handler {
  handle(request, next): any;
}
```

### 4. **Indirection**
Chain provides indirection between sender and handlers:
```javascript
sender.process(req);  // Sender doesn't know handlers
↓
chain.traverse(handlers)
↓
handler.process(req)
```

### 5. **Protected Variations**
Easy to add new handler types without changing chain:
```javascript
// Chain doesn't care about handler implementation
chain.add(newHandlerType);
```

## Comparison with Other Patterns

### Chain of Responsibility vs Strategy

| Aspect | Chain of Responsibility | Strategy |
|--------|------------------------|----------|
| **Handler Selection** | Dynamic (traverse until match) | Pre-selected |
| **Multiple Handlers** | Yes (chain) | No (single strategy) |
| **Handler Knowledge** | Handler decides if it handles | Caller selects strategy |
| **Use Case** | Unknown handler at compile time | Known algorithm to use |

### Chain of Responsibility vs Decorator

| Aspect | Chain of Responsibility | Decorator |
|--------|------------------------|-----------|
| **Purpose** | Handle OR pass | Enhance AND delegate |
| **Execution** | One handler processes | All decorators execute |
| **Result** | Single handler's result | Combined result |
| **Example** | Event handlers | Logging wrapper |

### Chain of Responsibility vs Observer

| Aspect | Chain of Responsibility | Observer |
|--------|------------------------|----------|
| **Notification** | Sequential (one at a time) | Broadcast (all at once) |
| **Response** | One handles | All respond |
| **Stopping** | Stops when handled | All notified |
| **Use Case** | Request processing | Event notification |

## Anti-Patterns to Avoid

### ❌ 1. Infinite Chain

```javascript
// BAD: Circular reference
handler1.next = handler2;
handler2.next = handler1;  // Infinite loop!
```

**Solution:** Validate chain structure or use Set to track visited

### ❌ 2. Long Chains

```javascript
// BAD: Too many handlers
chain.add(h1).add(h2).add(h3)...add(h50);
// Performance degrades with each addition
```

**Solution:** Group related handlers, use better routing

### ❌ 3. Handler Side Effects

```javascript
// BAD: Handler modifies global state
handler(req, next) {
  globalState.counter++;  // Side effect!
  return next();
}
```

**Solution:** Keep handlers pure, pass state explicitly

### ❌ 4. Leaking Chain Structure

```javascript
// BAD: Exposing internals
getFirstHandler() {
  return this.first;  // Exposes internal chain
}
```

**Solution:** Only expose process() method

### ❌ 5. No Default Handler

```javascript
// BAD: No fallback
chain.process(req);  // Throws if no handler matches
```

**Solution:** Always have default/error handler

## Best Practices

### 1. **Use Fluent API**

```javascript
const chain = new Chain()
  .add(handler1)
  .add(handler2)
  .add(handler3);
```

### 2. **Provide next() Callback**

```javascript
handler(req, next) {
  // Handler controls when to call next
  if (!canHandle(req)) return next();
  return process(req);
}
```

### 3. **Handler Isolation**

```javascript
class Handler {
  // No dependencies on other handlers
  handle(req, next) { /* ... */ }
}
```

### 4. **Async Support**

```javascript
async handle(req, next) {
  if (!canHandle(req)) return await next();
  return await process(req);
}
```

### 5. **Error Handling**

```javascript
handler(req, next) {
  try {
    return process(req);
  } catch (error) {
    return next();  // Pass to next on error
  }
}
```

### 6. **Logging & Debugging**

```javascript
handler(req, next) {
  console.log(`Handler ${this.name} processing ${req}`);
  return next();
}
```

## When to Use

### ✅ Use Chain of Responsibility When:

1. **Multiple handlers** might handle a request
2. **Handler selection** is dynamic (runtime)
3. **Order of handlers** matters
4. **Flexibility** in adding/removing handlers needed
5. **Sender shouldn't know** which handler will process
6. **One handler** should process (not all)
7. **Middleware** pattern is appropriate

### ❌ Don't Use When:

1. **Single handler** always handles (use direct call)
2. **All handlers** must execute (use Pipeline pattern)
3. **Performance critical** with many handlers (overhead)
4. **Handler selection** is simple (use if-else)
5. **Compile-time binding** is sufficient (use Strategy)

## Testing Strategy

### 1. **Test Individual Handlers**

```javascript
test('NumberHandler processes numbers', () => {
  const handler = new NumberHandler();
  const result = handler.handle(42, () => null);
  expect(result).toBe('42');
});
```

### 2. **Test Chain Construction**

```javascript
test('Chain adds handlers in order', () => {
  const chain = new Chain()
    .add(handler1)
    .add(handler2);
  expect(chain.first).toBe(handler1);
  expect(handler1.next).toBe(handler2);
});
```

### 3. **Test Request Flow**

```javascript
test('Request passes through chain', () => {
  const chain = new Chain()
    .add(rejectingHandler)
    .add(acceptingHandler);
  const result = chain.process(request);
  expect(result).toBe(acceptingHandler.result);
});
```

### 4. **Test Fallback**

```javascript
test('Throws when no handler matches', () => {
  const chain = new Chain().add(rejectingHandler);
  expect(() => chain.process(request)).toThrow();
});
```

## Performance Considerations

### 1. **Chain Length**
- Longer chains = more overhead
- Consider indexing or caching for long chains

### 2. **Handler Complexity**
- Keep handlers lightweight
- Avoid expensive checks in every handler

### 3. **Early Termination**
- Handlers should fail fast
- Put most likely handlers first

### 4. **Memory**
- Each handler holds reference to next
- Circular references prevent garbage collection

## Summary

The Chain of Responsibility pattern provides a flexible way to handle requests by passing them through a chain of handlers. Each handler independently decides whether to process the request or pass it to the next handler.

### Key Takeaways:

1. **Decouples sender from receivers** - sender doesn't know which handler processes
2. **Dynamic handler selection** - determined at runtime
3. **Flexible composition** - easy to add/remove/reorder handlers
4. **Single handler processes** - chain stops when request is handled
5. **Open/Closed principle** - add handlers without modifying chain
6. **Common in frameworks** - Express middleware, event systems

### Pattern Essence:

```javascript
Request → [Handler1 → Handler2 → Handler3] → Response
           ↓         ↓         ↓
         Pass?    Handle!    Never
                            Called
```

The Chain of Responsibility pattern is fundamental to many JavaScript frameworks and is particularly useful for building flexible, extensible processing pipelines where the handling logic can vary dynamically.