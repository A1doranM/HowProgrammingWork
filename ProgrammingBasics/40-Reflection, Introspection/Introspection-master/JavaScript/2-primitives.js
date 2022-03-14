"use strict";

{
  const values = [5, Number(5), new Number(5)];
  const output = values.map(value => ({
    type: typeof value,
    ctr: value.constructor.name,
    value,
    instance: value instanceof Number,
    primitive: value.valueOf(),
    five: value === 5,
  }));
  console.table(output);
}

{
  const values = ["text", String("text"), new String("text")];
  const output = values.map(value => ({
    type: typeof value,
    ctr: value.constructor.name,
    value,
    instance: value instanceof String,
    primitive: value.valueOf(),
    text: value === "text",
  }));
  console.table(output);
}

{
  const values = [true, Boolean(true), new Boolean(true)];
  const output = values.map(value => ({
    type: typeof value,
    ctr: value.constructor.name,
    value,
    instance: value instanceof Boolean,
    primitive: value.valueOf(),
  }));
  console.table(output);
}
