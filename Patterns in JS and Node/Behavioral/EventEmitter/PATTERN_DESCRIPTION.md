# EventEmitter Pattern

## Overview

The **EventEmitter Pattern** (also known as **Publisher-Subscriber** or **Pub/Sub**) implements a one-to-many dependency between objects. When an event occurs, all registered listeners are notified and executed. It's the foundation of event-driven architecture in Node.js.

## Problem Statement

### Tight Coupling Between Components

Without EventEmitter, components are tightly coupled:

```javascript
// ❌ ANTI-PATTERN: Tight coupling
class DataProcessor {
  processData(data) {
    // Process data
    const result = this.transform(data);
    
    // Directly notify all interested parties (tight coupling!)
    this.logger.log(result);
    this.cache.update(result);
    this.ui.render(result);
    this.analytics.track(result);
    
    // Adding new notification requires changing this class!
  }
}
```

**Problems:**
1. **Tight coupling**: Processor knows about all dependents
2. **Hard to extend**: Adding new listener requires code changes
3. **Testing difficulty**: Must mock all dependencies
4. **Violation of SRP**: Processor does too much
5. **Synchronous**: All notifications block processing

## Solution: EventEmitter Pattern

Decouple components using events:

```javascript
// ✅ EventEmitter: Loose coupling
class DataProcessor extends EventEmitter {
  processData(data) {
    const result = this.transform(data);
    
    // Just emit event - don't know who listens!
    this.emit('data-processed', result);
  }
}

// Interested parties register themselves
processor.on('data-processed', (result) => logger.log(result));
processor.on('data-processed', (result) => cache.update(result));
processor.on('data-processed', (result) => ui.render(result));
```

### Pattern Structure

```
         EventEmitter
              │
         ┌────┴────┐
         │ events  │  { 'click': [fn1, fn2], 'load': [fn3] }
         └─────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
  on()     emit()    remove()
    │         │         │
    ↓         ↓         ↓
Register   Notify   Unregister
Listener  All      Listener
```

**Key Methods:**
- `on(event, listener)` - Register listener
- `emit(event, ...args)` - Notify all listeners
- `once(event, listener)` - One-time listener
- `remove(event, listener)` - Unregister listener

## Core Concepts

### 1. Event Registration

Listeners subscribe to events:

```javascript
emitter.on('data', (data) => {
  console.log('Received:', data);
});

emitter.on('data', (data) => {
  saveToDatabase(data);
});
```

### 2. Event Emission

Publisher notifies all listeners:

```javascript
emitter.emit('data', { value: 42 });
// Both listeners above are called with { value: 42 }
```

### 3. Multiple Listeners

Many listeners per event:

```javascript
emitter.on('save', listener1);
emitter.on('save', listener2);
emitter.on('save', listener3);

emitter.emit('save', data);
// All three listeners called
```

### 4. One-Time Listeners

Auto-remove after first execution:

```javascript
emitter.once('load', () => {
  console.log('Loaded!');
});

emitter.emit('load');  // Prints "Loaded!"
emitter.emit('load');  // Nothing happens (already removed)
```

### 5. Listener Management

Add and remove listeners:

```javascript
const handler = (data) => console.log(data);

emitter.on('event', handler);    // Add
emitter.remove('event', handler); // Remove
```

## Implementation Variants

### 1. Prototype-Based (1-simple.js)

Classic JavaScript implementation:

```javascript
const EventEmitter = function() {
  this.events = {};  // Hash of arrays
};

EventEmitter.prototype.on = function(name, fn) {
  const event = this.events[name];
  if (event) event.push(fn);
  else this.events[name] = [fn];
};

EventEmitter.prototype.emit = function(name, ...data) {
  const event = this.events[name];
  if (!event) return;
  for (const listener of event) listener(...data);
};
```

**Characteristics:**
- ✅ Classic JavaScript pattern
- ✅ Shared prototype methods (memory efficient)
- ✅ Simple and understandable
- ❌ Uses `this` (binding issues)

### 2. Wildcard Support (3-enhanced.js, 4-star-fix.js)

Listen to all events:

