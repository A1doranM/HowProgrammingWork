# Actor Pattern

## Overview

The **Actor Pattern** is a concurrency pattern that encapsulates state and behavior in isolated units called "actors" that communicate exclusively through asynchronous message passing. Each actor processes messages sequentially from a queue, eliminating race conditions and ensuring thread-safety without explicit locking.

## Problem Statement

### The Race Condition Problem

When multiple asynchronous operations access and modify shared state concurrently, race conditions can occur:

```javascript
// ❌ ANTI-PATTERN: Race condition with shared state
const state = { inventory: 5 };

// Three concurrent orders might all pass availability check
async function processOrder(order, state) {
  const available = await checkAvailability(order, state); // All three check: 5 items
  if (available) {
    await processPayment(order);
    state.inventory -= order.quantity; // All three modify!
  }
}

// Race condition: All three orders may pass check before any decrements inventory
processOrder({ quantity: 3 }, state); // Thinks 5 available
processOrder({ quantity: 1 }, state); // Thinks 5 available  
processOrder({ quantity: 2 }, state); // Thinks 5 available
// Result: inventory becomes -1 (oversold!)
```

### Why This Happens

1. **Asynchronous delays** allow multiple operations to read state before any writes occur
2. **No serialization** of state access means checks and updates can interleave
3. **Concurrent execution** of independent async operations creates unpredictable ordering

## Solution: Actor Pattern

The Actor Pattern solves this by:

1. **Encapsulating state** within the actor (no external access)
2. **Queueing messages** for sequential processing
3. **Processing one message at a time** (serialization)
4. **Maintaining internal state** that's never directly accessed

### Actor Model Principles

```
┌─────────────────────────────────────┐
│           ACTOR                      │
│  ┌───────────────────────────────┐  │
│  │    Private State              │  │
│  │    { inventory: 5 }           │  │
│  └───────────────────────────────┘  │
│              ▲                       │
│              │                       │
│  ┌───────────┴───────────────────┐  │
│  │    Message Queue              │  │
│  │    [msg1, msg2, msg3]         │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │    Behavior Function          │  │
│  │    (processes one at a time)  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         ▲                  ▲
         │                  │
    Messages from      Messages from
    Sender A           Sender B
```

## Implementation

### Basic Actor Implementation

```javascript
class Actor {
  #queue = [];          // Message queue
  #processing = false;  // Processing flag to prevent concurrent execution
  #behavior = null;     // Function that processes messages
  #state = null;        // Encapsulated state

  constructor(behavior, state) {
    this.#behavior = behavior;
    this.#state = state;
  }

  async send(message) {
    this.#queue.push(message);
    await this.#process();
  }

  async #process() {
    // Prevent concurrent processing
    if (this.#processing) return;
    this.#processing = true;

    // Process all queued messages sequentially
    while (this.#queue.length) {
      const message = this.#queue.shift();
      await this.#behavior(message, this.#state);
    }

    this.#processing = false;
  }
}
```

### Usage Example

```javascript
// Define behavior
const processOrder = async (order, state) => {
  const available = await checkAvailability(order.items, state);
  if (available) {
    await processPayment(order.paymentDetails);
    await shipGoods(order.items, state);
    await sendConfirmation(order.userEmail);
  }
};

// Create actor with initial state
const orderActor = new Actor(processOrder, { inventory: 5 });

// Send messages (processed sequentially regardless of arrival time)
orderActor.send({ items: [{ quantity: 3 }] });
orderActor.send({ items: [{ quantity: 1 }] });
orderActor.send({ items: [{ quantity: 2 }] });

// ✅ Guaranteed execution order:
// 1. First order: checks 5, uses 3, inventory = 2
// 2. Second order: checks 2, uses 1, inventory = 1  
// 3. Third order: checks 1, fails (needs 2)
```

## Key Concepts

### 1. Message Queue

Messages are added to a FIFO queue and processed in order:

```javascript
async send(message) {
  this.#queue.push(message);  // Add to queue
  await this.#process();       // Trigger processing
}
```

### 2. Sequential Processing

The `#processing` flag ensures only one message is processed at a time:

```javascript
async #process() {
  if (this.#processing) return;  // Already processing, skip
  this.#processing = true;        // Acquire lock
  
  while (this.#queue.length) {
    const message = this.#queue.shift();
    await this.#behavior(message, this.#state);  // Process one by one
  }
  
  this.#processing = false;  // Release lock
}
```

