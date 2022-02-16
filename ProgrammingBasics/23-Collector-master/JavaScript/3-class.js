"use strict";

// Коллектор на классах.

class Collector {
  constructor(expected) { // number or array of string, count or keys
    this.expectKeys = Array.isArray(expected) ? new Set(expected) : null; // Если мы дали ему массив с ожидаемыми ключами то мы их сохраняем в Сет.
    this.expected = this.expectKeys ? expected.length : expected; // Флаг. Если передали не массив ключей то значит передали их количество.
    this.keys = new Set(); // Множество ключей.
    this.count = 0; // Количество собранных ключей.
    this.timer = null; // Таймер для того чтобы можно было отменить таймаут.
    this.doneCallback = () => {}; // Обработчик на завершение.
    this.finished = false; // Отданы ли результаты через doneCallback.
    this.data = {};
  }

  collect(key, err, value) { // Кладет значение в коллектор, или ошибку если есть.
    if (this.finished) return this;  // Если коллектор завершил прием данных просто отдаем его.
    if (err) {  // Если передали ошибку
      this.finalize(err, this.data); // заканчиваем работу
      return this; // возвращаем коллектор.
    }
    if (!this.keys.has(key)) { // Если нету такого ключа
      this.count++; // увеличиваем количество ключей в коллекторе
    }
    this.data[key] = value; // сохраняем значение по ключу
    this.keys.add(key); // сохраняем ключ в коллекцию.
    if (this.expected === this.count) { // Если ожидаемое количество ключей равно количеству собранных
      this.finalize(null, this.data); // завершаем работу.
    }
    return this;
  }

  pick(key, value) { // Кладет значение в коллекцию но без ошибки.
    this.collect(key, null, value);
    return this;
  }

  fail(key, err) { // Кладет значение в коллекцию но теперь мы кладем туда ошибку.
    this.collect(key, err);
    return this;
  }

  take(key, fn, ...args) { // Забираем из коллекции.
    fn(...args, (err, data) => {
      this.collect(key, err, data);
    });
    return this;
  }

  timeout(msec) { // Устанавливаем таймаут на получение данных.
    if (this.timer) { // Если кто-то устанавливал таймер до этого
      clearTimeout(this.timer); // очищаем его
      this.timer = null;
    }
    if (msec > 0) {
      this.timer = setTimeout(() => { // Создаем новый таймер.
        const err = new Error("Collector timed out");
        this.finalize(err, this.data);
      }, msec);
    }
    return this;
  }

  done(callback) { // Устанавливаем коллбэк на завершение сбора данных.
    this.doneCallback = callback;
    return this;
  }

  finalize(err, data) { // Внутренний метод, заканчивает работу коллектора.
    if (this.finished) return this; // Если уже завершили работу, отдаем коллектор.
    if (this.doneCallback) { // Если есть коллбэк.
      if (this.timer) { // Если есть таймер.
        clearTimeout(this.timer); // Очищаем таймаут
        this.timer = null; // и таймер.
      }
      this.finished = true; // Устанавливаем флаг завершения
      this.doneCallback(err, data); // вызываем коллбэк отдавая ему ошибку и данные.
    }
    return this;
  }
}

const collect = (expected) => new Collector(expected); // Делаем фабрику коллекторов.

// Collect

const collector = collect(3) // Ожидаем получение трех ключей
  .timeout(1000) // не дольше одной секунды
  .done((err, result) => { // устанавливаем коллбэк на завершение
    console.dir({ err, result });
  });

const sourceForKey3 = (arg1, arg2, callback) => {
  console.dir({ arg1, arg2 });
  callback(null, "key3");
};

collector.collect("key1", null, 1); //
collector.pick("key2", 2);
collector.take("key3", sourceForKey3, "arg1", "arg2");
