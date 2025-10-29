'use strict';

class Colleague {
  constructor(mediator) {
    this.mediator = mediator;
  }

  send(message) {
    this.mediator.send(message, this);
  }
}

class Employee extends Colleague {
  constructor(mediator) {
    super(mediator);
    mediator.employee = this;
  }

  notify(message) {
    if (!this.mediator) throw new Error('Mediator is not set');
    console.log('Employee gets message: ' + message);
  }
}

class Manager extends Colleague {
  constructor(mediator) {
    super(mediator);
    mediator.manager = this;
  }

  notify(message) {
    if (!this.mediator) throw new Error('Mediator is not set');
    console.log('Manager gets message: ' + message);
  }
}

class Mediator {
  constructor() {
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

const mediator = new Mediator();
const employee = new Employee(mediator);
const manager = new Manager(mediator);
console.dir(mediator);

employee.send('Ping');
manager.send('Pong');
