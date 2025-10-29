'use strict';

class AbstractFactory {
  constructor() {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === AbstractFactory) {
      throw new Error('Abstract class should not be instanciated');
    }
  }

  createClass1() {
    throw new Error('Method is not implemented');
  }

  createClass2() {
    throw new Error('Method is not implemented');
  }
}

class AbstractClass1 {
  constructor() {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === AbstractClass1) {
      throw new Error('Abstract class should not be instanciated');
    }
  }

  methodName() {
    throw new Error('Method is not implemented');
  }
}

class AbstractClass2 {
  constructor() {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === AbstractClass2) {
      throw new Error('Abstract class should not be instanciated');
    }
  }
}

class Class1 extends AbstractClass1 {
  methodName(...args) {
    console.log('Called: Class1.prototype.methodName', ...args);
  }
}

class Class2 extends AbstractClass2 {
  methodName(...args) {
    console.log('Called: Class2.prototype.methodName', ...args);
  }
}

class Factory extends AbstractFactory {
  createClass1(...args) {
    return new Class1(...args);
  }

  createClass2(...args) {
    return new Class2(...args);
  }
}

// Usage

const factory = new Factory();

const instance1 = factory.createClass1('value1');
const instance2 = factory.createClass2('value2');

console.dir(instance1);
console.dir(instance2);

instance1.methodName('value3');
instance2.methodName('value4');
