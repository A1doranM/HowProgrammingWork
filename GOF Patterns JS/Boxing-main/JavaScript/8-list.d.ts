export declare class List<T = unknown> {
  constructor(items?: T[]);

  get length(): number;

  isEmpty(): boolean;

  head(): T | undefined;

  tail(): List<T>;

  map<U>(fn: (item: T) => U): List<U>;

  flatMap<U>(fn: (item: T) => List<U> | U): List<U>;

  filter(fn: (item: T) => boolean): List<T>;

  append(value: T): List<T>;

  prepend(value: T): List<T>;

  toArray(): T[];
}
