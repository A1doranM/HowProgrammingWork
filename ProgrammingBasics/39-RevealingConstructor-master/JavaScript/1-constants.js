"use strict";

// Открытый конструктор позволяет переопределять функциональность
// объекта при помощи передачи этой самой функциональности
// в конструктор.

// Здесь мы передаем константы разными способами в функцию.

const scalarConstant = 5; // Как число.
const functionConstant = () => 6; // Как функцию.
const callbackConstant = (f) => f(7); // Как коллбэк.

const fn = (x, f, g) => {
  console.dir({ x });
  console.dir({ y: f() });
  g((z) => {
    console.dir({ z });
  });
};

fn(scalarConstant, functionConstant, callbackConstant);
