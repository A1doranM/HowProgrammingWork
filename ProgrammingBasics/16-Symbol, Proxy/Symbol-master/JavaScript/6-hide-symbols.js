"use strict";

const hideSymbol = (obj, symbol) => {
  obj = {
    realObj: Object.assign(obj),
    simulateSecretField: undefined,
  };
  obj = new Proxy(obj, {
    ownKeys: (target) => {
      if (symbol in target.realObj) {
        let properties = Reflect.ownKeys(target.realObj);
        const indexField = properties.indexOf(symbol);
        properties.splice(indexField, 1);
        if (target.simulateSecretField) {
          properties = properties.concat(symbol);
        }
        return properties;
      } else {
        return Reflect.ownKeys(target);
      }
    },

    get: (target, property) => {
      if (property === symbol && target.simulateSecretField) {
        return target.simulateSecretField;
      }
      if (property === symbol && target.simulateSecretField === undefined) {
        return undefined;
      }
      return target.realObj[property];
    },

    set: (target, property, value) => {
      if (property === symbol) {
        return Reflect.set(target, "simulateSecretField", value);
      } else {
        return Reflect.set(target.realObj, property, value);
      }
    },

    getOwnPropertyDescriptor: (target, property) => {
      if (property === symbol && target.simulateSecretField) {
        return Object.getOwnPropertyDescriptor(target, "simulateSecretField");
      }
      if (property === symbol && target.simulateSecretField === undefined) {
        return undefined;
      }
      return Reflect.getOwnPropertyDescriptor(target.realObj, property);
    },

    enumerate: (target) => target.keys[Symbol.iterator],

    deleteProperty(target, property) {
      if (property !== symbol) {
        delete target.realObj[property];
      } else if (property === symbol && target.simulateSecretField) {
        target.simulateSecretField = undefined;
      }
      return true;
    },
  });
  return obj;
};

module.exports = hideSymbol;
