"use strict";

// Иногда оптимизация еще применяется к глобальным свойствам хоть это и
// не самый лучший способ оптимизации. Так происходит

global.x = 0;

const main = () => {

  const incGlobalX = () => {
    ++x;
  };

  for (let i = 0; i < 1000000; i++) {
    incGlobalX();
  }

};

main();
console.log(x);
