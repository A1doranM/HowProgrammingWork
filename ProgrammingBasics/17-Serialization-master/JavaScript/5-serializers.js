"use strict";

let serializers = null;

const serialize = (obj) => {
  const type = typeof obj;
  const serializer = serializers[type];
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
      s += key + ":" + serialize(value);
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
