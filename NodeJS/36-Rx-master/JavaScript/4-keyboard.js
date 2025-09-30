
cursors.subscribe((cursor) => { // Подписываемся на стрим курсора.
  console.dir({ cursor });"use strict";

// Пример где мы считываем символы с клавиатуры.

  const { Observable } = require("rxjs");
  const operators = require("rxjs/operators");
  const { map, filter, take, reduce } = operators;
  const { debounceTime, throttleTime } = operators;

// Переводим поток в rawMode (читаем доку).
  process.stdin.setRawMode(true);

// Keyboard stream
// Создаем Observable для клавиатуры.
  const keyboard = new Observable((subscriber) => {
    process.stdin.on("data", (data) => {
      subscriber.next(data);
    });
  });

// Подписываемся на поток от клавиатуры.
  keyboard.subscribe((data) => {
    console.log("---");
    console.dir({ keyboard: data });
  });

// Cursors

  const arrows = {
    65: "🡅",
    66: "🡇",
    67: "🡆",
    68: "🡄",
  };

// Делаем еще один стрим в который будем запихивать только стрелочки.
  const cursors = keyboard.pipe(
    filter((buf) => (buf[0] === 27) && (buf[1] === 91)), // Если буфер начинается с ескейп символа и первый байт это ескейп последовательность 91 которая генерируется если нажимать стрелочки
    map((buf) => buf[2]), // то во втором байте будет какая-то стрелочка
    map((key) => arrows[key]), // преобразуем сканкод клавиши (65, 67, и т.д.) в стикер стрелочки
    //throttleTime(1000), // не даем нажимать курсоры чаще чем раз в секунду
    debounceTime(2000), // сначала ждет 2с. если за это время ничего не пришло отправляется последнее событие,
    // если что-то произошло то уже это отправится, а если постоянно генерировать события
    // то вообще ничего не отправится, и отправится только после того как пройдет 2 секунды
    // с момента последнего события.
  );

});

// Keypress

const keypress = keyboard.pipe(map((buf) => buf[0])); // Из keyboard стрима достаем keypress где у нас будут храниться все первые символы из буфера.

keypress.subscribe((key) => { // Обрабатываем все нажатия букв.
  console.dir({ keypress: key });
});

// Take first 5 chars

const take5 = keypress.pipe(
  take(5),
  map((key) => String.fromCharCode(key)), // Код буквы из чаркода преобразуем в символ.
  reduce((acc, char) => acc + char) // Склеим их в одну строку.
);

take5.subscribe((s) => {
  console.dir({ take5: s });
});

// Exit / Ctrl+C
// Обрабатываем выход по нажатию ctrl+c
keypress
  .pipe(filter((x) => x === 3)) // сканкод ctrl+c
  .subscribe(process.exit.bind(null, 0)); // вызываем завершение процесса.
