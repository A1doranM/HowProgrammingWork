"use strict";

// Обязательно смотреть сначала README.md.

// Класс вершины графа.
class Vertex {
  constructor(graph, data) { // Вершина имеет ссылку на граф которому она принадлежит (может и не иметь).
    this.graph = graph; // Ссылка на граф.
    this.data = data; // Ссылка на данные.
    this.links = new Map(); // Коллекция вершин на которые она ссылается.
  }

  link(...args) { // Метод для связывания вершины с другими.
    const distinct = new Set(args); // Для того чтобы ссылки были уникальными, все что нам прислали кладем в Set().
    const { links } = this; // Берем ссылки которые сейчас хранятся внутри вершины
    const { keyField } = this.graph; // Берем ключевое поле это у нас у самого графа есть одно из полей по которому мы
                                     // будем идентифицировать вершины. И это поле будет браться из объектов и при
                                     // помощи этого поля мы будем обращаться к вершинам.
    for (const item of distinct) { // Проходимся по вершинам которые нам передали
      const value = item.data[keyField]; // берем из них значение при помощи keyField
      links.set(value, item); // в свою коллекцию связей устанавливаем значение и вершину к которой оно привязано.
    }
    return this;
  }
}

// Курсор который выполняет обход и запросы к графовой структуре.
class Cursor {
  constructor(vertices) {
    this.vertices = vertices;
  }

  linked(...names) { // Метод для прохода по вершинам
    const { vertices } = this; // берем вершины
    const result = new Set(); // результат
    for (const vertex of vertices) { // идем по вершинам
      let condition = true;
      for (const name of names) { // по именам
        condition = condition && vertex.links.has(name); // если есть такое имя
      }
      if (condition) result.add(vertex); // добавляем вершину в результат.
    }
    return new Cursor(result); // Возвращаем курсор по результату.
  }
}

// Сам граф.
class Graph {
  constructor(keyField) { // Устанавливаем ключевое поле по которому граф будет индексироваться
    this.keyField = keyField;
    this.vertices = new Map(); // Список вершин графа.
  }

  add(data) { // Добавляет вершины.
    const vertex = new Vertex(this, data); // Создаем экземпляр вершины
    const key = data[this.keyField]; // забираем ключ
    if (this.vertices.get(key) === undefined) { // если такой вершины еще нет
      this.vertices.set(key, vertex); // устанавливаем ее в граф по ключу.
    }
    return vertex; // Возвращаем вершину.
  }

  select(query) { // Забирает данные из графа.
    const vertices = new Set(); // Множество где мы будем хранить результаты.
    for (const vertex of this.vertices.values()) { // Проходимся по всем вершинам
      let condition = true; //
      const { data } = vertex; // Забираем данные.
      if (data) { // Если есть
        for (const field in query) { // для каждого поля
          condition = condition && data[field] === query[field]; // проверяем если в query нету неподходящих полей
        }
        if (condition) vertices.add(vertex); // если нету то сохраняем в результат.
      }
    }
    return new Cursor(vertices); // Возвращаем новый Курсор для вершин.
  }
}

// Usage

const graph = new Graph("name"); // Будем индексироваться по имени.
                                         // Значит вершины будут идентифицироваться по имени.
const marcus = graph.add({
  name: "Marcus Aurelius",
  city: "Rome",
  born: 121,
  dynasty: "Antonine",
});

const lucius = graph.add({
  name: "Lucius Verus",
  city: "Rome",
  born: 130,
  dynasty: "Antonine",
});

const pius = graph.add({
  name: "Antoninus Pius",
  city: "Lanuvium",
  born: 86,
  dynasty: "Antonine",
});

const hadrian = graph.add({
  name: "Hadrian",
  city: "Santiponce",
  born: 76,
  dynasty: "Nerva–Trajan",
});

const trajan = graph.add({
  name: "Trajan",
  city: "Sevilla",
  born: 98,
  dynasty: "Nerva–Trajan",
});

marcus.link(lucius); // Сцепливаем вершину Маркус с вершиной Луций.
lucius.link(trajan, marcus, marcus, marcus); // Люция сцепливаем с Трояном и Марком аж 3 раза, но будет добавлен только 1.
pius.link(marcus, lucius); // Пия с Марком и Люцием.
hadrian.link(trajan);
trajan.link(lucius, marcus);

console.dir({ graph }, { depth: null });

const res = graph
  .select({ city: "Rome", dynasty: "Antonine" })
  .linked("Trajan");

console.log("\nQuery result:\n");
for (const item of res.vertices) {
  console.dir(item.data);
}
