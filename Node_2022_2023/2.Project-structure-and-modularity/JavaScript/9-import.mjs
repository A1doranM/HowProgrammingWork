// В ECMA модулях мы через импорт можем получать доступ к
// CommonJS модулям.

import { Entity, fn, collection } from "./8-export.mjs";
import m1 from "./1-export.js"; // CommonJS

console.log({ Entity, fn, collection });
console.log(m1);
