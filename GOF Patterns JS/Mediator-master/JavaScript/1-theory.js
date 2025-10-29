'use strict';

class Colleague {
  constructor(mediator) {
    const proto = Object.getPrototypeOf(this);
    if (proto.constructor === Colleague) {
      throw new Error('Abstract class should not be instanciated');
    }
    this.mediator = mediator;
  }

  send(message) {
    this.mediator.send(message, this);
  }

  notify(message) {
    const entity = this.constructor.name;
    const s = JSON.stringify({ notify: message });
    throw new Error(`Method "notify" is not implemented for ${entity}: ${s}`);
  }
}

class Mediator {
  send(message, sender) {
    const entity = this.constructor.name;
    const s = JSON.stringify({ send: { message, sender } });
    throw new Error(`Method "send" is not implemented for ${entity}: ${s}`);
  }
}

class Employee extends Colleague {
  constructor(mediator) {
    super(mediator);
    mediator.employee = this;
  }

  notify(message) {
    const entity = this.constructor.name;
    console.log(`${entity} gets message: ${message}`);
  }
}

class Manager extends Colleague {
  constructor(mediator) {
    super(mediator);
    mediator.manager = this;
  }

  notify(message) {
    const entity = this.constructor.name;
    console.log(`${entity} gets message: ${message}`);
  }
}

class Messenger extends Mediator {
  constructor() {
    super();
    this.employee = null;
    this.manager = null;
  }

  send(message, sender) {
    const { employee, manager } = this;
    const target = sender === manager ? employee : manager;
    target.notify(message);
  }
}

// Usage

const mediator = new Messenger();
const employee = new Employee(mediator);
const manager = new Manager(mediator);
console.dir(mediator);

employee.send('Ping');
manager.send('Pong');
