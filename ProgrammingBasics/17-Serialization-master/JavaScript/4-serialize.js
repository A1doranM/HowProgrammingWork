"use strict";

const serialize = (obj) => {
  const type = typeof obj;
  if (obj === null) return "null";
  else if (type === "string") return `"${obj}"`;
  else if (type === "number") return obj.toString();
  else if (type === "boolean") return obj.toString();
  else if (type !== "object") return obj.toString();
  else if (Array.isArray(obj)) {
    return `[${obj}]`;
  } else {
    let s = "{";
    for (const key in obj) {
      const value = obj[key];
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
