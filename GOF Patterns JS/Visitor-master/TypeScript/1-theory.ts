// Elements to be visited

interface Availability {
  accept(visitor: Visitor): void;
}

class Product implements Availability {
  name: string;
  price: number;

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
  }

  accept(visitor: Visitor): void {
    visitor.visitProduct(this);
  }

  inStock() {
    return true; // Just a stub
  }
}

class Service implements Availability {
  name: string;

  private static SUNDAY = 0;
  private static SATURDAY = 6;

  constructor(name: string) {
    this.name = name;
  }

  accept(visitor: Visitor): void {
    visitor.visitService(this);
  }

  isAvailableAt(date: Date) {
    const day = date.getDay();
    return day > Service.SUNDAY && day < Service.SATURDAY;
  }
}

// Visitors to be acceped

interface Visitor {
  visitProduct(product: Product): void;
  visitService(service: Service): void;
}

class Purchase implements Visitor {
  items: Array<Product> = [];
  delivery: Service | null = null;

  constructor(items: Array<Product>, delivery: Service) {
    for (const item of items) {
      this.visitProduct(item);
    }
    this.visitService(delivery);
  }

  visitProduct(product: Product): void {
    const available = product.inStock();
    const status = `${available ? 'in' : 'out of'} stock`;
    console.log(`Product "${product.name}" is ${status}`);
    if (available) this.items.push(product);
  }

  visitService(service: Service): void {
    const now = new Date();
    const available = service.isAvailableAt(now);
    const status = `${available ? '' : 'not '}available`;
    console.log(`Service "${service.name}" is ${status}`);
    if (available) this.delivery = service;
  }
}

class Inspection implements Visitor {
  items: Array<Product>;

  constructor(items: Array<Product>) {
    this.items = [...items];
  }

  check() {
    for (const item of this.items) {
      this.visitProduct(item);
    }
  }

  visitProduct(product: Product): void {
    const available = product.inStock();
    const status = `${available ? 'in' : 'out of'} stock`;
    console.log(`Product "${product.name}" is ${status}`);
  }

  visitService(service: Service): void {
    if (service) throw new Error('Not implemented');
  }
}

// Usage

const p1 = new Product('Laptop', 1500);
const p2 = new Product('Keyboard', 100);
const delivery = new Service('Delivery');
const electronics = new Purchase([p1, p2], delivery);
console.dir({ electronics });

const inspection = new Inspection([p1, p2]);
inspection.check();
