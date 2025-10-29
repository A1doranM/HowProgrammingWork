'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Money {
  amount;
  currency;

  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  add(value) {
    if (this.currency !== value.currency) {
      throw new Error('Currency mismatch');
    }
    return new Money(this.amount + value.amount, this.currency);
  }

  equals({ amount, currency }) {
    return this.amount === amount && this.currency === currency;
  }
}

// Usage

const price = new Money(100, 'USD');
const tax = new Money(20, 'USD');
const total = price.add(tax);
console.log(total.equals(new Money(120, 'USD')));