### 3. State Encapsulation

State is private (`#state`) and only accessible through message processing:

```javascript
class Actor {
  #state = null;  // Private field - no external access
  
  constructor(behavior, state) {
    this.#state = state;  // Initialize
  }
  
  // State only modified through behavior function
  async #process() {
    await this.#behavior(message, this.#state);
  }
}
```

## Benefits

### 1. **No Race Conditions**
Sequential message processing eliminates concurrent state access:
```javascript
// ✅ Safe: Messages processed one at a time
actor.send(msg1);  // Processed completely
actor.send(msg2);  // Then processed
actor.send(msg3);  // Then processed
```

### 2. **Simplified Concurrency**
No need for locks, mutexes, or semaphores:
```javascript
// No explicit locking needed
class Actor {
  // Single #processing flag handles serialization
  #processing = false;
}
```

### 3. **Predictable Behavior**
Deterministic execution order regardless of async timing:
```javascript
// Order guaranteed: msg1 → msg2 → msg3
// Even if msg3 arrives before msg2 completes
```

### 4. **Isolated State**
Each actor has independent state - no shared memory:
```javascript
const actor1 = new Actor(behavior, { count: 0 });
const actor2 = new Actor(behavior, { count: 0 });
// actor1 and actor2 never interfere
```

### 5. **Scalability**
Multiple actors can run concurrently while each maintains internal consistency:
```javascript
const orderActor = new Actor(processOrder, orderState);
const inventoryActor = new Actor(updateInventory, inventoryState);
const paymentActor = new Actor(processPayment, paymentState);
// All three run concurrently, each internally consistent
```

## Advanced Usage

### Method Dispatch Actor

An actor can dispatch to different methods on an entity:

```javascript
class Actor {
  #queue = [];
  #processing = false;
  #state = null;

  constructor(Entity, ...args) {
    this.#state = new Entity(...args);
  }

  async send({ method, args = [] }) {
    return new Promise((resolve) => {
      this.#queue.push({ method, args, resolve });
      this.#process();
    });
  }

  async #process() {
    if (this.#processing) return;
    this.#processing = true;
    
    while (this.#queue.length) {
      const { method, args, resolve } = this.#queue.shift();
      if (typeof this.#state[method] === 'function') {
        const result = this.#state[method](...args);
        resolve(result);
      }
    }
    
    this.#processing = false;
  }
}

// Usage
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  move(x, y) {
    this.x += x;
    this.y += y;
  }
}

const point = new Actor(Point, 10, 20);
await point.send({ method: 'move', args: [5, 10] });
const result = await point.send({ method: 'toString' });
```

## When to Use

### ✅ Use Actor Pattern When:

1. **Shared mutable state** with concurrent access
2. **Order matters** - operations must be sequential
3. **State consistency** is critical (banking, inventory, etc.)
4. **Avoiding race conditions** is a requirement
5. **Async operations** modify shared state
6. **Multiple producers** send work to the same resource

### ❌ Don't Use Actor Pattern When:

1. **No shared state** - operations are independent
2. **Read-only access** - no mutations
3. **Performance critical** - sequential processing may be slower
4. **Simple synchronous code** - pattern adds unnecessary complexity
5. **Already using database transactions** - DB handles consistency

## Comparison with Other Patterns

### Actor vs Mutex/Lock

| Aspect | Actor | Mutex/Lock |
|--------|-------|------------|
| Approach | Message passing | Shared memory |
| Blocking | Non-blocking (queue) | Blocking (wait) |
| Deadlock | Impossible | Possible |
| Complexity | Higher abstraction | Lower level |
| JavaScript | Natural fit | Not built-in |

### Actor vs Event Loop

| Aspect | Actor | Event Loop |
|--------|-------|------------|
| Scope | Per-actor state | Global |
| Guarantee | Sequential per actor | No ordering guarantee |
| State | Encapsulated | Shared |
| Use Case | Stateful entities | General async ops |

## Real-World Use Cases

### 1. **E-Commerce Inventory**
```javascript
const inventoryActor = new Actor(
  updateInventory,
  { products: { sku123: { stock: 100 } } }
);

// Multiple concurrent orders
inventoryActor.send({ sku: 'sku123', quantity: -1 });
inventoryActor.send({ sku: 'sku123', quantity: -2 });
```

