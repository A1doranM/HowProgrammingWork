'use strict';

class List {
  #items;

  constructor(items = []) {
    this.#items = Array.isArray(items) ? items.slice() : [];
  }

  get length() {
    return this.#items.length;
  }

  isEmpty() {
    return this.#items.length === 0;
  }

  head() {
    return this.isEmpty() ? undefined : this.#items[0];
  }

  tail() {
    return this.isEmpty() ? new List() : new List(this.#items.slice(1));
  }

  map(fn) {
    return new List(this.#items.map(fn));
  }

  flatMap(fn) {
    const mapped = this.#items.map(fn);
    const flattened = mapped.reduce(
      (acc, item) => acc.concat(item instanceof List ? item.#items : item),
      [],
    );
    return new List(flattened);
  }

  filter(fn) {
    return new List(this.#items.filter(fn));
  }

  append(value) {
    return new List([...this.#items, value]);
  }

  prepend(value) {
    return new List([value, ...this.#items]);
  }

  toArray() {
    return this.#items.slice();
  }
}

// Usage

const list = new List([1, 2, 3]);

console.log(list.length); // 3
console.log(list.head()); // 1
console.log(list.tail().toArray()); // [2, 3]

const mapped = list.map((x) => x * 2);
console.log(mapped.toArray()); // [2, 4, 6]

const filtered = list.filter((x) => x > 1);
console.log(filtered.toArray()); // [2, 3]

const appended = list.append(4);
console.log(appended.toArray()); // [1, 2, 3, 4]

const prepended = list.prepend(0);
console.log(prepended.toArray()); // [0, 1, 2, 3]

const flatMapped = list.flatMap((x) => new List([x, x * 10]));
console.log(flatMapped.toArray()); // [1, 10, 2, 20, 3, 30]
