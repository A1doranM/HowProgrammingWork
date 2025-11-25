# Iterator Pattern

## Overview

The **Iterator Pattern** provides a way to access elements of a collection sequentially without exposing the underlying representation. In JavaScript, this is implemented through the **Iterator Protocol** and **Iterable Protocol**, which enable the `for-of` loop and spread operator.

## Problem Statement

### Need to Traverse Collections Without Exposing Implementation

Different data structures need different traversal methods:

```javascript
// ❌ ANTI-PATTERN: Exposing internal structure
class CustomCollection {
  constructor() {
    this.items = [];  // Exposed implementation
  }
  
  getItems() {
    return this.items;  // Returns internal array
  }
}

// Usage
const collection = new CustomCollection();
const items = collection.getItems();
for (let i = 0; i < items.length; i++) {  // Coupled to array
  console.log(items[i]);
}

// Problems:
// - Exposes internal array structure
// - Clients coupled to array implementation
// - Can't change to Set, Map, or custom structure
// - Direct array manipulation possible
```

## Solution: Iterator Protocol

JavaScript defines standard protocols for iteration:

### Iterator Protocol

An object is an **iterator** if it has a `next()` method:

```javascript
const iterator = {
  next() {
    return {
      value: any,      // Current value
      done: boolean    // true if iteration complete
    };
  }
};
```

### Iterable Protocol

An object is **iterable** if it has `[Symbol.iterator]()` method:

```javascript
const iterable = {
  [Symbol.iterator]() {
    return iterator;  // Returns an iterator
  }
};
```

## Core Concepts

### 1. Iterator Object

Provides sequential access via `next()`:

```javascript
const iterator = {
  counter: 0,
  next() {
    return {
      value: this.counter++,
      done: this.counter > 3
    };
  }
};

iterator.next();  // { value: 0, done: false }
iterator.next();  // { value: 1, done: false }
iterator.next();  // { value: 2, done: false }
iterator.next();  // { value: 3, done: true }
```

### 2. Iterable Object

Provides iterator via `Symbol.iterator`:

```javascript
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return {
          value: i++,
          done: i > 3
        };
      }
    };
  }
};

// Can use with for-of
for (const value of iterable) {
  console.log(value);  // 0, 1, 2
}

// Can use with spread
const array = [...iterable];  // [0, 1, 2]
```

### 3. Iterator vs Iterable

**Iterator**: Object with `next()` method
- Can be called to get next value
- Maintains current position
- Consumed after iteration

**Iterable**: Object with `[Symbol.iterator]()` method
- Can create new iterators
- Not consumed (creates fresh iterator each time)
- Can be iterated multiple times

```javascript
// ITERATOR (consumed)
const iterator = someIterable[Symbol.iterator]();
for (const x of iterator) { }  // Consumes iterator
for (const x of iterator) { }  // Nothing (already consumed)

// ITERABLE (reusable)
const iterable = someIterable;
for (const x of iterable) { }  // Creates new iterator
for (const x of iterable) { }  // Creates new iterator (works again!)
```

### 4. for-of Loop

JavaScript's `for-of` uses Iterator Protocol:

```javascript
for (const value of iterable) {
  console.log(value);
}

// Equivalent to:
const iterator = iterable[Symbol.iterator]();
while (true) {
  const { value, done } = iterator.next();
  if (done) break;
  console.log(value);
}
```

### 5. Spread Operator

Spread uses Iterator Protocol:

```javascript
const array = [...iterable];

// Equivalent to:
const array = [];
const iterator = iterable[Symbol.iterator]();
while (true) {
  const { value, done } = iterator.next();
  if (done) break;
  array.push(value);
}
```

## Implementation Variants

### 1. Manual Iterator (1-iterator.js)

Basic iterator object:

```javascript
const iterator = {
  counter: 0,
  next() {
    return {
      value: this.counter++,
      done: this.counter > 3
    };
  }
};
```

**Characteristics:**
- ✅ Simple and explicit
- ✅ Clear control flow
- ❌ Can't use with for-of (no Symbol.iterator)
- ❌ Can't use with spread
- ❌ Manual next() calls required

### 2. Iterable Object (2-iterable.js)

Object implementing iterable protocol:

```javascript
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return {
          value: i++,
          done: i > 3
        };
      }
    };
  }
};
```

**Characteristics:**
- ✅ Works with for-of
- ✅ Works with spread
- ✅ Creates fresh iterator each time
- ✅ Reusable (not consumed)

### 3. Class-Based Iterable (3-class.js)

