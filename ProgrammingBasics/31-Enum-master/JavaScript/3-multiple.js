"use strict";

// Multiple Enum implementations

const EnumArray = values => class {
  constructor(val) {
    this.value = values.includes(val) ? val : undefined;
  }

  static get collection() {
    return values;
  }

  [Symbol.toPrimitive]() {
    return this.value;
  }
};

const EnumCollection = values => {
  const index = {};
  for (const key in values) {
    const value = values[key];
    index[value] = key;
  }
  return class {
    constructor(arg) {
      const value = values[arg];
      this.key = value ? arg : index[arg];
    }

    static get collection() {
      return values;
    }

    [Symbol.toPrimitive](hint) {
      const key = this.key;
      if (hint === "number") return parseInt(key, 10);
      return values[key];
    }
  };
};

const Enum = (...args) => {
  const item = args[0];
  const itemType = typeof item;
  if (itemType === "object") return EnumCollection(item);
  return EnumArray(args);
};

// Test

const testEnum = Month => {
  const neg = new Month(-1);
  const zero = new Month(0);
  const first = new Month(1);
  const april = new Month(4);
  const may = new Month("May");
  const aug = new Month("Aug");
  const august = new Month("August");
  const m11 = new Month(11);
  const m12 = new Month(12);
  const m13 = new Month(13);
  const unknown = new Month("Hello");

  console.log([
    ["-1", neg],
    ["0", zero],
    ["1", first],
    ["4", april],
    ["May", may],
    ["Aug", aug],
    ["August", august],
    ["11", m11],
    ["12", m12],
    ["13", m13],
    ["Hello", unknown]
  ]);
};

// Example 1
{
  const Month = Enum(
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  );
  console.dir(Month.collection);
  testEnum(Month);
}

// Example 2
{
  const Month  = Enum({
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
  });
  console.dir(Month.collection);
  testEnum(Month);
}

// Example 3
{
  const Month  = Enum({
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
  console.dir(Month.collection);
  testEnum(Month);
}

// Example 4
{
  const Hundreds = Enum(100, 200, 300, 400, 500);
  console.dir(Hundreds.collection);

  const neg = new Hundreds(-1);
  const zero = new Hundreds(0);
  const h100 = new Hundreds(100);
  const h300 = new Hundreds(200);
  const h500 = new Hundreds(500);
  const h600 = new Hundreds(600);
  const unknown = new Hundreds("Hello");

  console.log([
    ["-1", neg],
    ["0", zero],
    ["100", h100],
    ["200", h300],
    ["500", h500],
    ["600", h600],
    ["Hello", unknown]
  ]);
}
