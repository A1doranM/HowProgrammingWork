'use strict';

const { signal, computed, effect } = require('@preact/signals-core');

const count = signal(100);
const double = computed(() => count.value * 2);
console.log({
  initial: {
    count: count.value,
    double: double.value,
  },
});

const dispose = effect(() => {
  console.log({
    count: count.value,
    double: double.value,
  });
});

count.value = 200;
count.value = 300;
dispose();
count.value = 400;
