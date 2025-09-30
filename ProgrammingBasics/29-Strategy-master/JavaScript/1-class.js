"use strict";

// Паттерн стратегия используется для выбора взаимозаменяемого поведения.
// Например у нас есть несколько алгоритмов делающих что-то очень похожее, но с разными типами данных
// тогда применив этот паттерн мы можем выбирать какой алгоритм лучше использовать для конкретного набора данных.
// Или у нас есть несколько БД, и работающие с ними модули, а стратегия выбирает модуль под конкретную БД.

// Еще хороший пример стратегии это метод sort() который ничего не знает о данных но он ожидает функцию для
// сортировки делающую неважно что но которая должна выдать булеановский результат на выход,
// этот пример описан в 4 файле.

// Пример ниже использует различные рендереры для вывода табличной информации на в разные источники
// Делаем абстрактный класс Рендерер. В JS нету абстрактных классов поэтому мы просто делаем класс
// с методом который будет ругаться если его не имплементировать и дальше наследуемся от него.
class Renderer {
  render() {
    throw new Error("Not implemented");
  }
}

// Рендер в консоль.
class ConsoleRenderer extends Renderer {
  render(data) {
    console.table(data);
  }
}

class WebRenderer extends Renderer {
  render(data) {
    const keys = Object.keys(data[0]);
    const line = (row) => "<tr>" +
      keys.map((key) => `<td>${row[key]}</td>`).join("") +
      "</tr>";
    const output = [
      "<table><tr>",
      keys.map((key) => `<th>${key}</th>`).join(""),
      "</tr>",
      data.map(line).join(""),
      "</table>",
    ];
    console.log(output.join(""));
  }
}

class MarkdownRenderer extends Renderer {
  render(data) {
    const keys = Object.keys(data[0]);
    const line = (row) => "|" +
      keys.map((key) => `${row[key]}`).join("|") + "|\n";
    const output = [
      "|", keys.map((key) => `${key}`).join("|"), "|\n",
      "|", keys.map(() => "---").join("|"), "|\n",
      data.map(line).join(""),
    ];
    console.log(output.join(""));
  }
}

// Стратегия которая принимает на вход рендерер и отдает на выход метод process
// который осуществляет рендер.
class Context {
  constructor(renderer) {
    this.renderer = renderer;
  }

  process(data) {
    return this.renderer.render(data);
  }
}

// Usage

const non = new Context(new Renderer());
const con = new Context(new ConsoleRenderer());
const web = new Context(new WebRenderer());
const mkd = new Context(new MarkdownRenderer());

const persons = [
  { name: "Marcus Aurelius", city: "Rome", born: 121 },
  { name: "Victor Glushkov", city: "Rostov on Don", born: 1923 },
  { name: "Ibn Arabi", city: "Murcia", born: 1165 },
  { name: "Mao Zedong", city: "Shaoshan", born: 1893 },
  { name: "Rene Descartes", city: "La Haye en Touraine", born: 1596 },
];

console.group("Abstract Strategy:");
non.process(persons);
console.groupEnd();

console.group("\nConsoleRenderer:");
con.process(persons);
console.groupEnd();

console.group("\nWebRenderer:");
web.process(persons);
console.groupEnd();

console.group("\nMarkdownRenderer");
mkd.process(persons);
console.groupEnd();
