"use strict";

const scalarConstant = 5;
const functionConstant = () => 6;
const callbackConstant = (f) => f(7);

const fn = (x, f, g) => {
  console.dir({ x });
  console.dir({ y: f() });
  g((z) => {
    console.dir({ z });
  });
};

fn(scalarConstant, functionConstant, callbackConstant);