```javascript
const emitter = () => {
  const ee = new events.EventEmitter();
  const emit = ee.emit;
  
  ee.emit = (...args) => {
    emit.apply(ee, args);      // Emit original event
    args.unshift('*');
    emit.apply(ee, args);      // Emit wildcard event
  };
  
  return ee;
};

// Usage
ee.on('*', (name, data) => {
  console.log(`Event ${name}:`, data);
});
```

**Use Cases:**
- Global logging
- Debugging
- Analytics
- Monitoring

### 3. Closure-Based (6-closure.js, 7-closure.js)

Encapsulation via closures:

```javascript
const emitter = () => {
  const events = {};  // Private via closure
  
  return {
    on: (name, fn) => {
      const event = events[name];
      if (event) event.push(fn);
      else events[name] = [fn];
    },
    emit: (name, ...data) => {
      const event = events[name];
      if (event) event.forEach(fn => fn(...data));
    }
  };
};
```

**Characteristics:**
- ✅ True encapsulation (events is private)
- ✅ No `this` binding issues
- ✅ Factory pattern
- ✅ Functional style

### 4. Full-Featured (8-methods.js, a-prod.js)

Complete API:

```javascript
const emitter = () => ({
  on(name, fn, timeout),    // Subscribe (with optional auto-unsubscribe)
  once(name, fn),           // Subscribe once
  emit(name, ...args),      // Publish
  remove(name, fn),         // Unsubscribe
  clear(name),              // Remove all listeners for event
  count(name),              // Count listeners
  listeners(name),          // Get listeners array
  names(),                  // Get all event names
});
```

**Features:**
- Auto-unsubscribe with timeout
- Once listeners with wrapper tracking
- Clear individual or all events
- Introspection (count, listeners, names)

### 5. Class-Based (b-class.js)

Modern ES6 class implementation:

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();    // Map instead of object
    this.wrappers = new Map();  // Track once wrappers
  }
  
  on(name, fn) {
    const event = this.events.get(name);
    if (event) event.add(fn);
    else this.events.set(name, new Set([fn]));
  }
  
  emit(name, ...args) {
    const event = this.events.get(name);
    if (!event) return;
    for (const fn of event.values()) fn(...args);
  }
}
```

**Improvements:**
- ✅ Map instead of object (any key type)
- ✅ Set instead of array (no duplicates, O(1) remove)
- ✅ Modern syntax
- ✅ Better memory characteristics

### 6. Async EventEmitter (c-async.js)

Supports async listeners:

```javascript
class AsyncEmitter {
  async emit(name, ...args) {
    const event = this.events.get(name);
    if (!event) return;
    
    const { on, once } = event;
    const listeners = [...on, ...once];
    const promises = listeners.map(fn => fn(...args));
    
    once.clear();  // Clear once listeners
    return Promise.all(promises);  // Wait for all
  }
  
  once(name, fn) {
    if (!fn) {
      // Promisify: await emitter.once('event')
      return new Promise(resolve => {
        this.once(name, resolve);
      });
    }
    this.event(name).once.add(fn);
  }
}
```

**Features:**
- ✅ Async listeners
- ✅ Promise-based emit
- ✅ Promisified once: `await emitter.once('event')`
- ✅ Wait for all listeners to complete

## Key Features

### 1. Loose Coupling

Publisher doesn't know subscribers:

```javascript
// Publisher
class DataSource extends EventEmitter {
  fetchData() {
    const data = this.fetch();
    this.emit('data', data);  // Don't know who's listening
  }
}

// Subscribers (can be added/removed independently)
dataSource.on('data', logger);
dataSource.on('data', cache);
dataSource.on('data', ui);
```

### 2. Dynamic Subscription

Add/remove listeners at runtime:

```javascript
if (debugMode) {
  emitter.on('*', debugLogger);
}

if (!production) {
  emitter.on('error', detailedErrorHandler);
} else {
  emitter.on('error', simpleErrorHandler);
}
```

### 3. Multiple Events

Different events for different purposes:

```javascript
server.on('request', handleRequest);
server.on('error', handleError);
server.on('close', cleanup);
server.on('upgrade', handleUpgrade);
```

### 4. Event Data

Pass arbitrary data to listeners:

```javascript
emitter.emit('user-login', {
  userId: 123,
  username: 'marcus',
  timestamp: Date.now()
});
```

### 5. Synchronous vs Async

Choose execution model:

```javascript
// Synchronous (default)
emitter.emit('event', data);
// All listeners execute immediately

