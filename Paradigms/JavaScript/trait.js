/*
Paradigm: Traits (ad-hoc polymorphism) with Ownership/Move semantics

Summary:
- A Trait represents a named capability (e.g., Clonable, Movable, Serializable) that can be implemented
  for arbitrary objects at runtime. This enables ad-hoc polymorphism (behavior decoupled from types).
- Box models ownership and move semantics: a value can be “moved” (transferred) or “dropped” (disposed),
  after which the original box can no longer be used. This encourages explicit resource lifetimes.

When to use:
- You need to compose behaviors across different objects without inheritance hierarchies.
- Plugin systems or cross-cutting capabilities where implementations are registered dynamically.
- Resource-sensitive logic where explicit move/dispose semantics help prevent use-after-free patterns.

Trade-offs:
- Dynamic nature means fewer compile-time guarantees; runtime checks and documentation are essential.
- Indirection via registries can make control flow less obvious; traceability requires naming discipline.
- The Disposable “using” syntax and Symbol.dispose may require a modern runtime environment.

Step-by-step in this code:
1) Box: Ownership container with get (read), move (transfer ownership), and [Symbol.dispose] (drop on scope exit).
2) Trait: Global registry by name. Each trait stores per-object implementations in a WeakMap.
3) Trait.for(name): Fetches or creates a named Trait. implement(target, fn) wires a callable for that target.
4) invoke(box, ...args): Extracts owned value from Box, finds the implementation for that target, and calls it.
5) Traits defined: Clonable, Movable, Serializable. Each provides behavior for the created point object.
6) createPoint(x, y): Encapsulates state in a Box; registers trait implementations against a self object.
7) Execution: Use “using” to ensure Box disposal; invoke trait methods to clone, move, and serialize points.

Notes:
- Box ensures a moved/dropped value cannot be accessed (safety by explicit invalidation).
- Traits enable behavior addition without changing the object definition or using inheritance.
*/
'use strict';

 // 1) Ownership/Move box container to model resource safety for encapsulated values
class Box {
  #value = undefined;

  // Hold owned value; undefined means moved/dropped
  constructor(value) {
    this.#value = value;
  }

  // Read value if still owned; throws if already moved/dropped
  get() {
    if (this.#value !== undefined) return this.#value;
    throw new Error('Moved or dropped');
  }

  // Move semantics: transfer ownership into a new Box and invalidate this one
  move() {
    const val = this.get();
    this.#value = undefined;
    return new Box(val);
  }

  // Disposal hook: auto-drop value when leaving a `using` scope
  [Symbol.dispose]() {
    this.#value = undefined;
  }
}

 // 2) Dynamic trait registry + per-instance implementations
class Trait {
  static #registry = new Map();
  #implementations = new WeakMap();

  // Register a trait name (single instance per name)
  constructor(name) {
    this.name = name;
    Trait.#registry.set(name, this);
  }

  // Get or create a trait by name
  static for(name) {
    return Trait.#registry.get(name) || new Trait(name);
  }

  // Attach a callable implementation for a specific target object
  implement(target, callable) {
    if (typeof target !== 'object') {
      throw new TypeError(`Target is not Object`);
    }
    if (typeof callable !== 'function') {
      throw new TypeError(`Callable is not Function`);
    }
    this.#implementations.set(target, callable);
  }

  // Invoke trait on the owned value inside Box; validate presence of an implementation
  invoke(box, ...args) {
    const target = box.get();
    const callable = this.#implementations.get(target);
    if (callable === undefined) {
      throw new Error(`Trait not implementemented: ${this.name}`);
    }
    return callable(...args);
  }
}

 // 3) Define traits (capabilities) by name
const Clonable = Trait.for('Clonable');
const Movable = Trait.for('Movable');
const Serializable = Trait.for('Serializable');

 // 4) Factory: create a point with owned state and register trait implementations against `self`
const createPoint = (x, y) => {
  using point = new Box({ x, y });
  const self = Object.create(null);

  // Provide cloning behavior (returns a new owned point)
  Clonable.implement(self, () => {
    const { x, y } = point.get();
    return createPoint(x, y);
  });

  // Provide movement behavior (returns a new moved point; original remains owned)
  Movable.implement(self, (d) => {
    const p = point.get();
    return createPoint(p.x + d.x, p.y + d.y);
  });

  // Provide serialization behavior (returns string form)
  Serializable.implement(self, () => {
    const { x, y } = point.get();
    return `(${x}, ${y})`;
  });

  // Return a Box owning the trait-enabled `self` object
  return new Box(self);
};

// Usage

 // 5) Execution: use traits via invoke; `using` ensures resources are disposed
const main = () => {
  using p1 = createPoint(10, 20);
  console.log(Serializable.invoke(p1));
  using c0 = Clonable.invoke(p1);
  console.log(Serializable.invoke(c0));
  using c1 = Movable.invoke(c0, { x: -5, y: 10 });
  console.log(Serializable.invoke(c1));
};

main();
