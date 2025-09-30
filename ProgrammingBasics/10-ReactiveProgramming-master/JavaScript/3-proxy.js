"use strict";

// Реактивная таблица. Вариант с прокси.

const ROWS = 5; // Строки электронной таблицы.
const columns = ["A", "B", "C", "D", "E", "F"]; // Колонки.
const data = {}; // Таблица.

const table = new Proxy(data, {  // Все запросы и установки свойств проходят через прокси.
  get(obj, key) {
    console.log("get", key);
    const cell = obj[key]; // Берем запрошенное свойство.
    return cell ? cell.value : "";
  },
  set(obj, key, value) {
    console.log("set", key, value);
    const type = typeof value; // Берем тип устанавливаемого значения.
    if (type === "function") { // Если функция
      const expression = value; // переложим в константу,
      value = expression(); // подсчитаем,
      obj[key] = { value, expression }; // сохраним значение и функцию которая его подсчитала.
    } else { // Если не функция
      obj[key] = { value }; // сохраняем значение.
    }
    return true; // На выходи из set в прокси надо вернуть флаг успешна ли операция true / false.
  }
});

// Usage

table.A1 = "city";
table.B1 = "population";
table.C1 = "area";
table.D1 = "density";
table.E1 = "country";
table.F1 = "relative";

table.A2 = "Shanghai";
table.B2 = 24256800;
table.C2 = 6340;
table.D2 = 3826;
table.E2 = "China";

table.A3 = "Beijing";
table.B3 = 21516000;
table.C3 = 16411;
table.D3 = 1311;
table.E3 = "China";

table.A4 = "Delhi";
table.B4 = 16787941;
table.C4 = 1484;
table.D4 = 11313;
table.E4 = "India";

table.D5 = () => Math.max(table.D2, table.D3, table.D4);

table.F2 = () => Math.round(table.D2 * 100 / table.D5) + "%";
table.F3 = () => Math.round(table.D3 * 100 / table.D5) + "%";
table.F4 = () => Math.round(table.D4 * 100 / table.D5) + "%";

const output = [];

for (let i = 2; i <= ROWS; i++) {
  const row = {};
  output[i] = row;
  for (const col of columns) {
    row[col] = table[col + i];
  }
}

console.table(output);
