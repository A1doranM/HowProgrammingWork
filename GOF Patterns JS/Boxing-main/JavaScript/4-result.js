'use strict';

class Sum {
  static create(shape) {
    const keys = Object.keys(shape);
    if (keys.length !== 1) {
      throw new Error('Sum.create expects a single root tag');
    }
    const tag = keys[0];
    const variants = shape[tag];
    const names = Object.keys(variants);

    return class Struct {
      static tag = tag;
      static variants = names;

      constructor(...args) {
        return Struct.create(...args);
      }

      static create(value) {
        for (let i = 0; i < names.length; i++) {
          const variant = names[i];
          const VariantClass = variants[variant];
          if (VariantClass.is(value)) {
            return new VariantClass(value);
          }
        }
        throw new Error('No matching variant for value');
      }
    };
  }
}

class Value {
  #value = null;

  constructor(value) {
    this.#value = value;
  }

  get value() {
    return this.#value;
  }

  static is(value) {
    return !(value instanceof Error);
  }
}

class Failure {
  #error = null;

  constructor(error) {
    this.#error = error;
  }

  get error() {
    return this.#error;
  }

  static is(error) {
    return error instanceof Error;
  }
}

// Usage

const Result = Sum.create({
  Result: {
    value: Value,
    error: Failure,
  },
});

const success = Result.create('Successfully received data');
const failure = Result.create(new Error('Network error'));

console.log('Success:', success.value);
console.log('Failure:', failure.error.message);