// Asynchronous
async emit(name, ...args) {
  const promises = listeners.map(fn => fn(...args));
  await Promise.all(promises);
}
```

## Benefits

### 1. **Decoupling**
Components don't know about each other:
```javascript
// Neither knows about the other
publisher.emit('event');
subscriber.on('event', handler);
```

### 2. **Extensibility**
Add new listeners without changing publisher:
```javascript
// Add new feature without touching existing code
emitter.on('save', newFeature);
```

### 3. **Flexibility**
Listeners can be added/removed dynamically:
```javascript
if (condition) emitter.on('event', handler);
else emitter.remove('event', handler);
```

### 4. **Testability**
Easy to test in isolation:
```javascript
// Test publisher
emitter.emit('event');
expect(mockListener).toHaveBeenCalled();

// Test subscriber
const handler = listeners[0];
handler(testData);
expect(result).toBe(expected);
```

### 5. **Reusability**
Same listener for multiple events:
```javascript
const logger = (data) => console.log(data);
emitter.on('save', logger);
emitter.on('update', logger);
emitter.on('delete', logger);
```

## Real-World Use Cases

### 1. **Node.js Core** (Everywhere!)

```javascript
// HTTP Server
server.on('request', (req, res) => { });
server.on('error', (err) => { });
server.on('close', () => { });

// Streams
stream.on('data', (chunk) => { });
stream.on('end', () => { });
stream.on('error', (err) => { });

// Process
process.on('exit', (code) => { });
process.on('uncaughtException', (err) => { });
```

### 2. **Custom Application Events**

```javascript
class UserService extends EventEmitter {
  createUser(data) {
    const user = this.create(data);
    this.emit('user-created', user);
    return user;
  }
}

// Separate concerns
userService.on('user-created', sendWelcomeEmail);
userService.on('user-created', updateAnalytics);
userService.on('user-created', notifyAdmins);
```

### 3. **Real-Time Systems**

```javascript
class WebSocketServer extends EventEmitter {
  handleMessage(message) {
    this.emit('message', message);
  }
}

wsServer.on('message', broadcastToClients);
wsServer.on('message', logMessage);
wsServer.on('message', processCommand);
```

### 4. **State Management**

```javascript
class Store extends EventEmitter {
  setState(newState) {
    this.state = newState;
    this.emit('state-change', newState);
  }
}

store.on('state-change', updateUI);
store.on('state-change', persistState);
store.on('state-change', notifySubscribers);
```

### 5. **Plugin Systems**

```javascript
class PluginManager extends EventEmitter {
  loadPlugin(plugin) {
    plugin.register(this);
    this.emit('plugin-loaded', plugin);
  }
}

// Plugins subscribe to events
pluginManager.on('before-save', validationPlugin);
pluginManager.on('after-save', auditPlugin);
pluginManager.on('error', errorHandlerPlugin);
```

### 6. **Workflow Orchestration**

```javascript
class Workflow extends EventEmitter {
  execute() {
    this.emit('start');
    this.emit('validate');
    this.emit('process');
    this.emit('complete');
  }
}

workflow.on('start', () => console.log('Starting...'));
workflow.on('validate', validateInput);
workflow.on('process', processData);
workflow.on('complete', sendNotification);
```

## Implementation Styles

### Prototype Style (1-simple.js)

```javascript
function EventEmitter() {
  this.events = {};
}

EventEmitter.prototype.on = function(name, fn) { };
EventEmitter.prototype.emit = function(name, ...data) { };
```

**When to use:**
- Traditional JavaScript
- Need `instanceof` checks
- Shared prototype methods

### Closure Style (6-closure.js, 7-closure.js)

```javascript
const emitter = () => {
  const events = {};  // Private
  return {
    on: (name, fn) => { },
    emit: (name, ...data) => { }
  };
};
```

**When to use:**
- Need true privacy
- Functional programming style
- Avoid `this` issues

### Class Style (b-class.js)

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(name, fn) { }
  emit(name, ...args) { }
}
```

**When to use:**
- Modern codebase
- ES6+ syntax
- Prefer classes over prototypes

## Advanced Features

### 1. Once Listeners

Auto-remove after first call:

