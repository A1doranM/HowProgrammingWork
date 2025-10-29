'use strict';

const signal = (value) => {
  const effects = new Set();
  const box = { value };
  const getter = () => {
    if (signal.refs) signal.refs.push(effects);
    if (typeof box.value !== 'function') return box.value;
    return box.value();
  };
  getter.set = (value) => {
    box.value = value;
    for (const execute of effects) execute();
  };
  return getter;
};

const computed = (compute) => signal(compute);

const effect = (execute) => {
  const refs = [];
  signal.refs = refs;
  execute();
  for (const ref of refs) ref.add(execute);
  signal.refs = null;
  return () => {
    for (const ref of refs) ref.delete(execute);
  };
};

// Usage

const count = signal(100);
const double = computed(() => count() * 2);
console.log({ initial: { count: count(), double: double() } });

const dispose = effect(() => {
  console.log({ count: count(), double: double() });
});

count.set(200);
count.set(300);
dispose();
count.set(400);
