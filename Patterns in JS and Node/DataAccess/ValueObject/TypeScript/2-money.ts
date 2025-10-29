class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  add(value: Money): Money {
    if (this.currency !== value.currency) {
      throw new Error('Currency mismatch');
    }
    return new Money(this.amount + value.amount, this.currency);
  }

  equals({ amount, currency }: Money): boolean {
    return this.amount === amount && this.currency === currency;
  }
}

// Usage

const price = new Money(100, 'USD');
const tax = new Money(20, 'USD');
const total = price.add(tax);

console.log(total.equals(new Money(120, 'USD')));
