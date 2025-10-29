'use strict';

class Class1 {
  methodName(...args) {
    console.log('Called: Class1.prototype.methodName', ...args);
  }
}

class Class2 {
  methodName(...args) {
    console.log('Called: Class2.prototype.methodName', ...args);
  }
}

class Factory {
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