```javascript
once(name, fn) {
  const wrapper = (...args) => {
    this.remove(name, wrapper);  // Remove wrapper
    fn(...args);                  // Call original
  };
  this.wrappers.set(fn, wrapper); // Track for removal
  this.on(name, wrapper);
}

// Usage
emitter.once('load', () => console.log('Loaded!'));
```

**Implementation Trick:**
- Wrap original function
- Wrapper removes itself then calls original
- Track wrapper to allow manual removal

### 2. Wildcard Events

Listen to all events:

```javascript
ee.on('*', (eventName, ...args) => {
  console.log(`Event ${eventName}:`, args);
});

ee.emit('click', { x: 10, y: 20 });
// Triggers both 'click' and '*' listeners
```

**Implementation:**

```javascript
emit(...args) {
  const [name] = args;
  
  // Prevent recursive wildcard
  if (name === '*') {
    throw new Error('Event name "*" is reserved');
  }
  
  // Emit specific event
  this.emitEvent(name, ...args);
  
  // Emit wildcard
  this.emitEvent('*', name, ...args);
}
```

### 3. Auto-Unsubscribe Timeout

```javascript
emitter.on('event', handler, 5000);  // Auto-remove after 5s

// Implementation
on(name, fn, timeout = 0) {
  this.addListener(name, fn);
  
  if (timeout) {
    setTimeout(() => {
      this.remove(name, fn);
    }, timeout);
  }
}
```

### 4. Async Listeners

Support async/await:

```javascript
class AsyncEmitter {
  async emit(name, ...args) {
    const listeners = this.getListeners(name);
    const promises = listeners.map(fn => fn(...args));
    return Promise.all(promises);  // Wait for all
  }
}

// Usage
await emitter.emit('save', data);  // Waits for all listeners
```

### 5. Promisified Once

Wait for event as Promise:

```javascript
once(name, fn) {
  if (!fn) {
    // No function provided - return Promise
    return new Promise(resolve => {
      this.once(name, resolve);
    });
  }
  // Normal once implementation
}

// Usage
const data = await emitter.once('data');
```

## GRASP Principles Applied

### 1. **Low Coupling**
Publisher independent of subscribers:
```javascript
publisher.emit('event');  // Doesn't know subscribers
```

### 2. **High Cohesion**
Each listener has focused responsibility:
```javascript
emitter.on('save', saveToCache);     // One job
emitter.on('save', sendNotification); // One job
```

### 3. **Indirection**
EventEmitter provides indirection:
```javascript
Publisher → EventEmitter → Subscribers
(don't know each other)
```

### 4. **Protected Variations**
Easy to add/remove listeners:
```javascript
// Add without changing publisher
emitter.on('event', newFeature);
```

### 5. **Polymorphism**
All listeners share same interface:
```javascript
listeners.forEach(fn => fn(data));
```

## EventEmitter vs Other Patterns

### EventEmitter vs Observer

| Aspect | EventEmitter | Observer |
|--------|--------------|----------|
| **Structure** | Central emitter | Subject with observers list |
| **Registration** | on(event, fn) | attach(observer) |
| **Notification** | emit(event) | notify() |
| **Multiple Events** | Yes (different events) | No (single notification) |
| **Implementation** | JavaScript idiom | GoF pattern |

### EventEmitter vs Mediator

| Aspect | EventEmitter | Mediator |
|--------|--------------|----------|
| **Purpose** | Publish-subscribe | Coordinate interactions |
| **Knowledge** | Components don't know each other | Mediator knows all |
| **Direction** | One-to-many broadcast | Many-to-many coordination |
| **Coupling** | Very loose | Centralized coupling |

### EventEmitter vs Signals (Reactive)

| Aspect | EventEmitter | Signals |
|--------|--------------|---------|
| **Values** | Events (temporal) | Values (spatial) |
| **Memory** | No value stored | Current value stored |
| **Subscription** | on/emit | subscribe/value |
| **Reactivity** | Manual emit | Automatic propagation |

## Best Practices

### 1. **Error Handling**

```javascript
class SafeEmitter extends EventEmitter {
  emit(name, ...args) {
    const listeners = this.events.get(name);
    if (!listeners) return;
    
    for (const fn of listeners) {
      try {
        fn(...args);
      } catch (error) {
        this.emit('error', error);  // Emit error event
      }
    }
  }
}
```

