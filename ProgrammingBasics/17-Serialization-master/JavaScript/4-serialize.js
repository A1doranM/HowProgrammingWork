"use strict";

// Свой собственный сериализатор.

const serialize = (obj) => {
  const type = typeof obj;
  if (obj === null) return "null";
  else if (type === "string") return `"${obj}"`;
  else if (type === "number") return obj.toString();
  else if (type === "boolean") return obj.toString();
  else if (type !== "object") return obj.toString();
  else if (Array.isArray(obj)) {
    return `[${obj}]`;
  } else { // Если есть вложенная структура
    let s = "{";
    for (const key in obj) { // проходим по полям
      const value = obj[key]; // забираем значение из поля
      if (s.length > 1) s += ","; // разделяем значения запятыми
      s += key + ":" + serialize(value); // рекурсивно вызываем сериалайз для значения по ключу.
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
  }
};

console.log(serialize(obj1));
