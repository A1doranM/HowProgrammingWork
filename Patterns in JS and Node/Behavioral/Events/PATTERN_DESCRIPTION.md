# Events Pattern - EventTarget vs EventEmitter

## Overview

The **Events Pattern** demonstrates the two primary event systems in JavaScript/Node.js:
1. **EventTarget** - W3C DOM Events API (browser standard, now in Node.js)
2. **EventEmitter** - Node.js-specific event system

This pattern explores the differences, similarities, and appropriate use cases for each approach.

## Two Event Systems

### 1. EventTarget (W3C Standard)

Browser-based event system, now available in Node.js:

```javascript
const target = new EventTarget();

target.addEventListener('click', (event) => {
  console.log(event.detail);
});

const event = new CustomEvent('click', {
  detail: { x: 10, y: 20 }
});

target.dispatchEvent(event);
```

**Characteristics:**
- Browser-compatible
- Event objects (must create Event/CustomEvent)
- addEventListener/removeEventListener
- dispatchEvent instead of emit
- Standard W3C API

### 2. EventEmitter (Node.js)

Node.js-specific event system:

```javascript
const { EventEmitter } = require('node:events');
const emitter = new EventEmitter();

emitter.on('click', (data) => {
  console.log(data);
});

emitter.emit('click', { x: 10, y: 20 });
```

**Characteristics:**
- Node.js only (not in browsers)
- Direct data passing (no Event objects needed)
- on/emit methods
- More concise API
- Node.js ecosystem standard

## Key Differences

### API Comparison

| Feature | EventTarget | EventEmitter |
|---------|-------------|--------------|
| **Add Listener** | addEventListener(type, listener) | on(event, listener) |
| **Remove Listener** | removeEventListener(type, listener) | removeListener(event, listener) |
| **Emit** | dispatchEvent(eventObject) | emit(event, ...args) |
| **Event Object** | Required (Event/CustomEvent) | Not required (direct args) |
| **Data Passing** | event.detail | Direct arguments |
| **Once** | {once: true} option | once(event, listener) |
| **Origin** | W3C Standard (DOM) | Node.js specific |
| **Compatibility** | Browser + Node.js v15+ | Node.js only |

### Data Passing

```javascript
// EventTarget: Requires Event object
const event = new CustomEvent('save', {
  detail: { id: 123, name: 'Marcus' }
});
target.dispatchEvent(event);
target.addEventListener('save', (event) => {
  console.log(event.detail);  // Access via .detail
});

// EventEmitter: Direct arguments
emitter.emit('save', { id: 123, name: 'Marcus' });
emitter.on('save', (data) => {
  console.log(data);  // Direct access
});
```

### Multiple Arguments

```javascript
// EventTarget: Single Event object only
const event = new CustomEvent('event', {
  detail: [arg1, arg2, arg3]  // Must wrap in detail
});

// EventEmitter: Multiple arguments directly
emitter.emit('event', arg1, arg2, arg3);
emitter.on('event', (arg1, arg2, arg3) => {
  // Receive as separate parameters
});
```

### Listener Deduplication

```javascript
// EventTarget: Deduplicates by default
target.addEventListener('click', handler);
target.addEventListener('click', handler);  // Ignored (same handler)
target.addEventListener('click', handler);  // Ignored
// Result: handler called ONCE

// EventEmitter: Allows duplicates
emitter.on('click', handler);
emitter.on('click', handler);  // Added again!
emitter.on('click', handler);  // Added again!
// Result: handler called THREE TIMES
```

## Implementation Variants

### 1. Using EventTarget (1-event.js)

Modern W3C standard approach:

```javascript
const target = new EventTarget();

target.addEventListener('name', (event) => {
  console.log({ data: event.detail });
});

const event = new CustomEvent('name', {
  detail: { id: 100, city: 'Roma', country: 'Italy' }
});

target.dispatchEvent(event);
```

**When to use:**
- Need browser compatibility
- Want W3C standard API
- Prevent duplicate listeners automatically
- Working with DOM-like patterns

### 2. Using EventEmitter (2-emitter.js)

Node.js standard approach:

```javascript
const { EventEmitter } = require('node:events');
const emitter = new EventEmitter();

emitter.on('name', (data) => {
  console.dir({ data });
});

emitter.emit('name', { a: 5 });
```

**When to use:**
- Node.js only application
- Want simpler API
- Need multiple arguments
- Standard Node.js patterns

### 3. Custom EventEmitter (3-naive.js)

Minimal custom implementation:

