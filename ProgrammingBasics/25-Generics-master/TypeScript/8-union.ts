class Person {
  name: string;
  year: number;
  city: string;
}

class Book {
  title: string;
  year: number;
}

type Comparable = Person | Book;

function later(a: Comparable, b: Comparable): Comparable {
  if (b.year > a.year) return b;
  return a;
}

const marcus: Person = { name: "Marcus Aurelius", year: 121, city: "Rome" };
const lucius: Person = { name: "Lucius Verus", year: 130, city: "Rome" };
console.dir({ later: later(marcus, lucius) });

const meditations: Book = { title: "Ad seipsum libri", year: 180 };
const discourse: Book = { title: "Discourse on the Method", year: 1637 };
console.dir({ later: later(meditations, discourse) });

console.dir({ later: later(meditations, marcus) });
