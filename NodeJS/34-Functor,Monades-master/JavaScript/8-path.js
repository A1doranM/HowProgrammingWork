"use strict";

// Пример когда у нас есть конфиг из которого нам надо прочитать сильно вложенный файл.

const fp = {};

fp.path = (data) => ( // Замыкаем данные из которых будем читать.
  (path) => ( // Возвращаем лямбду замыкающую путь.
    fp.maybe(path)((path) => ( // Возвращаем maybe в который кладем путь. И вызываем функцию которую возвращает maybe
      path.split(".").reduce( // Разделяем элементы пути через точку и проходим редьюсом по результату.
        (prev, key) => (prev[key] || {}), // На каждой итерации считываем следующий элемент пути, или отдаем пустой объект если элемента нету.
        (data || {}) // Начальное значение редьюса, мы либо начнем с переданных нам данных, либо если их нету то начнем с пустого объекта.
      )
    ))
  )
);

fp.maybe = (x) => (fn) => {
  console.log("Call maybe: ", x, fn);
  return fp.maybe(x && fn ? fn(x) : null)
};

// Usage

const fs = require("fs");

const config = {
  server: {
    host: {
      ip: "10.0.0.1",
      port: 3000
    },
    ssl: {
      key: {
        filename: "./8-path.js"
      }
    }
  }
};

// Imperative style

if ( // В императивном стиле надо написать кучу проверок на все случаи жизни.
  config &&
  config.server &&
  config.server.ssl &&
  config.server.ssl.key &&
  config.server.ssl.key.filename
) {
  const fileName = config.server.ssl.key.filename;
  fs.readFile(fileName, "utf8", (err, data) => {
    if (data) console.log();
  });
}

// Functional style

fp.path(config)("server.ssl.key.filename")( // А вот при помощи функтора path.
  (file) => {
    console.log("FILE: ", file);
    fs.readFile(file, "utf8", (err, data) => {
      fp.maybe(data)(console.log);
    })
  }
);
