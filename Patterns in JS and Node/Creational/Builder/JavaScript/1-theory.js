'use strict';

class Product {
  constructor() {
    this.field1 = 'value1';
    this.field2 = 'value2';
    this.field3 = 'value3';
  }
}

class AbstractBuilder {
  constructor() {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === AbstractBuilder) {
      throw new Error('Abstract class should not be instanciated');
    }
  }

  createInstance() {
    throw new Error('Method is not implemented');
  }

  step1() {
    throw new Error('Method is not implemented');
  }

  step2() {
    throw new Error('Method is not implemented');
  }

  step3() {
    throw new Error('Method is not implemented');
  }

  getInstance() {
    throw new Error('Method is not implemented');
  }
}

class ConcreteBuilder extends AbstractBuilder {
  constructor() {
    super();
    this.instance = null;
  }

  createInstance() {
    this.instance = new Product();
  }

  step1() {
    this.instance.field1 = 'step1';
  }

  step2() {
    this.instance.field2 = 'step2';
  }

  step3() {
    this.instance.field3 = 'step3';
  }

  getInstance() {
    return this.instance;
  }
}

class Director {
  constructor(builder) {
    this.builder = builder;
  }

  createInstance() {
    this.builder.createInstance();
    this.builder.step1();
    this.builder.step2();
    this.builder.step3();
    return this.builder.getInstance();
  }
}

// Usage

const builder = new ConcreteBuilder();
console.dir(builder);

const director = new Director(builder);
console.dir(director);

const instance = director.createInstance();
console.dir(instance);
