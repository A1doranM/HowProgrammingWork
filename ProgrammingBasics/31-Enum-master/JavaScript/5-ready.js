"use strict";

// Multiple Enum implementations

class Enum {}

const enumArray = values => class extends Enum {
  constructor(val) {
    super();
    this.value = this.constructor.key(val);
  }

  static get collection() {
    return values;
  }

  static has(val) {
    return values.includes(val);
  }

  static key(val) {
    return values.includes(val) ? val : undefined;
  }

  [Symbol.toPrimitive]() {
    return this.value;
  }
};

const enumCollection = values => {
  const index = {};
  for (const key in values) {
    const value = values[key];
    index[value] = key;
  }
  return class extends Enum {
    constructor(val) {
      super();
      this.value = this.constructor.key(val);
    }

    static get collection() {
      return values;
    }

    static has(val) {
      return !!(values[val] || index[val]);
    }

    static key(val) {
      const value = values[val];
      return value ? val : index[val];
    }

    [Symbol.toPrimitive](hint) {
      const value = this.value;
      if (hint === "number") return parseInt(value, 10);
      return values[value];
    }
  };
};

Enum.from = (...args) => {
  const item = args[0];
  const itemType = typeof item;
  if (itemType === "object") return enumCollection(item);
  if (itemType !== "string") return enumArray(args);
  return enumCollection(Object.assign({}, args));
};

// Example
{
  const Month = Enum.from({
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December"
  });

  console.log("Month class:");
  console.log(Month);

  console.log("\nMonth.collection:");
  console.log(Month.collection);

  if (Month.has("May")) {
    const may = new Month("May");
    console.log("\nMonth instance:", may);
  }

  console.log("\nKey for August:", Month.key("August"));
}
