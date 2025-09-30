"use strict";

// Динамическое создание на прототипах.

const logable = (fields) => {

  function Logable(data) {
    this.values = data;
  }

  for (const key in fields) { // В для полей добавляем геттеры и сеттеры.
    Object.defineProperty(Logable.prototype, key, {
      get() {
        console.log("Reading key:", key);
        return this.values[key];
      },
      set(value) {
        console.log("Writing key:", key, value);
        const def = fields[key];
        const valid = (
          typeof value === def.type &&
          def.validate(value)
        );
        if (valid) this.values[key] = value;
        else console.log("Validation failed:", key, value);
      }
    });
  }

  Logable.prototype.toString = function() {
    let result = this.constructor.name + ": ";
    for (const key in fields) {
      result += this.values[key] + " ";
    }
    return result;
  };

  return Logable;

};

// Usage

const Person = logable({
  name: { type: "string", validate: (name) => name.length > 0 },
  born: { type: "number", validate: (born) => !(born % 1) },
});

const p1 = new Person({ name: "Marcus Aurelius", born: 121 });
console.log(p1.toString());
p1.born = 1923;
console.log(p1.born);
p1.born = 100.5;
p1.name = "Victor Glushkov";
console.log(p1.toString());
