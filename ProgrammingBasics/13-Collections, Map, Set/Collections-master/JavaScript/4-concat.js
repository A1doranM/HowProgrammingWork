"use strict";

const fs = require("fs");
const v8 = require("v8");

// Используем символ чтобы не писать в объект какие-то ключи которые потом могут быть
// перекрыты обычными строчными ключами объекта.
const SYMBOL_FILENAME = Symbol("fileName");

const hash1 = {
  key: "value",
  [SYMBOL_FILENAME]: "./file0.v8"
};

hash1.key2 = "value2";
hash1["key" + 3] = "value3";
// Здесь мы file2 перетрет file1.
hash1[SYMBOL_FILENAME] = "./file1.v8";
hash1[SYMBOL_FILENAME] = "./file2.v8";
// А вот так каждый раз будет создаваться новый символ и file3 не перетрет file2.
hash1[Symbol("fileName")] = "./file3.v8";

console.log("FileName: " + hash1[SYMBOL_FILENAME]);

for (const key in hash1) {
  const value = hash1[key];
  console.log({ key, value });
}

console.dir({ keys: Object.keys(hash1) });
console.dir({ hash1 });

const save = (collection) => fs.writeFile(
  collection[SYMBOL_FILENAME], v8.serialize(collection), () => {}
);

save(hash1);
