"use strict";

// Как происходит оптимизация при передаче массива в функцию.
// У компилятора есть разные шаблоны на разные массивы, на массив
// small integer один шаблон, на смешанный массив другой шаблон,
// на даблы третий шаблон и т.д.

const avg = array => {
  let sum = 0;
  for (const item of array) { // В цикле компилятор зная что ему дали массив
                              // целочисленных значений применит к нему соответствующий
                              // шаблон.
    sum += item;
  }
  return sum / array.length;
};

{
  const array = [10, 20, 30, 40];
  console.dir({ array });
  console.log(avg(array));
}

{
  const array = [50, 56, 80];
  console.dir({ array });
  console.log(avg(array));
}

{
  const array = [50, 55, 80 / 7]; // Здесь будет использован шаблон для даблов.
  console.dir({ array });
  console.log(avg(array));
}
