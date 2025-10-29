'use strict';

class OrderState {
  constructor(context) {
    this.context = context;
  }

  cancel(reason) {
    console.log('Action is not allowed in the current state.');
  }

  pay(amount) {
    console.log('Action is not allowed in the current state.');
  }

  message(text) {
    console.log('Action is not allowed in the current state.');
  }
}

class OrderCanceledState extends OrderState {
  cancel(reason) {
    console.log('The order is already canceled.');
  }
}

class OrderPaidState extends OrderState {
  cancel(reason) {
    console.log('Order canceled. The money will be returned.');
  }

  message(text) {
    console.log('Your message has been sent.');
  }
}

class SearchingDriverState extends OrderState {
  cancel(reason) {
    console.log('Order canceled. No driver was assigned.');
    this.context.setState(OrderCanceledState);
  }

  pay(amount) {
    console.log('You cannot pay before the car is found.');
  }

  message(text) {
    console.log('You cannot message before the car is found.');
  }
}

class DriverAssignedState extends OrderState {
  cancel(reason) {
    console.log('Order canceled. Informing the driver.');
    this.context.setState(OrderCanceledState);
  }

  pay(amount) {
    console.log(`Payment ${amount} processed. Thank you!`);
    this.context.setState(OrderPaidState);
  }

  message(text) {
    console.log('Driver assigned. Your message has been sent.');
  }
}

class RideInProgressState extends OrderState {
  cancel(reason) {
    console.log('You cannot cancel the ride while in progress.');
  }
}

class RideCompletedState extends OrderState {
  cancel(reason) {
    console.log('You cannot cancel the ride after completion.');
  }
}

class TaxiOrderContext {
  constructor() {
    this.state = new SearchingDriverState(this);
  }

  setState(StateClass) {
    this.state = new StateClass(this);
  }

  cancel(reason) {
    const state = this.state.constructor.name;
    console.log(`State: ${state}, Cancel: ${reason}`);
    this.state.cancel(reason);
  }

  pay(amount) {
    const state = this.state.constructor.name;
    console.log(`State: ${state}, Pay: ${amount}`);
    this.state.pay(amount);
  }

  message(text) {
    const state = this.state.constructor.name;
    console.log(`State: ${state}, Message: ${text}`);
    this.state.message(text);
  }
}

// Usage

const order = new TaxiOrderContext();
order.message('Hello');
order.cancel('I changed plans');

const newOrder = new TaxiOrderContext();
newOrder.message('Hello');
newOrder.setState(DriverAssignedState);
newOrder.message('Waiting...');
newOrder.cancel('No longer needed');

const ride = new TaxiOrderContext();
ride.setState(RideInProgressState);
ride.message('Hello');
ride.pay(50);
ride.cancel('Return my money');
ride.setState(RideCompletedState);
ride.pay(50);
ride.cancel('Return my money');