```javascript
class EventEmitter {
  events = {};
  
  on(name, fn) {
    const event = this.events[name];
    if (event) event.push(fn);
    else this.events[name] = [fn];
  }
  
  emit(name, ...data) {
    const event = this.events[name];
    if (!event) return;
    for (const listener of event) listener(...data);
  }
}
```

**When to use:**
- Learning event systems
- Lightweight alternative
- Custom event requirements
- No Node.js dependency

## Behavioral Differences

### Duplicate Listeners (4-multiple.js)

```javascript
// EventTarget: Automatically deduplicates
const target = new EventTarget();
target.addEventListener('name', handler);  // Added
target.addEventListener('name', handler);  // Ignored (duplicate)
target.addEventListener('name', handler);  // Ignored (duplicate)
target.dispatchEvent(event);
// Handler called ONCE

// EventEmitter: Allows duplicates
const emitter = new EventEmitter();
emitter.on('name', handler);  // Added
emitter.on('name', handler);  // Added again!
emitter.on('name', handler);  // Added again!
emitter.emit('name', data);
// Handler called THREE TIMES
```

### Removal Behavior (5-remove.js)

```javascript
// EventTarget: Removes ONE occurrence
target.addEventListener('name', handler);
target.addEventListener('name', handler);
target.addEventListener('name', handler);
target.removeEventListener('name', handler);
// Removes all (since they're deduplicated to one)

// EventEmitter: Removes ONE at a time
emitter.on('name', handler);  // 1
emitter.on('name', handler);  // 2
emitter.on('name', handler);  // 3
emitter.removeListener('name', handler);  // Remove 1, now 2 left
emitter.emit('name');  // Called twice
emitter.removeListener('name', handler);  // Remove 1, now 1 left
emitter.emit('name');  // Called once
emitter.removeListener('name', handler);  // Remove last
emitter.emit('name');  // Not called
```

### Error Events (7-error.js)

```javascript
// EventEmitter: Special 'error' event handling
const emitter = new EventEmitter();
emitter.emit('error', new Error('Failed'));
// If no 'error' listener: CRASHES with uncaught exception

emitter.on('error', (err) => {
  console.error('Handled:', err);
});
emitter.emit('error', new Error('Failed'));
// Now handled, doesn't crash

// EventTarget: No special error handling
target.dispatchEvent(new CustomEvent('error', {
  detail: new Error('Failed')
}));
// Just a regular event, never crashes
```

## Advanced Features

### 1. Promisified Once (8-once.js)

Node.js provides utility for awaiting events:

```javascript
const { EventEmitter, once } = require('node:events');

const emitter = new EventEmitter();

// Wait for event as Promise
const result = await once(emitter, 'ready');
console.log('Ready with:', result);

// Somewhere else
emitter.emit('ready', { status: 'ok' });
// Promise resolves, await returns
```

**Pattern:**
- once() utility wraps emitter.once() in Promise
- Returns Promise that resolves when event emitted
- Enables await-based event waiting

### 2. Async Emit (9-emit.js)

Wait for all async listeners to complete:

```javascript
const emit = async (ee, name, ...args) => {
  const listeners = ee.listeners(name);
  const promises = listeners.map(f => f(...args));
  return await Promise.all(promises);
};

// Usage
ee.on('save', async (data) => {
  await database.save(data);
});

await emit(ee, 'save', data);  // Waits for DB save
console.log('Save complete');
```

**Benefits:**
- Coordinated async operations
- Error propagation via Promise
- Result collection from all listeners
- Sequential vs parallel control

### 3. Horror (6-horror.js)

Ultra-minified EventEmitter (code golf):

```javascript
const emitter = (l, o) => (l = {}, o = {
  on: (n, f) => (l[n] = l[n] || []).push(f),
  emit: (n, ...d) => (l[n] || []).map((f) => f(...d)),
  once: (n, f, g) => o.on(n, g = (...a) => (f(...a), o.remove(n, g))),
  remove: (n, f, e) => (e = l[n] || [], e.splice(e.indexOf(f), 1)),
  // ...
});
```

**Purpose:**
- Demonstrates extreme minimization
- Shows JavaScript expression capabilities
- Educational (not for production!)

## When to Use Each

### Use EventTarget When:

✅ Need browser compatibility
✅ Want W3C standard API
✅ Prevent duplicate listeners automatically
✅ Working with DOM or DOM-like structures
✅ Sharing code between browser and Node.js
✅ Need event bubbling/capturing (in browsers)

### Use EventEmitter When:

✅ Node.js only application
✅ Want simpler, more direct API
✅ Need to pass multiple arguments
✅ Standard Node.js patterns (streams, HTTP, etc.)
✅ Already using Node.js ecosystem
✅ Need EventEmitter-specific features (setMaxListeners, etc.)

