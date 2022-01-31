// Пример с импортом модуля фишка с Singleton-ом работает и с ними.

import { Entity, fn, collection } from "./8-export.mjs";
import m1 from "./1-export.js";

console.log({ Entity, fn, collection });
console.log(m1);