### 2. **Memory Leaks Prevention**

```javascript
// Always remove listeners when done
const handler = (data) => process(data);

emitter.on('event', handler);

// Later...
emitter.remove('event', handler);  // Prevent memory leak

// Or use once for temporary listeners
emitter.once('event', handler);
```

### 3. **Event Naming**

```javascript
// ✅ Good: Descriptive, past tense for events
emitter.on('user-created', handler);
emitter.on('data-received', handler);
emitter.on('connection-established', handler);

// ❌ Bad: Vague or present tense
emitter.on('user', handler);
emitter.on('data', handler);
emitter.on('establish', handler);
```

### 4. **Max Listeners Warning**

```javascript
class EventEmitter {
  constructor(maxListeners = 10) {
    this.events = new Map();
    this.maxListeners = maxListeners;
  }
  
  on(name, fn) {
    const event = this.events.get(name) || new Set();
    event.add(fn);
    
    if (event.size > this.maxListeners) {
      console.warn(`MaxListeners (${this.maxListeners}) exceeded for event '${name}'`);
    }
    
    this.events.set(name, event);
  }
}
```

### 5. **Namespace Events**

```javascript
// Organize events with namespaces
emitter.on('user.created', handler);
emitter.on('user.updated', handler);
emitter.on('user.deleted', handler);

emitter.on('order.placed', handler);
emitter.on('order.shipped', handler);
```

### 6. **Type-Safe Events (TypeScript)**

```javascript
interface Events {
  'user-created': (user: User) => void;
  'data-received': (data: Data) => void;
  error: (err: Error) => void;
}

class TypedEmitter<T> {
  on<K extends keyof T>(event: K, listener: T[K]): void;
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void;
}
```

## Anti-Patterns to Avoid

### ❌ 1. Synchronous Blocking

```javascript
// BAD: Blocking listener
emitter.on('event', (data) => {
  while (condition) {}  // Blocks event loop!
});

// Good: Async or non-blocking
emitter.on('event', async (data) => {
  await processAsync(data);
});
```

### ❌ 2. Uncaught Errors

```javascript
// BAD: Error in listener crashes app
emitter.on('event', (data) => {
  throw new Error('Oops');  // Uncaught!
});

// Good: Emit error event
emitter.on('event', (data) => {
  try {
    process(data);
  } catch (err) {
    emitter.emit('error', err);
  }
});
```

### ❌ 3. Memory Leaks

```javascript
// BAD: Listeners never removed
setInterval(() => {
  emitter.on('tick', () => {});  // New listener every second!
}, 1000);

// Good: Remove or use once
const handler = () => {};
emitter.once('tick', handler);
```

### ❌ 4. Wildcard Infinite Loop

```javascript
// BAD: Wildcard emits wildcard = infinite loop
emitter.on('*', (name) => {
  emitter.emit(name);  // Causes infinite recursion!
});

// Good: Prevent wildcard emission
if (name === '*') throw new Error('Reserved');
```

### ❌ 5. Modifying Listeners During Iteration

```javascript
// BAD: Modifying array while iterating
emitter.emit('event') {
  for (const fn of event) {
    fn();  // If fn removes itself, iterator breaks!
  }
}

// Good: Copy array first
const listeners = event.slice();
for (const fn of listeners) fn();
```

## When to Use

### ✅ Use EventEmitter When:

1. **Loose coupling** needed between components
2. **Multiple subscribers** to same event
3. **Dynamic subscription** (add/remove at runtime)
4. **Asynchronous notifications** required
5. **Plugin architecture** needed
6. **Real-time updates** (WebSockets, streams)
7. **Workflow coordination** (step completion)
8. **Cross-cutting concerns** (logging, analytics)

### ❌ Don't Use When:

1. **Single subscriber** (use direct call or callback)
2. **Synchronous request-response** (use method call)
3. **Return values needed** from all listeners
4. **Guaranteed execution order** critical (unreliable)
5. **Type safety critical** (use TypeScript or alternatives)

## Testing Strategy

### 1. **Test Event Emission**

