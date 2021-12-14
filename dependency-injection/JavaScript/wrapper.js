"use strict";

const wrapFunction = (key, fn) => {
  console.log(`Wrap function: ${key}`);
  return (...args) => {
    console.log(`Called wrapper for: ${key}`);
    console.dir({ args });
    if (args.length > 0) { // check if callback exists;
      let callback = args[args.length - 1]; // for this get last argument from args;
      if (typeof callback === "function") { // if it function;
        args[args.length - 1] = (...args) => { // replace call back with our function and then run callback;
          console.log(`Callback: ${key}`);
          callback(...args);
        };
      } else { // if not callback write null;
        callback = null;
      }
    }
    console.log(`Call: ${key}`);
    console.dir(args);
    const result = fn(...args);
    console.log(`Ended wrapper for: ${key}`);
    console.dir({ result });
    return result;
  };
};

const cloneInterface = anInterface => {
  const clone = {};
  for (const key in anInterface) {
    const fn = anInterface[key];
    clone[key] = wrapFunction(key, fn);
  }
  return clone;
};

module.exports = { cloneInterface,  wrapFunction };