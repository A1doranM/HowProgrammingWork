interface Dated {
  year: number;
}

function later<T1 extends Dated, T2 extends Dated>(a: T1, b: T2): Dated {
  if (b.year > a.year) return b;
  return a;
}

const marcus = { name: "Marcus Aurelius", year: 121, city: "Rome" };
const lucius = { name: "Lucius Verus", year: 130, city: "Rome" };
console.dir({ later: later(marcus, lucius) });

const meditations = { title: "Ad seipsum libri", year: 180 };
const discourse = { title: "Discourse on the Method", year: 1637 };
console.dir({ later: later(meditations, discourse) });

console.dir({ later: later(marcus, discourse) });
