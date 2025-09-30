"use strict";

// Фабрика классов.

const logable = fields => class Logable { // Теперь на выход отдаем класс Logable.
  constructor(data) { // Конструктор.
    this.values = data;
    for (const key in fields) { // Здесь все так же.
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
  }

  toString() { // Сериализатор.
    let result = this.constructor.name + "\t";
    for (const key in fields) {
      result += this.values[key] + "\t";
    }
    return result;
  }
};

// Usage

const Person = logable({
  name: { type: "string", validate: name => name.length > 0 },
  born: { type: "number", validate: born => !(born % 1) },
});

const p1 = new Person({ name: "Marcus Aurelius", born: 121 });
console.log(p1.toString());
p1.born = 1923;
console.log(p1.born);
p1.born = 100.5;
p1.name = "Victor Glushkov";
console.log(p1.toString());
