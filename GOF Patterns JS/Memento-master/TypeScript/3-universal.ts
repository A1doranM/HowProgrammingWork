'use strict';

type State = Record<string, number>;

interface IHistorizable {
  save(): State;
  restore(snapshot: State): void;
}

class Inventory implements IHistorizable {
  private items: State = {};

  addItem(itemName: string, quantity: number): void {
    const prev = this.items[itemName] || 0;
    this.items[itemName] = prev + quantity;
  }

  removeItem(itemName: string, quantity: number): void {
    const prev = this.items[itemName];
    if (!prev) {
      if (quantity !== 0) throw new Error('Insufficient quantity');
      return;
    }
    const current = prev - quantity;
    if (current > 0) this.items[itemName] = current;
    else if (current === 0) delete this.items[itemName];
    else throw new Error('Insufficient quantity');
  }

  showItems(): void {
    console.log('Current Inventory:\n ', this.items);
  }

  save(): State {
    return Object.assign({}, this.items);
  }

  restore(snapshot: State): void {
    this.items = snapshot;
  }
}

class HistoryManager {
  #directory: Map<IHistorizable, State[]> = new Map();

  saveSnapshot(historizable: IHistorizable): void {
    const snapshot = historizable.save();
    const history = this.#directory.get(historizable);
    if (history) history.push(snapshot);
    else this.#directory.set(historizable, [snapshot]);
  }

  restoreSnapshot(historizable: IHistorizable): void {
    const history = this.#directory.get(historizable);
    if (!history) return;
    const snapshot = history.pop() as State;
    historizable.restore(snapshot);
    if (history.length === 0) this.#directory.delete(historizable);
  }
}

// Usage

const inventory = new Inventory();
const historyManager = new HistoryManager();

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
