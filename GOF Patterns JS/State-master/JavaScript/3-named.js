'use strict';

class TaxiOrderContext {
  constructor(behaviour) {
    this.behaviour = behaviour;
    this.setState('searching');
  }

  setState(state) {
    const actions = this.behaviour[state];
    if (!actions) throw new Error(`State ${state} is not defined`);
    this.state = state;
  }

  execute(name, ...args) {
    const actions = this.behaviour[this.state];
    const action = actions[name] || this.behaviour.default[name];
    const result = action(...args);
    if (result) this.setState(result);
  }

  cancel(reason) {
    console.log(`State: ${this.state}, Cancel: ${reason}`);
    this.execute('cancel', reason);
  }

  pay(amount) {
    console.log(`State: ${this.state}, Pay: ${amount}`);
    this.execute('pay', amount);
  }

  message(text) {
    console.log(`State: ${this.state}, Message: ${text}`);
    this.execute('message', text);
  }
}

const STATE = {
  default: {
    cancel: (reason) => {
      console.log('Action is not allowed in the current state.');
    },
    pay: (amount) => {
      console.log('Action is not allowed in the current state.');
    },
    message: (text) => {
      console.log('Action is not allowed in the current state.');
    },
  },

  canceled: {
    cancel: (reason) => {
      console.log('The order is already canceled.');
    },
  },

  paid: {
    cancel: (reason) => {
      console.log('Order canceled. The money will be returned.');
    },
    message: (text) => {
      console.log('Your message has been sent.');
    },
  },

  searching: {
    cancel: (reason) => {
      console.log('Order canceled. No driver was assigned.');
      return 'canceled';
    },
    pay: (amount) => {
      console.log('You cannot pay before the car is found.');
    },
    message: (text) => {
      console.log('You cannot message before the car is found.');
    },
  },

  assigned: {
    cancel: (reason) => {
      console.log('Order canceled. Informing the driver.');
      return 'canceled';
    },
    pay: (amount) => {
      console.log(`Payment ${amount} processed. Thank you!`);
      return 'paid';
    },
    message: (text) => {
      console.log('Driver assigned. Your message has been sent.');
    },
  },

  progress: {
    cancel: (reason) => {
      console.log('You cannot cancel the ride while in progress.');
    },
  },

  completed: {
    cancel: (reason) => {
      console.log('You cannot cancel the ride after completion.');
    },
  },
};

// Usage

const order = new TaxiOrderContext(STATE);
order.message('Hello');
order.cancel('I changed plans');

const newOrder = new TaxiOrderContext(STATE);
newOrder.message('Hello');
newOrder.setState('assigned');
newOrder.message('Waiting...');
newOrder.cancel('No longer needed');

const ride = new TaxiOrderContext(STATE);
ride.setState('progress');
ride.message('Hello');
ride.pay(50);
ride.cancel('Return my money');
ride.setState('completed');
ride.pay(50);
ride.cancel('Return my money');
