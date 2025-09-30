"use strict";

// Простой движок для бенчмаркинг при помощи bigint.

const benchmark = {};
module.exports = benchmark;

const PRE_COUNT = 10000;

// Константы оптимизации. В старых версиях ноды.
const OPT_STATUS = [
  /* 0 */ "unknown", // Неизвестно оптимизирована, или нет.
  /* 1 */ "opt", // Оптимизирована.
  /* 2 */ "not opt",
  /* 3 */ "always opt",
  /* 4 */ "never opt",
  /* 5 */ "unknown",
  /* 6 */ "maybe deopt",
  /* 7 */ "turbofan opt"
];

// Новые константы оптимизации используют биты.
const OPT_BITS = [
  /*  1 */ "function",
  /*  2 */ "never", // никогда не оптимизируется
  /*  4 */ "always", // всегда
  /*  8 */ "maybe", // еще нет но может
  /* 16 */ "opt", // может быть оптимизирована интерпритатором, или оптимизатором
  /* 32 */ "turbofan", // оптимизирована турбофаном
  /* 64 */ "interp" // оптимизирована интерпретатором
];

const status = fn => %GetOptimizationStatus(fn); // Чтобы заработало надо написать --allow-native-syntax при старте процесса.

const opt = fn => { // Превращаем статус в человекочитаемое значение.
  const optStatus = status(fn);
  const results = [];
  OPT_BITS.forEach((name, n) => { // Идем по битам и проверяем какие статусы выставлены.
    if (n === 0) return;
    if (Math.pow(2, n) & optStatus) results.push(name);
  });
  return results.length ? results.join(", ") : "no preopt,";
}

const optimize = fn => %OptimizeFunctionOnNextCall(fn); // Вручную вызываем оптимизацию для функции.

const rpad = (s, char, count) => (s + char.repeat(count - s.length));
const lpad = (s, char, count) => (char.repeat(count - s.length) + s);

// Разница в процентах скорости между функциями.
const relativePercent = (best, time) => (time * 100n / best) - 100n;

console.log("\nname time (nanoseconds) status: begin opt heat loop\n");

// Вызвать тесты заданное кол-во раз.
benchmark.do = (count, tests) => {
  const times = tests.map(fn => {
    if (global.gc) gc(); // Если сборка мусора отключена при помощи флага, перед тестом
                         // вызываем сборку мусора.
    const result = [];
    const optBefore = opt(fn); // Вызываем функцию без оптимизации.
    optimize(fn); // Вызываем для нее оптимизатор
    fn(); // функция оптимизируется после вызова, поэтому вызываем ее.
    const optAfter = opt(fn); // ПОлучаем статус оптимизации
    for (let i = 0; i < PRE_COUNT; i++) result.push(fn()); // прогреваем функцию
    const optAfterHeat = opt(fn); // статус после прогрева
    const begin = process.hrtime.bigint(); // Засекаем начало теста. Вернуть hrtime как bigint.
    for (let i = 0; i < count; i++) result.push(fn()); // Проводим тест сохраняя результаты
    const end = process.hrtime.bigint(); // засекаем конец теста.
    const optAfterLoop = opt(fn); // Статус после теста.
    const diff = end - begin; // Находим разницу.
    // Сохраняем результаты.
    const name = rpad(fn.name, ".", 22);
    const iterations = result.length - PRE_COUNT;
    const log = [
      name, diff, optBefore, optAfter, optAfterHeat, optAfterLoop
    ];
    console.log(log.join(" "));
    return { name, time: diff };
  });
  console.log();
  console.log(times);
  const top = times.sort((t1, t2) => t1.time > t2.time ? 1 : -1);
  const best = top[0].time;
  times.forEach(test => { // Сортируем результаты и выводим процент.
    test.percent = relativePercent(best, test.time);
    const time = lpad(test.time.toString(), ".", 10);
    const percent = test.percent === 0 ? "min" : test.percent + "%";
    const line = lpad(percent, ".", 10);
    console.log(test.name + time + line);
  });
};
