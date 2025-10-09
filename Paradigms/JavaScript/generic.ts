/*
Paradigm: TypeScript Generics (Parametric Polymorphism over coordinate-like records)

Summary:
- Demonstrates a generic function and a generic class parameterized by T extends Record<string, number>.
- addVectors performs key-wise addition for any numeric record type T.
- Point<T> stores coordinates of type T and provides move/clone/toString without knowing concrete keys.

When to use:
- Reusable math/geometry utilities that operate on different numeric record shapes (2D, 3D, polar, etc.).
- Library code that must be agnostic to concrete field names while preserving type safety.
- Gradual generalization of domain types without copy-pasting per-shape implementations.

Trade-offs:
- Keys must match between operands; violation is a runtime concern. Consider stricter typing with K extends string and T = Record<K, number>.
- Object.values order is not guaranteed; formatting may depend on key insertion/insertion order.
- Shallow vs deep copy: clone uses a shallow copy; nested structures require deep copy.

Step-by-step in this code:
1) type Coords: Concrete 2D coordinate alias for demo.
2) addVectors<T>: Generic key-wise addition using keyof T and type assertions.
3) class Point<T>: Generic class with private #coords: T; data is opaque to methods.
4) constructor(coords: T): Initializes internal state.
5) move(delta: T): Replaces #coords with addVectors(#coords, delta).
6) clone(): Returns a new Point<T> with copied coords.
7) toString(): Joins Object.values(#coords) with ', ' and wraps in parentheses (ordering caveat).
8) Usage: Instantiate Point<Coords>, log, move, log.

Notes:
- For stronger typing, you can declare <K extends string, T extends Record<K, number>> and ensure delta keys match coords keys.
- Define an explicit key order for formatting to avoid reliance on property enumeration order when needed.
*/
type Coords = { x: number; y: number };

/** Generic key-wise addition over numeric record T */
function addVectors<T extends Record<string, number>>(a: T, b: T): T {
  const result = {} as T;
  for (const key of Object.keys(a) as Array<keyof T>) {
    result[key] = (a[key] + b[key]) as T[typeof key];
  }
  return result;
}

/** Generic point over numeric record T; uses private class fields (#coords) */
class Point<T extends Record<string, number>> {
  #coords: T;

  /** Initialize internal coordinates */
  constructor(coords: T) {
    this.#coords = coords;
  }

  /** Add delta to current coordinates (immutable replacement of #coords) */
  move(delta: T): void {
    this.#coords = addVectors(this.#coords, delta);
  }

  /** Shallow clone of coords into a new Point<T> */
  clone(): Point<T> {
    return new Point({ ...this.#coords });
  }

  /** Format coordinates by joining values (ordering follows property enumeration order) */
  toString(): string {
    return `(${Object.values(this.#coords).join(', ')})`;
  }
}

// Usage

/** Execution: instantiate a generic point and operate on it */
const p1 = new Point<Coords>({ x: 10, y: 20 });
console.log(p1.toString());
p1.move({ x: -5, y: 10 });
console.log(p1.toString());