Iterable class:

```javascript
class Counter {
  constructor(begin, end, step = 1) {
    this.begin = begin;
    this.end = end;
    this.step = step;
  }
  
  [Symbol.iterator]() {
    let i = this.begin;
    const end = this.end;
    const step = this.step;
    
    return {
      next() {
        const item = {
          value: i,
          done: i > end
        };
        i += step;
        return item;
      }
    };
  }
}

// Usage
const counter = new Counter(0, 10, 2);
for (const n of counter) {
  console.log(n);  // 0, 2, 4, 6, 8, 10
}
```

**Characteristics:**
- ✅ Configurable (begin, end, step)
- ✅ Reusable instances
- ✅ Clear encapsulation
- ✅ Works with all iterator consumers

### 4. Built-in Iterables (4-array.js)

JavaScript built-ins implement Iterator Protocol:

```javascript
const array = [0, 1, 2];
const iterator = array[Symbol.iterator]();

iterator.next();  // { value: 0, done: false }
iterator.next();  // { value: 1, done: false }
iterator.next();  // { value: 2, done: false }
iterator.next();  // { value: undefined, done: true }
```

**Built-in Iterables:**
- Array, TypedArray
- String
- Map, Set
- arguments object
- NodeList (DOM)
- Generator objects

### 5. Generator Functions (5-generator.js, 6-yield.js)

Modern approach using generators:

```javascript
function* gen() {
  let i = 0;
  while (true) {
    if (i >= 3) return;
    yield i++;
  }
}

// Usage
for (const value of gen()) {
  console.log(value);  // 0, 1, 2
}
```

**Characteristics:**
- ✅ Simplest syntax
- ✅ Automatic iterator protocol
- ✅ Lazy evaluation
- ✅ Can pause/resume
- ✅ yield* delegation
- ✅ Recommended for custom iterators

## Generators - The Modern Way

### Basic Generator

```javascript
function* numbers() {
  yield 1;
  yield 2;
  yield 3;
}

for (const n of numbers()) {
  console.log(n);  // 1, 2, 3
}
```

### Generator with Logic

```javascript
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Infinite sequence!
const fib = fibonacci();
fib.next().value;  // 0
fib.next().value;  // 1
fib.next().value;  // 1
fib.next().value;  // 2
fib.next().value;  // 3
fib.next().value;  // 5
```

### yield* Delegation

Delegate to another iterable:

```javascript
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield* gen1();  // Delegate to gen1
  yield 3;
  yield 4;
}

[...gen2()];  // [1, 2, 3, 4]
```

## Real-World Use Cases

### 1. **Custom Data Structures**

Make custom collections iterable:

```javascript
class LinkedList {
  constructor() {
    this.head = null;
  }
  
  *[Symbol.iterator]() {
    let node = this.head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }
}

// Usage
const list = new LinkedList();
for (const value of list) {
  console.log(value);
}
```

### 2. **Range Generation**

```javascript
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

// Usage
for (const n of range(0, 10, 2)) {
  console.log(n);  // 0, 2, 4, 6, 8
}

// Or
const numbers = [...range(1, 6)];  // [1, 2, 3, 4, 5]
```

### 3. **Infinite Sequences**

```javascript
function* naturals() {
  let i = 0;
  while (true) {
    yield i++;
  }
}

// Take first N
function* take(n, iterable) {
  let count = 0;
  for (const value of iterable) {
    if (count++ >= n) break;
    yield value;
  }
}

// Usage
const first10 = [...take(10, naturals())];  // [0,1,2...9]
```

### 4. **Lazy Evaluation**

```javascript
function* map(fn, iterable) {
  for (const value of iterable) {
    yield fn(value);
  }
}

function* filter(predicate, iterable) {
  for (const value of iterable) {
    if (predicate(value)) yield value;
  }
}

// Lazy pipeline
const numbers = range(0, 100);
const evens = filter(n => n % 2 === 0, numbers);
const squared = map(n => n * n, evens);

// Nothing computed yet!
// Only when consumed:
const first5 = [...take(5, squared)];  // [0, 4, 16, 36, 64]
```

### 5. **Async Iterators**

```javascript
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const data = await fetch(`${url}?page=${page}`);
    if (!data.items.length) break;
    yield* data.items;
    page++;
  }
}

// Usage
for await (const item of fetchPages('/api/items')) {
  console.log(item);
}
```

### 6. **Tree Traversal**

