"use strict";

// Добавляем индексирование.

const intersection = (s1, s2) => new Set([...s1].filter(v => s2.has(v)));

class Vertex {
  constructor(graph, data) {
    this.graph = graph;
    this.data = data;
    this.links = new Map();
  }

  link(...args) {
    const distinct = new Set(args);
    const { links } = this;
    const { keyField } = this.graph;
    for (const item of distinct) {
      const key = item.data[keyField];
      links.set(key, item);
    }
    return this;
  }
}

class Cursor {
  constructor(vertices) {
    this.vertices = vertices;
  }

  linked(...names) {
    const { vertices } = this;
    const result = new Set();
    for (const vertex of vertices.values()) {
      let condition = true;
      for (const name of names) {
        condition = condition && vertex.links.has(name);
      }
      if (condition) result.add(vertex);
    }
    return new Cursor(result);
  }
}

class Graph {
  constructor(keyField) {
    this.keyField = keyField;
    this.vertices = new Map();
    this.indices = new Map(); // Коллекция индексов.
  }

  add(data) {
    const vertex = new Vertex(this, data);
    const key = data[this.keyField];
    if (this.vertices.get(key) === undefined) {
      this.vertices.set(key, vertex);
    }
    return vertex;
  }

  select(query) {
    let vertices;
    const keys = Object.keys(query); // Все ключи из запроса
    for (const field of keys) { // идем по ключам
      const idx = this.indices.get(field);
      if (idx) { // Если есть индекс для данного ключа
        const value = query[field]; // читаем
        const records = idx.get(value); // читаем множество которое хранится внутри индекса
        vertices = vertices ? intersection(vertices, records) : records; // ищем пересечение из отобранных вершин и тех что у нас есть и возвращаем результат.
      } else {  // Иначе действуем по старому.
        vertices = vertices || new Set(this.vertices.values());
        for (const vertex of vertices) {
          const { data } = vertex;
          if (data[field] !== query[field]) {
            vertices.delete(vertex);
          }
        }
      }
    }
    return new Cursor(vertices);
  }

  link(from) {
    return {
      to(...destinations) {
        destinations.forEach(target => {
          if (target) from.link(target);
        });
      }
    };
  }

  insert(rows) {
    const vertices = [];
    for (const record of rows) {
      const vertex = this.add(record);
      vertices.push(vertex);
      const keys = Object.keys(record);
      for (const [key, idx] of this.indices) { // Проходимся по индексам
        if (keys.includes(key)) { // Если у нас ключ который мы ищем в тех ключах которые есть в объекте, то есть по нему надо строить индекс.
          const value = record[key]; // Читаем значение
          let records = idx.get(value); // ищем внутри индекса множество вершин у которых такое же значение как и у нашей
          if (!records) { // если нету
            records = new Set(); // создадим пустое множество
            idx.set(value, records); // добавляем нашу вершину в это множество.
          }
          records.add(vertex);
        }
      }
    }
    return vertices;
  }

  index(key) { // Говорим по какому ключу строим индекс
    let idx = this.indices.get(key);
    if (!idx) { // Если такого индекса еще нету
      idx = new Map(); // создаем новую коллекцию и добавляем в индекс
      this.indices.set(key, idx);
    }
    for (const vertex of this.vertices.values()) { // Проходимся по всем вершинам
      const value = vertex.data[key]; // забираем значение
      let records = idx.get(value); // берем запись с таким значением из индекса
      if (!records) { // если нету
        records = new Set(); // создаем новый Set
        idx.set(value, records); // сохраняем в него по значению запись.
      }
      records.add(vertex); // Или добавляем новую вершину.
    }
    return this;
  }
}

// Usage

const graph = new Graph("name").index("city");

const [marcus, lucius, pius, hadrian, trajan] = graph.insert([
  { name: "Marcus Aurelius", city: "Rome", born: 121, dynasty: "Antonine" },
  { name: "Lucius Verus", city: "Rome", born: 130, dynasty: "Antonine" },
  { name: "Antoninus Pius", city: "Lanuvium", born: 86, dynasty: "Antonine" },
  { name: "Hadrian", city: "Santiponce", born: 76, dynasty: "Nerva–Trajan" },
  { name: "Trajan", city: "Sevilla", born: 98, dynasty: "Nerva–Trajan" },
]);

graph.index("dynasty"); // Будем индексировать династию.

graph.link(marcus).to(lucius);
graph.link(lucius).to(trajan, marcus, marcus);
graph.link(pius).to(marcus, lucius);
graph.link(hadrian).to(trajan);
graph.link(trajan).to(lucius, marcus);

console.dir({ graph }, { depth: null });

const res = graph
  .select({ city: "Rome", dynasty: "Antonine" })
  .linked("Trajan");

console.log("\nQuery result:\n");
for (const item of res.vertices) {
  console.dir(item.data);
}
