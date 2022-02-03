"use strict";

// Еще один сериализатор, но теперь для каждого типа мы возвращаем специальную функцию.

let serializers = null;

const serialize = (obj) => { // Функция сериализации берущая сериализатор из коллекции.
  const type = typeof obj;
  const serializer = serializers[type]; // Забираем сериализатор в зависимости от типа.
  return serializer(obj);
};

serializers = {
  string: (s) => `${s}`,
  number: (n) => n.toString(),
  boolean: (b) => b.toString(),
  function: (f) => f.toString(),
  object: (o) => {
    if (Array.isArray(o)) return `[${o}]`;
    if (o === null) return "null";
    let s = "{";
    for (const key in o) {
      const value = o[key];
      if (s.length > 1) s += ",";
      s += key + ":" + serialize(value); // Используется непрямая рекурсия, когда из коллекции вызываем сериализатор.
    }
    // Сериализация символов.
    const symbols = Object.getOwnPropertySymbols(o); // Заберем символы из сериализуемого объекта
    for(const symbol of symbols) {
      const value = o[symbol]; // заберем значения для каждого символа
      if(s.length > 1) s += ','; // разделим значения ","
      s += symbol.toString() + ": " + serialize(value); // сериализованный символ в итоговый результат.
    }
    return s + "}";
  }
};

// Usage

const obj1 = {
  field: "Value",
  subObject: {
    arr: [7, 10, 2, 5],
    fn: (x) => x / 2
  },
  [Symbol('Aldoran')]: 123
};

console.log(serialize(obj1));
