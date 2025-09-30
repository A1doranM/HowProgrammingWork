"use strict";

// Фабрика прототипов.

const logable = fields => { // Фабрика получает на вход поля.

  function Logable(data) { // Конструктор который создает каждый раз
    this.values = data; // новый экзепляр Loggable, c данными.
  }

  for (const key in fields) { // Проходим по переданным полям.
    Object.defineProperty(Logable.prototype, key, { // Запихиваем в прототип поля.
      get() { // Создаем для каждого поля getter и setter.
        console.log("Reading key:", key);
        return this.values[key];
      },
      set(value) {
        console.log("Writing key:", key, value);
        const def = fields[key]; // Забираем из коллекции полей нужную запись.
        const valid = ( // Валидируем значение.
          typeof value === def.type &&
          def.validate(value)
        );
        if (valid) this.values[key] = value; // Если валидация прошла то сохраняем значение по ключу.
        else console.log("Validation failed:", key, value);
      }
    });
  }

  Logable.prototype.toString = function() { // Сериализатор.
    let result = this.constructor.name + ": ";
    for (const key in fields) {
      result += this.values[key] + " ";
    }
    return result;
  };

  return Logable; // Возвращаем новый созданный прототип.

};

// Usage

const Person = logable({ // Фабрика объектов с полями и их валидаторами.
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