```javascript
class TreeNode {
  constructor(value) {
    this.value = value;
    this.children = [];
  }
  
  *[Symbol.iterator]() {
    // Depth-first traversal
    yield this.value;
    for (const child of this.children) {
      yield* child;  // Recursively iterate children
    }
  }
}

// Usage
const tree = new TreeNode(1);
tree.children.push(new TreeNode(2), new TreeNode(3));
[...tree];  // [1, 2, 3]
```

## Iterator Protocol Details

### Iterator Result Object

```javascript
{
  value: any,       // Current value (undefined when done)
  done: boolean     // true if iteration complete
}
```

### Protocol Contract

```javascript
interface Iterator {
  next(): IteratorResult;
  return?(value): IteratorResult;  // Optional: Early termination
  throw?(error): IteratorResult;   // Optional: Error injection
}

interface IteratorResult {
  value: any;
  done: boolean;
}
```

### Iterable Contract

```javascript
interface Iterable {
  [Symbol.iterator](): Iterator;
}
```

## Benefits

### 1. **Uniform Interface**

Same iteration API for all collections:

```javascript
for (const x of array) { }      // Array
for (const x of set) { }        // Set
for (const x of map) { }        // Map
for (const x of customCollection) { }  // Custom
```

### 2. **Lazy Evaluation**

Values computed on demand:

```javascript
function* infinite() {
  let i = 0;
  while (true) yield i++;
}

// Infinite sequence, but only computes what's needed
const first5 = [...take(5, infinite())];
```

### 3. **Memory Efficiency**

Don't need to load all data:

```javascript
function* lines(filename) {
  // Read file line by line (not all at once)
  // Yield one line at a time
}

for (const line of lines('huge-file.txt')) {
  process(line);  // Process one line at a time
}
```

### 4. **Composability**

Chain iterator operations:

```javascript
const result = pipe(
  range(0, 100),
  filter(n => n % 2 === 0),
  map(n => n * n),
  take(5)
);
```

### 5. **State Management**

Iterator maintains position:

```javascript
const iterator = array[Symbol.iterator]();
iterator.next();  // First
// ... do other things ...
iterator.next();  // Second (remembers position)
```

## Manual vs Generator Comparison

### Manual Implementation

```javascript
// Verbose - must manually track state
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return {
          value: i,
          done: i++ >= 3
        };
      }
    };
  }
};
```

### Generator Implementation

```javascript
// Concise - automatic state management
function* iterable() {
  let i = 0;
  while (i < 3) {
    yield i++;
  }
}
```

**Benefits of Generators:**
- ✅ Less boilerplate
- ✅ Automatic state management
- ✅ Clearer logic
- ✅ Can use normal control flow (if, while, for)
- ✅ Can yield* delegate to other iterables

## Pattern Evolution (Files)

### 1-iterator.js - Basic Iterator

```javascript
const iterator = {
  next() {
    return { value, done };
  }
};

// Manual next() calls
iterator.next();
iterator.next();
```

**Shows:** Basic iterator protocol

### 2-iterable.js - Iterable Protocol

```javascript
const iterable = {
  [Symbol.iterator]() {
    return iterator;
  }
};

// Works with for-of and spread
for (const x of iterable) { }
[...iterable]
```

**Shows:** Iterable protocol enabling for-of

### 3-class.js - Class-Based

```javascript
class Counter {
  [Symbol.iterator]() {
    return iterator;
  }
}

const counter = new Counter(0, 10);
for (const n of counter) { }
```

**Shows:** Reusable iterable class

### 4-array.js - Built-in Iterator

```javascript
const array = [0, 1, 2];
const iterator = array[Symbol.iterator]();
```

**Shows:** Built-in iterables (Array)

### 5-generator.js - Generator Function

```javascript
function* gen() {
  let i = 0;
  while (true) {
    if (i >= 3) return;
    yield i++;
  }
}
```

**Shows:** Modern generator approach

### 6-yield.js - yield* Delegation

```javascript
function* gen() {
  yield* [0, 1, 2];
}
```

**Shows:** Delegating to another iterable

## When to Use

### ✅ Use Iterator Pattern When:

