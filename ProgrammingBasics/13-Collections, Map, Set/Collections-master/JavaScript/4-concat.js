"use strict";

const fs = require("fs");
const v8 = require("v8");

const SYMBOL_FILENAME = Symbol("fileName");

const hash1 = {
  key: "value",
  [SYMBOL_FILENAME]: "./file0.v8"
};

hash1.key2 = "value2";
hash1["key" + 3] = "value3";
hash1[SYMBOL_FILENAME] = "./file1.v8";
hash1[SYMBOL_FILENAME] = "./file2.v8";
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