## Migration Between Systems

### EventEmitter → EventTarget

```javascript
// From
emitter.on('click', (x, y) => {
  console.log(x, y);
});
emitter.emit('click', 10, 20);

// To
target.addEventListener('click', (event) => {
  const { x, y } = event.detail;
  console.log(x, y);
});
const event = new CustomEvent('click', {
  detail: { x: 10, y: 20 }
});
target.dispatchEvent(event);
```

### EventTarget → EventEmitter

```javascript
// From
target.addEventListener('click', (event) => {
  console.log(event.detail);
});
const event = new CustomEvent('click', {
  detail: { data: 'value' }
});
target.dispatchEvent(event);

// To
emitter.on('click', (data) => {
  console.log(data);
});
emitter.emit('click', { data: 'value' });
```

## Best Practices

### 1. Choose Consistently

```javascript
// ✅ Good: Stick to one system per project
class Service extends EventEmitter { }

// ❌ Bad: Mixing both without good reason
class Service {
  target = new EventTarget();
  emitter = new EventEmitter();
}
```

### 2. Handle Errors

```javascript
// EventEmitter: Always handle 'error' event
emitter.on('error', (err) => {
  console.error('Error:', err);
});

// Or it crashes:
emitter.emit('error', new Error());  // Uncaught if no handler!
```

### 3. Remove Listeners

```javascript
// Both systems need cleanup
const handler = (data) => { };

// Add
target.addEventListener('event', handler);
emitter.on('event', handler);

// Remove when done
target.removeEventListener('event', handler);
emitter.removeListener('event', handler);
```

### 4. Use Once for Temporary Listeners

```javascript
// EventTarget
target.addEventListener('load', handler, { once: true });

// EventEmitter
emitter.once('load', handler);

// Or promisified
await once(emitter, 'load');
```

## Real-World Use Cases

### EventTarget Use Cases

1. **DOM Events** (Browser)
```javascript
button.addEventListener('click', (event) => {
  event.preventDefault();
  console.log(event.target);
});
```

2. **AbortController** (Browser + Node.js)
```javascript
const controller = new AbortController();
controller.signal.addEventListener('abort', () => {
  console.log('Aborted');
});
controller.abort();
```

3. **Web APIs** (Browser)
```javascript
const ws = new WebSocket('ws://localhost');
ws.addEventListener('message', (event) => {
  console.log(event.data);
});
```

### EventEmitter Use Cases

1. **Streams** (Node.js)
```javascript
stream.on('data', (chunk) => processChunk(chunk));
stream.on('end', () => console.log('Done'));
stream.on('error', (err) => handleError(err));
```

2. **HTTP Server** (Node.js)
```javascript
server.on('request', (req, res) => handleRequest(req, res));
server.on('error', (err) => console.error(err));
server.on('close', () => cleanup());
```

3. **Process Events** (Node.js)
```javascript
process.on('exit', (code) => cleanup(code));
process.on('uncaughtException', (err) => handleError(err));
process.on('SIGTERM', () => gracefulShutdown());
```

4. **Custom Application Events** (Node.js)
```javascript
class UserService extends EventEmitter {
  createUser(data) {
    const user = this.create(data);
    this.emit('user-created', user);
    return user;
  }
}
```

## Node.js EventTarget Support

Since Node.js v15+, EventTarget is available:

```javascript
// Now possible in Node.js!
const target = new EventTarget();
target.addEventListener('custom', handler);

const event = new CustomEvent('custom', {
  detail: { data: 'value' }
});
target.dispatchEvent(event);
```

**Implications:**
- Can share event code between browser and Node.js
- Choose EventTarget for cross-platform
- EventEmitter still preferred for Node.js-specific code
- Gradual convergence of platforms

## Comparison Table

| Aspect | EventTarget | EventEmitter |
|--------|-------------|--------------|
| **Platform** | Browser + Node.js 15+ | Node.js only |
| **Standard** | W3C DOM Events | Node.js specific |
| **Event Object** | Required | Optional (direct args) |
| **Multiple Args** | Via detail object | Native support |
| **Duplicates** | Auto-deduplicated | Allows duplicates |
| **Once** | {once: true} option | once() method |
| **Error Handling** | Regular event | Special 'error' event |
| **API Verbosity** | More verbose | More concise |
| **Max Listeners** | No limit | Default 10 (warning) |
| **Bubbling/Capture** | Supported (DOM) | Not supported |

## Anti-Patterns

### ❌ 1. Mixing Both Systems

