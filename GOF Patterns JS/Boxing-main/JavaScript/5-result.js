'use strict';

class Result {
  constructor({ value, error }) {
    this.value = value;
    this.error = error;
  }

  static create(input) {
    return new Result(
      input instanceof globalThis.Error
        ? { value: undefined, error: input }
        : { value: input, error: undefined },
    );
  }

  static fromValue(value) {
    return new Result({ value, error: undefined });
  }

  static fromError(error) {
    return new Result({ value: undefined, error });
  }

  isSuccess() {
    return this.error === undefined;
  }

  isError() {
    return this.error !== undefined;
  }
}

// Usage

const success = Result.create('Successfully received data');
const failure = Result.create(new Error('Network error'));

if (success.isSuccess()) {
  console.log('Success:', success.value);
}

if (failure.isError()) {
  console.log('Failure:', failure.error.message);
}
