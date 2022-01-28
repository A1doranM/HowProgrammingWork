"use strict";

// Use list and chaining syntax to build sequence

// Пример с созданием цепи исполнения функций.

// Строим двух связный список.
const chain = (prev = null) => {
  console.log("Create element");
  const cur = () => { // Создаем функцию которая возвращается из метода chain.
                      // Функция начинает рекурсивно итерироваться в обратном порядке. И связывать односвязный список
                      // в двух связный. Это делается для того, чтобы нам надо будет исполнить всю цепочку
                      // мы могли начать ее исполнение в том порядке в котором нам передавались функции, если этого не
                      // сделать то у всех функций есть ссылка только на предыдущий элемент и поэтому вызывать мы можем
                      // их лишь с конца в начало.
    console.log("Reverse from " + (cur.fn ? cur.fn.name : "null"));
    if (cur.prev) { // Если есть предыдущий элемент
      cur.prev.next = cur; // добавляем ему ссылку на следующий элемент
      cur.prev(); // как только дошли в начало списка
    } else {
      cur.forward(); // вызываем форвард и начинается вызов функций в прямом порядке.
    }
  };
  cur.prev = prev; // К этой функции примешиваем prev который нам приходит.
  cur.fn = null; // У функция которая будет навешана на элемент.
  cur.args = null; // Аргументы этой функции.
  cur.do = (fn, ...args) => { // Метод do добавляет новую функцию в список,
                              // первый аргумент это функция, второй это аргументы.
    cur.fn = fn; // Сохраняем переданную функцию.
    cur.args = args; // Сохраняем аргументы.
    return chain(cur); // Рекурсивно вызвали chain передав функцию cur и в итоге chain начнется с начала создав новый
                      // элемент двух связного списка.
  };
  cur.forward = () => { // Функция которая будет проходить по двухсвязному с писку начина
    console.log("Forward");
    if (cur.fn) cur.fn(...cur.args, (err, data) => { // Если у текущего элемента есть функция. Вызовем ее с
                                                    // текущими аргументами
      console.log("Callback from " + cur.fn.name);
      console.dir({ data });
      if (!err && cur.next) cur.next.forward(); // проверяем если не было ошибки и есть следующий элемент списка
                                                // вызываем метод forward у него.
      else console.log("End at " + cur.fn.name);
    });
  };
  return cur;
};

// Emulate asynchronous calls

const wrapAsync = (fn) => (...args) => setTimeout(
  () => fn(...args), Math.floor(Math.random() * 1000)
);

// Asynchronous functions

const readConfig = wrapAsync((name, callback) => {
  console.log("(1) config loaded");
  callback(null, { name });
});

const selectFromDb = wrapAsync((query, callback) => {
  console.log("(2) SQL query executed");
  callback(null, [{ name: "Kiev" }, { name: "Roma" } ]);
});

const getHttpPage = wrapAsync((url, callback) => {
  console.log("(3) Page retrieved");
  callback(null, "<html>Some archaic web here</html>");
});

const readFile = wrapAsync((path, callback) => {
  console.log("(4) Readme file loaded");
  callback(null, "file content");
});

// Usage

const startChain = chain()
  .do(readConfig, "myConfig")
  .do(selectFromDb, "select * from cities")
  .do(getHttpPage, "http://kpi.ua")
  .do(readFile, "README.md");

startChain();
