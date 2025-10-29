'use strict';

// Abstract Validator

class Validator {
  validate(value) {
    throw new Error(`Not implemented: validate(${value})`);
  }
}

class BaseValidator extends Validator {
  validate(value) {
    return { value, valid: true, errors: [] };
  }
}

// Abstract Decorator

class ValidatorDecorator extends Validator {
  #validator;

  constructor(validator) {
    super();
    this.#validator = validator;
  }

  validate(value) {
    return this.#validator.validate(value);
  }
}

// Decorators implementations

class RequiredValidator extends ValidatorDecorator {
  validate(value) {
    const result = super.validate(value);
    if (!value) {
      result.valid = false;
      result.errors.push('Field is required');
    }
    return result;
  }
}

class EmailValidator extends ValidatorDecorator {
  validate(value) {
    const result = super.validate(value);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      result.valid = false;
      result.errors.push('Invalid email format');
    }
    return result;
  }
}

class MinLengthValidator extends ValidatorDecorator {
  #minLength = 20;

  constructor(validator, minLength) {
    super(validator);
    this.#minLength = minLength;
  }

  validate(value) {
    const result = super.validate(value);
    if (value.length < this.#minLength) {
      result.valid = false;
      result.errors.push(`Minimum length is ${this.#minLength}`);
    }
    return result;
  }
}

// Usage

const validator = new MinLengthValidator(
  new EmailValidator(new RequiredValidator(new BaseValidator())),
  20,
);

{
  const input = 'timur.shemsedinov@gmail.com';
  const result = validator.validate(input);
  console.log(result);
  // {
  //   value: 'timur.shemsedinov@gmail.com',
  //   valid: true,
  //   errors: []
  // }
}

{
  const input = 'timur@metarhia.com';
  const result = validator.validate(input);
  console.log(result);
  // {
  //   value: 'timur@metarhia.com',
  //   valid: false,
  //   errors: ['Minimum length is 20']
  // }
}
