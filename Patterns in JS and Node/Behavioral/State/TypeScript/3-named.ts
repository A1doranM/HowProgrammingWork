type StateActions = {
  cancel?: (reason: string) => string | void;
  pay?: (amount: number) => string | void;
  message?: (text: string) => string | void;
};

type Action = (...args: unknown[]) => string | void;

type Behaviour = {
  [state: string]: StateActions;
};

class TaxiOrderContext {
  private behaviour: Behaviour;
  private state: string = 'searching';

  constructor(behaviour: Behaviour) {
    this.behaviour = behaviour;
    this.setState(this.state);
  }

  setState(state: string): void {
    const actions = this.behaviour[state];
    if (!actions) throw new Error(`State ${state} is not defined`);
    this.state = state;
  }

  execute(name: keyof StateActions, ...args: unknown[]): void {
    const actions = this.behaviour[this.state];
    const action = (actions[name] || this.behaviour.default[name]) as Action;
    const result = action(...args);
    if (result) this.setState(result);
  }

  cancel(reason: string): void {
    console.log(`State: ${this.state}, Cancel: ${reason}`);
    this.execute('cancel', reason);
  }

  pay(amount: number): void {
    console.log(`State: ${this.state}, Pay: ${amount}`);
    this.execute('pay', amount);
  }

  message(text: string): void {
    console.log(`State: ${this.state}, Message: ${text}`);
    this.execute('message', text);
  }
}

const STATE: Behaviour = {
  default: {
    cancel: (reason: string) => {
      console.log('Action is not allowed in the current state.');
    },
    pay: (amount: number) => {
      console.log('Action is not allowed in the current state.');
    },
    message: (text: string) => {
      console.log('Action is not allowed in the current state.');
    },
  },

  canceled: {
    cancel: (reason: string) => {
      console.log('The order is already canceled.');
    },
  },

  paid: {
    cancel: (reason: string) => {
      console.log('Order canceled. The money will be returned.');
    },
    message: (text: string) => {
      console.log('Your message has been sent.');
    },
  },

  searching: {
    cancel: (reason: string) => {
      console.log('Order canceled. No driver was assigned.');
      return 'canceled';
    },
    pay: (amount: number) => {
      console.log('You cannot pay before the car is found.');
    },
    message: (text: string) => {
      console.log('You cannot message before the car is found.');
    },
  },

  assigned: {
    cancel: (reason: string) => {
      console.log('Order canceled. Informing the driver.');
      return 'canceled';
    },
    pay: (amount: number) => {
      console.log(`Payment ${amount} processed. Thank you!`);
      return 'paid';
    },
    message: (text: string) => {
      console.log('Driver assigned. Your message has been sent.');
    },
  },

  progress: {
    cancel: (reason: string) => {
      console.log('You cannot cancel the ride while in progress.');
    },
  },

  completed: {
    cancel: (reason: string) => {
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