### 2. **Financial Transactions**
```javascript
const accountActor = new Actor(
  processTransaction,
  { balance: 1000 }
);

// Concurrent deposits/withdrawals
accountActor.send({ type: 'withdraw', amount: 100 });
accountActor.send({ type: 'deposit', amount: 50 });
```

### 3. **Chat Room**
```javascript
const chatRoomActor = new Actor(
  handleMessage,
  { messages: [], users: [] }
);

// Multiple users sending messages
chatRoomActor.send({ user: 'Alice', text: 'Hello' });
chatRoomActor.send({ user: 'Bob', text: 'Hi' });
```

### 4. **Game State Management**
```javascript
const gameActor = new Actor(
  processAction,
  { players: {}, board: initializeBoard() }
);

// Players making moves
gameActor.send({ player: 'p1', action: 'move', position: [3, 4] });
gameActor.send({ player: 'p2', action: 'attack', target: 'p1' });
```

## Implementation Variants

### 1. Fire-and-Forget (No Response)
```javascript
actor.send(message);  // No await, no return value
```

### 2. Request-Reply (With Response)
```javascript
async send(message) {
  return new Promise((resolve) => {
    this.#queue.push({ message, resolve });
    this.#process();
  });
}

const result = await actor.send(message);
```

### 3. Timeout Support
```javascript
async send(message, timeout = 5000) {
  return Promise.race([
    this.#sendMessage(message),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}
```

## Best Practices

### 1. **Keep State Private**
```javascript
class Actor {
  #state = null;  // ✅ Use private fields
  
  // ❌ Don't expose state
  getState() { return this.#state; }  // Bad!
}
```

### 2. **Keep Behavior Pure (When Possible)**
```javascript
// ✅ Good: Pure function
const behavior = async (message, state) => {
  state.count += message.value;  // Modify state
  return state.count;            // Return result
};

// ❌ Bad: Side effects outside state
const behavior = async (message, state) => {
  globalVariable++;  // External side effect
};
```

### 3. **Handle Errors Gracefully**
```javascript
async #process() {
  while (this.#queue.length) {
    const { message, resolve, reject } = this.#queue.shift();
    try {
      const result = await this.#behavior(message, this.#state);
      resolve?.(result);
    } catch (error) {
      reject?.(error);
      console.error('Actor error:', error);
    }
  }
}
```

### 4. **Monitor Queue Size**
```javascript
async send(message) {
  if (this.#queue.length > 1000) {
    throw new Error('Queue overflow - too many pending messages');
  }
  this.#queue.push(message);
  await this.#process();
}
```

## GRASP Principles Applied

### Information Expert
- Actor has state information → processes messages that modify state

### Low Coupling
- Actors communicate via messages, not direct method calls
- No shared memory between actors

### High Cohesion
- Each actor manages one domain entity (order, inventory, account)
- Behavior and state are kept together

### Protected Variations
- Implementation details (queue, processing) are private
- Public interface (`send`) is stable

## Common Pitfalls

### 1. **Forgetting to Await**
```javascript
// ❌ Bad: Fire and forget without waiting
actor.send(message1);
actor.send(message2);
// No guarantee message1 completes before message2 queued

// ✅ Good: Wait if order matters for caller
await actor.send(message1);
await actor.send(message2);
```

### 2. **Leaking State References**
```javascript
// ❌ Bad: Exposing mutable state
class Actor {
  getState() {
    return this.#state;  // Caller can mutate!
  }
}

// ✅ Good: Return copy or immutable
getState() {
  return Object.freeze({ ...this.#state });
}
```

### 3. **Blocking the Actor**
```javascript
// ❌ Bad: Synchronous blocking
const behavior = (message, state) => {
  while (Date.now() < deadline) {}  // Blocks actor!
};

// ✅ Good: Use async delays
const behavior = async (message, state) => {
  await sleep(1000);  // Non-blocking
};
```

## Summary

The Actor Pattern provides a robust solution for managing concurrent access to shared state in asynchronous systems. By enforcing sequential message processing and encapsulating state, it eliminates race conditions without complex locking mechanisms.

### Key Takeaways:
- **Messages not Methods**: Communication through message passing
- **Sequential Processing**: One message at a time, guaranteed order
- **State Isolation**: Private state, no external access
- **No Race Conditions**: Serialization prevents concurrent state access
- **Scalability**: Multiple actors run concurrently, each internally consistent

The Actor Pattern is particularly valuable in Node.js applications dealing with inventory management, financial transactions, real-time systems, and any scenario where state consistency under concurrent load is critical.