1. **Custom collections** need standard traversal
2. **Lazy evaluation** beneficial (don't load all data)
3. **Infinite sequences** (generators)
4. **Memory constraints** (process one item at a time)
5. **Streaming data** (process as it arrives)
6. **Hide implementation** (don't expose internal structure)
7. **Uniform interface** across different collections

### ❌ Don't Use When:

1. **Simple arrays** (built-in iteration sufficient)
2. **Random access** needed (iterators are sequential)
3. **Bidirectional** traversal required (iterators are forward-only)
4. **Index-based** operations needed
5. **Multiple simultaneous** traversals (create multiple iterators)

## JavaScript Built-in Iterables

### Arrays

```javascript
const arr = [1, 2, 3];
for (const x of arr) { }
```

### Strings

```javascript
const str = "hello";
for (const char of str) {
  console.log(char);  // 'h', 'e', 'l', 'l', 'o'
}
```

### Maps

```javascript
const map = new Map([['a', 1], ['b', 2]]);
for (const [key, value] of map) {
  console.log(key, value);
}
```

### Sets

```javascript
const set = new Set([1, 2, 3]);
for (const value of set) {
  console.log(value);
}
```

### Arguments

```javascript
function fn() {
  for (const arg of arguments) {
    console.log(arg);
  }
}
```

## Advanced Patterns

### 1. **Iterator Helpers (Proposal)**

```javascript
[1, 2, 3, 4, 5]
  .values()
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .take(2)
  .toArray();  // [4, 16]
```

### 2. **Async Iteration**

```javascript
async function* asyncGen() {
  for (let i = 0; i < 3; i++) {
    await sleep(1000);
    yield i;
  }
}

for await (const value of asyncGen()) {
  console.log(value);  // 0 (1s) 1 (1s) 2
}
```

### 3. **Infinite Sequences with take**

```javascript
function* naturals() {
  let i = 0;
  while (true) yield i++;
}

function* take(n, iterable) {
  let count = 0;
  for (const value of iterable) {
    if (count++ >= n) return;
    yield value;
  }
}

[...take(5, naturals())];  // [0, 1, 2, 3, 4]
```

### 4. **Iterator Pipeline**

```javascript
function* map(fn, iterable) {
  for (const value of iterable) {
    yield fn(value);
  }
}

function* filter(pred, iterable) {
  for (const value of iterable) {
    if (pred(value)) yield value;
  }
}

// Compose
const pipeline = map(
  n => n * n,
  filter(
    n => n % 2 === 0,
    range(0, 20)
  )
);

[...pipeline];  // [0, 4, 16, 36, 64, 100, 144, 196, 256, 324]
```

## Best Practices

### 1. **Use Generators**

```javascript
// ✅ Good: Generator (simple)
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

// ❌ Bad: Manual iterator (complex)
function range(start, end) {
  return {
    [Symbol.iterator]() {
      let i = start;
      return {
        next() {
          return {
            value: i,
            done: i++ >= end
          };
        }
      };
    }
  };
}
```

### 2. **Make Collections Iterable**

```javascript
class CustomCollection {
  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }
}
```

### 3. **Lazy Evaluation**

```javascript
// Don't pre-compute
function* lazyMap(fn, iterable) {
  for (const value of iterable) {
    yield fn(value);  // Computed on demand
  }
}

// vs eager
function eagerMap(fn, iterable) {
  return [...iterable].map(fn);  // All computed immediately
}
```

### 4. **Early Return**

```javascript
function* search(predicate, iterable) {
  for (const value of iterable) {
    if (predicate(value)) {
      yield value;
      return;  // Stop after first match
    }
  }
}
```

## Summary

The Iterator Pattern provides sequential access to collection elements without exposing internal structure. JavaScript's native Iterator and Iterable protocols, combined with generators, make this pattern incredibly powerful and easy to use.

### Key Takeaways:

1. **Iterator Protocol**: Object with `next()` method
2. **Iterable Protocol**: Object with `[Symbol.iterator]()` method
3. **for-of**: Uses iterable protocol
4. **Spread**: Uses iterable protocol
5. **Generators**: Simplest way to create iterators
6. **Lazy**: Values computed on demand
7. **Composable**: Chain iterator operations
8. **Built-in**: Array, Set, Map all iterable

### Pattern Evolution:

```
1-iterator.js  → Basic iterator (manual next())
                 ↓
2-iterable.js  → Iterable protocol (for-of works)
                 ↓
3-class.js     → Class-based iterable
                 ↓
4-array.js     → Built-in iterables
                 ↓
5-generator.js → ✅ Generators (recommended)
                 ↓
6-yield.js     → yield* delegation
```

### Recommendation:

**Use generators (function*)** for custom iterators:
- Simpler syntax
- Automatic protocol implementation
- Built-in state management
- Clearer logic
- More powerful (pause/resume)

The Iterator Pattern is one of the most useful patterns in JavaScript, enabling elegant traversal of any data structure with a uniform interface!