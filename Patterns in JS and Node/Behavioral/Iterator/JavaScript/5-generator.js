'use strict';

const gen = function* () {
  let i = 0;
  while (true) {
    if (i >= 3) return;
    yield i++;
  }
};

{
  const iterable = gen();
  const iterator = iterable[Symbol.iterator]();
  const step1 = iterator.next();
  const step2 = iterator.next();
  const step3 = iterator.next();
  const step4 = iterator.next();
  console.log({ step1, step2, step3, step4 });
}

{
  const iterable = gen();
  for (const step of iterable) {
    console.log({ step });
  }
}

{
  const iterable = gen();
  console.log({ steps: [...iterable] });
}
