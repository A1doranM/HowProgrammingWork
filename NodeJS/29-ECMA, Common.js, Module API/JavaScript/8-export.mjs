// ECMA модули в NodeJS должны находиться в файлах mjs.
// Из CommonJS модуля нельзя загружать ECMA модули при помощи require(),
// а вот при помощи import можно загружать и те и те.
// Впрочем модуль можно пропатчить и дать ему возможность так загружаться.

class Entity {}

const fn = x => x;

const collection = new Map();

// module.exports = { Entity, fn, collection };
export { Entity, fn, collection };
