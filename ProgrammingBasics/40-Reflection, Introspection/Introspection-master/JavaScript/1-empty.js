"use strict";

const values = [null, undefined,,];

console.dir({ values });

for (const value of values) {
  console.dir({ type: typeof value, value });
}
