'use strict';

class Tuple {
  static create(...values) {
    const { length } = values;

    class Struct {
      static size = length;

      static create(...items) {
        if (items.length !== length) {
          throw new Error('Tuple arity mismatch');
        }
        return Object.freeze([...items]);
      }
    }
    return Struct;
  }
}

// Usage

const Point = Tuple.create(0, 0);
const point = Point.create(10, 20);
console.log(point); // [10, 20]