```javascript
// BAD: Unnecessarily complex
class Service {
  constructor() {
    this.target = new EventTarget();
    this.emitter = new EventEmitter();
  }
  
  notifyA() {
    this.target.dispatchEvent(new Event('a'));
  }
  
  notifyB() {
    this.emitter.emit('b');
  }
}

// Good: Choose one
class Service extends EventEmitter {
  notifyA() { this.emit('a'); }
  notifyB() { this.emit('b'); }
}
```

### ❌ 2. Not Handling Errors

```javascript
// BAD: EventEmitter without error handler
emitter.emit('error', new Error());  // CRASHES if no listener

// Good: Always handle errors
emitter.on('error', (err) => {
  console.error('Error:', err);
});
```

### ❌ 3. Listener Memory Leaks

```javascript
// BAD: Adding listeners in loop
setInterval(() => {
  emitter.on('tick', () => {});  // New listener every second!
}, 1000);

// Good: Add once or use once()
const handler = () => {};
emitter.once('tick', handler);  // Auto-removes
```

## Best Practices

### 1. Choose Based on Platform

```javascript
// Browser code: Use EventTarget
class BrowserService {
  constructor() {
    this.target = new EventTarget();
  }
}

// Node.js code: Use EventEmitter
class NodeService extends EventEmitter { }

// Universal code: Use EventTarget (now in both)
class UniversalService {
  constructor() {
    this.target = new EventTarget();
  }
}
```

### 2. Consistent Event Naming

```javascript
// ✅ Good: Consistent naming
emitter.on('user-created', handler);
emitter.on('user-updated', handler);
emitter.on('user-deleted', handler);

// ❌ Bad: Inconsistent
emitter.on('userCreated', handler);  // camelCase
emitter.on('user_updated', handler); // snake_case
emitter.on('USER_DELETED', handler); // SCREAMING_CASE
```

### 3. Type-Safe Events (TypeScript)

```javascript
// EventEmitter with TypeScript
interface Events {
  'user-created': (user: User) => void;
  'data-received': (data: Data) => void;
}

class TypedEmitter extends EventEmitter {
  on<K extends keyof Events>(event: K, listener: Events[K]): this;
  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): boolean;
}
```

### 4. Error Handling

```javascript
// EventEmitter: Mandatory error handling
emitter.on('error', (err) => {
  logger.error('Event error:', err);
});

// Within listeners: Catch and emit errors
emitter.on('process', async (data) => {
  try {
    await processData(data);
  } catch (err) {
    emitter.emit('error', err);
  }
});
```

## Summary

The Events pattern demonstrates two approaches to event-driven programming in JavaScript:

### EventTarget (W3C Standard)
- **Origins**: DOM events in browsers
- **Now**: Available in Node.js v15+
- **Use for**: Cross-platform, browser compat, standards
- **API**: addEventListener, dispatchEvent, Event objects

### EventEmitter (Node.js)
- **Origins**: Node.js core
- **Exclusive**: Node.js only
- **Use for**: Node.js apps, simpler API, Node ecosystem
- **API**: on, emit, direct arguments

### Key Takeaways:

1. **Two Standards**: W3C (EventTarget) vs Node.js (EventEmitter)
2. **Platform Convergence**: EventTarget now in Node.js
3. **API Differences**: Event objects vs direct args
4. **Behavior Differences**: Deduplication vs duplicates
5. **Error Handling**: Special vs regular events
6. **Choose Wisely**: Based on platform and requirements
7. **Consistency**: Stick to one system per project

### Pattern Evolution (in this folder):

```
1-event.js      → EventTarget basics
                  ↓
2-emitter.js    → EventEmitter basics
                  ↓
3-naive.js      → Custom implementation
                  ↓
4-multiple.js   → Compare duplicate handling
                  ↓
5-remove.js     → Compare removal behavior
                  ↓
6-horror.js     → Minified EventEmitter
                  ↓
7-error.js      → Error event handling
                  ↓
8-once.js       → Promisified once utility
                  ↓
9-emit.js       → Async emit wrapper
```

Both systems implement the Observer/Pub-Sub pattern but with different APIs and behaviors. Understanding both is essential for full-stack JavaScript development.

### Recommendation:

- **New Node.js projects**: Use EventEmitter (ecosystem standard)
- **Browser projects**: Use EventTarget (native DOM API)
- **Universal/Isomorphic**: Use EventTarget (now in both)
- **Existing Node.js**: Keep using EventEmitter (stable, proven)

The Events pattern shows that while the concept is the same (publish-subscribe), implementations can vary significantly. Choose the right tool for your platform and requirements!