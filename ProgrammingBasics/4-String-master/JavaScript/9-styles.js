"use strict";

const esc = (code, s) => `\x1b[${code}m${s}\x1b[0m`;

const tag = (strings, ...values) => {
  const result = [strings[0]];
  let i = 1;
  for (const val of values) {
    const str = strings[i++];
    result.push(esc(i + 1, val), str);
  }
  return result.join("");
};

// Usage

const greeting = "Ave";
const person = { name: "Marcus Aurelius", position: "Emperor" };

const text = tag`${greeting} ${person.position} ${person.name}!`;
console.log(text);
