"use strict";

// Синглтон - шаблон одиночка, в целом в JS он почти бесполезен, но ниже приведен
// пример реализации его.

function Singleton() {
  const { instance } = Singleton; // Забираем инстанс синглтона.
  if (instance) return instance; // Если никто до этого инстанс не создавал.
  Singleton.instance = this; // Создаем его.
  // Таким образом каждый раз мы будем возвращать один
  // и тот же инстанс.
}

// Usage

console.assert(new Singleton() === new Singleton());
console.log("instances are equal");

// But instance is accessible

const a1 = new Singleton();
Singleton.instance = null;
console.log("Remove instance");
const a2 = new Singleton();
if (a1 !== a2) console.log("a1 !== a2");
