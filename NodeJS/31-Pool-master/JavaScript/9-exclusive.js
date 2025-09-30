"use strict";

class Pool {
  constructor() {
    this.items = []; // Массив всех элементов.
    this.free = []; // Массив не занятых элементов.
    this.current = 0; // Текущий элемент.
    this.size = 0; // Размер.
    this.available = 0; // Количество доступных элементов.
  }

  next() { // Возвращает первый свободный элемент.
    if (this.available === 0) return null; // Если нет свободных элементов, вернуть null.
    let item = null; //
    let free = false;
    do { // Проходим до элемента который одновременно существует и при этом он свободен.
      item = this.items[this.current]; // Забираем элемент.
      free = this.free[this.current];
      this.current++; // Увеличиваем текущий элемент.
      if (this.current === this.size) this.current = 0; // Если дошли до конца.
    } while (!item || !free);
    return item; // Возвращаем найденный элемент.
  }

  add(item) { // Добавляем элементы в коллекцию.
    if (this.items.includes(item)) throw new Error("Pool: add duplicates");
    this.size++;
    this.available++;
    this.items.push(item);
    this.free.push(true); // Ставим флаг о том что добавленный элемент доступен.
  }

  capture() { // Маркирует элемент занятым. То есть мы захватываем элемент.
    const item = this.next(); // Берем элемент.
    if (!item) return null; // Если не нашли.
    const index = this.items.indexOf(item); // Берем индекс элемента
    this.free[index] = false; // меняем для него флаг в массиве занятых элементов
    this.available--; // уменьшаем количество свободных элементов
    return item; // возвращаем элемент.
  }

  release(item) { // Маркирует элемент свободным. То есть мы освобождаем элемент.
    const index = this.items.indexOf(item); // забираем индекс элемента
    if (index < 0) throw new Error("Pool: release unexpected item"); // если его в пуле не было то ошибка
    if (this.free[index]) throw new Error("Pool: release not captured"); // если он был, но не был захвачен, ошибка.
    this.free[index] = true; // Освобождаем элемент
    this.available++; // увеличиваем количество доступных.
  }
}

// Usage

const pool = new Pool();
pool.add({ item: 1 });
pool.add({ item: 2 });
const last = { item: 3 };
pool.add(last);

for (let i = 0; i < 10; i++) {
  console.log(pool.capture());
  if (i === 5) pool.release(last);
}
