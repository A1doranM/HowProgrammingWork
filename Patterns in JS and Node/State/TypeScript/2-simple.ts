abstract class OrderState {
  protected context: TaxiOrderContext;

  constructor(context: TaxiOrderContext) {
    this.context = context;
  }

  cancel(reason: string): void {
    console.log('Action is not allowed in the current state.');
  }

  pay(amount: number): void {
    console.log('Action is not allowed in the current state.');
  }

  message(text: string): void {
    console.log('Action is not allowed in the current state.');
  }
}

class OrderCanceledState extends OrderState {
  cancel(reason: string): void {
    console.log('The order is already canceled.');
  }
}

class OrderPaidState extends OrderState {
  cancel(reason: string): void {
    console.log('Order canceled. The money will be returned.');
  }

  message(text: string): void {
    console.log('Your message has been sent.');
  }
}

class SearchingDriverState extends OrderState {
  cancel(reason: string): void {
    console.log('Order canceled. No driver was assigned.');
    this.context.setState(OrderCanceledState);
  }

  pay(amount: number): void {
    console.log('You cannot pay before the car is found.');
  }

  message(text: string): void {
    console.log('You cannot message before the car is found.');
  }
}

class DriverAssignedState extends OrderState {
  cancel(reason: string): void {
    console.log('Order canceled. Informing the driver.');
    this.context.setState(OrderCanceledState);
  }

  pay(amount: number): void {
    console.log(`Payment ${amount} processed. Thank you!`);
    this.context.setState(OrderPaidState);
  }

  message(text: string): void {
    console.log('Driver assigned. Your message has been sent.');
  }
}

class RideInProgressState extends OrderState {
  cancel(reason: string): void {
    console.log('You cannot cancel the ride while in progress.');
  }
}

class RideCompletedState extends OrderState {
  cancel(reason: string): void {
    console.log('You cannot cancel the ride after completion.');
  }
}

type StateConstructor = new (context: TaxiOrderContext) => OrderState;

class TaxiOrderContext {
  private state: OrderState;

  constructor() {
    this.state = new SearchingDriverState(this);
  }

  setState(StateClass: StateConstructor): void {
    this.state = new StateClass(this);
  }

  cancel(reason: string): void {
    const state = Object.getPrototypeOf(this.state).constructor.name;
    console.log(`State: ${state}, Cancel: ${reason}`);
    this.state.cancel(reason);
  }

  pay(amount: number): void {
    const state = Object.getPrototypeOf(this.state).constructor.name;
    console.log(`State: ${state}, Pay: ${amount}`);
    this.state.pay(amount);
  }

  message(text: string): void {
    const state = Object.getPrototypeOf(this.state).constructor.name;
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
