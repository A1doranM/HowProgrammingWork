'use strict';

// Memento: Captures and stores the state of the Originator

class InventorySnapshot {
  private readonly state: Record<string, number>;

  constructor(state: Record<string, number>) {
    this.state = state;
  }

  getState(): Record<string, number> {
    return this.state;
  }
}

// Originator: The object whose state we want to save and restore

class Inventory {
  private items: Record<string, number>;

  constructor() {
    this.items = {};
  }

  addItem(itemName: string, quantity: number): void {
    const prev = this.items[itemName] || 0;
    this.items[itemName] = prev + quantity;
  }

  removeItem(itemName: string, quantity: number): void {
    const prev = this.items[itemName];
    if (!prev) {
      if (quantity !== 0) throw Error('Insufficient quantity');
      return;
    }
    const current = prev - quantity;
    this.items[itemName] = current;
    if (current > 0) this.items[itemName] = current;
    else if (current === 0) delete this.items[itemName];
    else throw Error('Insufficient quantity');
  }

  showItems(): void {
    console.log('Current Inventory:\n ', this.items);
  }

  save(): InventorySnapshot {
    return new InventorySnapshot({ ...this.items });
  }

  restore(snapshot: InventorySnapshot): void {
    this.items = snapshot.getState();
  }
}

// Caretaker: Manages snapshots for the Originator

class InventoryHistoryManager {
  private history: InventorySnapshot[];

  constructor() {
    this.history = [];
  }

  saveSnapshot(inventory: Inventory): void {
    this.history.push(inventory.save());
  }

  restoreSnapshot(inventory: Inventory): void {
    if (this.history.length > 0) {
      const snapshot = this.history.pop();
      if (snapshot) {
        inventory.restore(snapshot);
      }
    }
  }
}

// Usage

const inventory = new Inventory();
const historyManager = new InventoryHistoryManager();

// Initial items

inventory.addItem('keyboard', 10);
inventory.addItem('laptop', 5);
historyManager.saveSnapshot(inventory);

inventory.addItem('phone', 20);
inventory.addItem('router', 15);
historyManager.saveSnapshot(inventory);

inventory.addItem('mouse', 25);
inventory.showItems();

// Current Inventory:
// { keyboard: 10, laptop: 5, phone: 20, router: 15, mouse: 25 }

// Undo last addition

historyManager.restoreSnapshot(inventory);
inventory.showItems();

// Current Inventory:
// { keyboard: 10, laptop: 5, phone: 20, router: 15 }

// Undo another change

historyManager.restoreSnapshot(inventory);
inventory.showItems();

// Current Inventory:
// { keyboard: 10, laptop: 5 }
