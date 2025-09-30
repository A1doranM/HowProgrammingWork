"use strict";

const namespaces = [Atomics, Math, JSON, Reflect, Intl, WebAssembly];
const output = namespaces.map(namespace => ({
  type: typeof namespace,
  namespace,
  methods: Reflect.ownKeys(namespace), // Используем Reflect чтобы забрать список ключей.
                                       // Аналогично Object.ownKeys().
}));
console.table(output);