```javascript
test('emits events to listeners', () => {
  const ee = new EventEmitter();
  const mock = jest.fn();
  
  ee.on('test', mock);
  ee.emit('test', 'data');
  
  expect(mock).toHaveBeenCalledWith('data');
});
```

### 2. **Test Multiple Listeners**

```javascript
test('calls all listeners', () => {
  const ee = new EventEmitter();
  const mock1 = jest.fn();
  const mock2 = jest.fn();
  
  ee.on('test', mock1);
  ee.on('test', mock2);
  ee.emit('test');
  
  expect(mock1).toHaveBeenCalled();
  expect(mock2).toHaveBeenCalled();
});
```

### 3. **Test Once**

```javascript
test('once listeners called only once', () => {
  const ee = new EventEmitter();
  const mock = jest.fn();
  
  ee.once('test', mock);
  ee.emit('test');
  ee.emit('test');
  
  expect(mock).toHaveBeenCalledTimes(1);
});
```

### 4. **Test Removal**

```javascript
test('removes listeners', () => {
  const ee = new EventEmitter();
  const mock = jest.fn();
  
  ee.on('test', mock);
  ee.remove('test', mock);
  ee.emit('test');
  
  expect(mock).not.toHaveBeenCalled();
});
```

## Performance Considerations

### 1. **Array vs Set**

```javascript
// Array (8-methods.js)
- Push: O(1)
- Remove: O(n) (indexOf + splice)
- Memory: Lower

// Set (b-class.js)
- Add: O(1)
- Delete: O(1) (no indexOf needed)
- Memory: Slightly higher
```

**Recommendation**: Use Set for frequently modified listeners

### 2. **Object vs Map**

```javascript
// Object (1-simple.js)
- Key type: String only
- Lookup: O(1)
- Memory: Lower

// Map (a-prod.js)
- Key type: Any (Symbol, Object, etc.)
- Lookup: O(1)
- Memory: Slightly higher
```

**Recommendation**: Use Map for production code

### 3. **Listener Execution**

```javascript
// Synchronous (default)
emit(name, ...args) {
  for (const fn of listeners) fn(...args);
}
// Pros: Immediate, deterministic
// Cons: Blocks until all complete

// Async parallel
async emit(name, ...args) {
  await Promise.all(listeners.map(fn => fn(...args)));
}
// Pros: Non-blocking, parallel
// Cons: Unpredictable order

// Async sequential
async emit(name, ...args) {
  for (const fn of listeners) await fn(...args);
}
// Pros: Ordered execution
// Cons: Slower (serial)
```

## Summary

The EventEmitter pattern is fundamental to JavaScript/Node.js event-driven architecture. It provides loose coupling through publish-subscribe, enabling flexible, extensible applications.

### Key Takeaways:

1. **Pub/Sub**: Publisher emits, subscribers listen
2. **Loose Coupling**: Components don't know about each other
3. **Multiple Subscribers**: Many listeners per event
4. **Dynamic**: Add/remove listeners at runtime
5. **Flexible**: Support for once, remove, clear, etc.
6. **Core Pattern**: Foundation of Node.js (streams, HTTP, etc.)
7. **Simple to Complex**: From 19 lines to full-featured

### Pattern Evolution:

```
1-simple.js      → Basic prototype (on, emit)
                   ↓
3-enhanced.js    → Add wildcard support
                   ↓
4-star-fix.js    → Fix wildcard infinite loop
                   ↓
6-closure.js     → Closure for privacy
                   ↓
7-closure.js     → Ultra-compact closure
                   ↓
8-methods.js     → Full-featured (once, remove, clear, etc.)
                   ↓
9-min.js         → Minified full-featured
                   ↓
a-prod.js        → Production (Map + better memory)
                   ↓
b-class.js       → ES6 class (Set + Map)
                   ↓
c-async.js       → Async support (Promise.all)
```

### Implementation Choice:

- **Use Prototype (1)**: Traditional, instanceof checks
- **Use Closure (6-7)**: True privacy, functional
- **Use Class (b)**: Modern syntax, Map/Set
- **Use Async (c)**: Async listeners, Promise support
- **Use Production (a)**: Best all-around for real apps

EventEmitter is not just a pattern - it's THE pattern that makes Node.js event-driven. Understanding it is essential for Node.js development, and it demonstrates the power of loose coupling through events.