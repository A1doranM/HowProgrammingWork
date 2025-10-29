'use strict';

const signal = (value) => {
  const box = { value };
  const getter = () => {
    if (typeof box.value !== 'function') return box.value;
    return box.value();
  };
  getter.set = (value) => (box.value = value);
  getter.update = (callback) => (box.value = callback(box.value));
  return getter;
};

const computed = (compute) => signal(compute);

// Usage

const count = signal(100);
console.log(`Count 1: ${count()}`);

count.set(200);
console.log(`Count 2: ${count()}`);

count.update((prev) => prev + 50);
console.log(`Count 3: ${count()}`);

const num = signal(1000);

const total = computed(() => num() + count());
console.log(`Total: ${total()}`);
