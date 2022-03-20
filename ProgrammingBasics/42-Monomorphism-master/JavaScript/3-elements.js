"use strict";

// Пример с массивами. Суть такая, лучше пхать в массив элементы одного типа
// тогда компилятор подберет для них всех один тип и адекватно раскидает
// все это в памяти.

{ // PACKED_SMI_ELEMENTS
  const array = [1, 2, 3]; // number[] smi[]
  console.log(array);
}

{ // PACKED_DOUBLE_ELEMENTS
  const array = [1, 2, 3, 4 / 3]; // double[] Если хоть один элемент будет дабл
                                  // все элементы массива будут храниться в типе
                                  // дабл.
  console.log(array);
}

{ // PACKED_DOUBLE_ELEMENTS
  const array = [1, 2, 3]; // smi[] // Вначале был массив целочисленных значений
  array.push(4 / 3); // smi[] -> double[] // засунули дабл. После такого финта
                                          // компилятор создаст новый массив типа
                                          // дабл и в него запишет все числа. Это долго.
  // [1.0, 2.0, 3.0, 1.3333333333333333]
  console.log(array);
}

{ // PACKED_ELEMENTS
  const array = [1, 2, 3, "hello"]; // object[] // Сразу массив разнотипной фигни
  // [Number(1), Number(2), Number(3), String("hello")] // все будет храниться как объекты.
  console.log(array);
}

{ // PACKED_ELEMENTS
  const array = [1, 2, 3]; // smi[]
  array.push("hello"); // smi[] -> object[]
  // [Number(1), Number(2), Number(3), String("hello")]
  console.log(array);
}

{ // HOLEY_SMI_ELEMENTS
  const array = [1, 2, 3,,, 4];
  console.log(array);
}

{ // HOLEY_SMI_ELEMENTS
  const array = [1, 2, 3];
  array[100] = 4; // smi[] -> holey smi[]
  console.log(array);
}

{ // HOLEY_DOUBLE_ELEMENTS
  const array = [1, 2, 3,,, 4 / 3];
  console.log(array);
}

{ // HOLEY_DOUBLE_ELEMENTS
  const array = [1, 2, 3];
  array[100] = 4 / 3; // smi[] -> holey double[]
  console.log(array);
}

{ // HOLEY_ELEMENTS
  const array = [1, 2, 3,,, "hello"]; // object[]
  // [Number(1), Number(2), Number(3), <2 empty items>, String("hello")]
  console.log(array);
}

{ // HOLEY_ELEMENTS
  // Здесь добавив значение в сразу сотый индекс компилятор, во первых боксирует
  // все объектами, а во вторых заполнит все индексы специальными пустыми элементами.
  const array = [1, 2, 3]; // smi[]
  array[100] = "hello"; // smi[] -> holey object[]
  // [Number(1), Number(2), Number(3), <97 empty items>, String("hello")]
  console.log(array);
}
